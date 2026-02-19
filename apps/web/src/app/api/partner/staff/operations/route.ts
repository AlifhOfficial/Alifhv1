/**
 * Partner Staff Operations API
 * POST - Update, suspend, activate, or remove staff
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  updateStaffMember,
  suspendStaffMember,
  activateStaffMember,
  removeStaffMember,
  db,
  partnerStaff,
  eq,
  and,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


// Helper: Check if operation would leave partner with no owners
async function wouldLeaveNoOwners(
  partnerId: string, 
  staffId: string, 
  operation: 'demote' | 'suspend' | 'remove'
): Promise<boolean> {
  // Count active owners excluding the target staff member
  const otherOwners = await db
    .select({ id: partnerStaff.id })
    .from(partnerStaff)
    .where(
      and(
        eq(partnerStaff.partnerId, partnerId),
        eq(partnerStaff.role, 'owner'),
        eq(partnerStaff.status, 'active')
      )
    );
  
  // Check if the target is currently an owner
  const [targetStaff] = await db
    .select({ role: partnerStaff.role, status: partnerStaff.status })
    .from(partnerStaff)
    .where(eq(partnerStaff.id, staffId))
    .limit(1);
  
  if (!targetStaff) return false;
  
  // If target is not an owner or not active, this operation won't affect owner count
  if (targetStaff.role !== 'owner' || targetStaff.status !== 'active') {
    return false;
  }
  
  // If there's only 1 owner (the target), operation would leave no owners
  return otherOwners.length <= 1;
}

const updateStaffSchema = z.object({
  operation: z.literal('update'),
  staffId: z.string(),
  role: z.enum(['owner', 'admin', 'sales', 'viewer']).optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  isPrimaryContact: z.boolean().optional(),
});

const suspendStaffSchema = z.object({
  operation: z.literal('suspend'),
  staffId: z.string(),
});

const activateStaffSchema = z.object({
  operation: z.literal('activate'),
  staffId: z.string(),
});

const removeStaffSchema = z.object({
  operation: z.literal('remove'),
  staffId: z.string(),
  reason: z.string().optional(),
});

const cancelInviteSchema = z.object({
  operation: z.literal('cancel-invite'),
  staffId: z.string(),
});

const operationSchema = z.discriminatedUnion('operation', [
  updateStaffSchema,
  suspendStaffSchema,
  activateStaffSchema,
  removeStaffSchema,
  cancelInviteSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    if (!user.hasPartnerAccess || !user.partnerMemberships?.[0]) {
      return NextResponse.json(
        { error: 'Only partners can manage staff' },
        { status: 403 }
      );
    }

    const partnerId = user.partnerMemberships[0].partnerId;

    const body = await req.json();
    const validated = operationSchema.parse(body);

    // Get the staff member's info before operation
    const [staffMember] = await db
      .select({ 
        userId: partnerStaff.userId,
        role: partnerStaff.role,
        status: partnerStaff.status,
      })
      .from(partnerStaff)
      .where(eq(partnerStaff.id, validated.staffId))
      .limit(1);

    let result;

    switch (validated.operation) {
      case 'update':
        // Check if demoting an owner would leave no owners
        if (validated.role && validated.role !== 'owner' && staffMember?.role === 'owner') {
          if (await wouldLeaveNoOwners(partnerId, validated.staffId, 'demote')) {
            return NextResponse.json(
              { error: 'Cannot change role. There must be at least one owner.' },
              { status: 400 }
            );
          }
        }
        result = await updateStaffMember({
          staffId: validated.staffId,
          partnerId,
          role: validated.role,
          title: validated.title,
          department: validated.department,
          isPrimaryContact: validated.isPrimaryContact,
        });
        break;

      case 'suspend':
        // Cannot suspend the last active owner
        if (await wouldLeaveNoOwners(partnerId, validated.staffId, 'suspend')) {
          return NextResponse.json(
            { error: 'Cannot suspend. There must be at least one active owner.' },
            { status: 400 }
          );
        }
        result = await suspendStaffMember(validated.staffId, partnerId);
        break;

      case 'activate':
        result = await activateStaffMember(validated.staffId, partnerId);
        break;

      case 'remove':
        // Cannot remove the last active owner
        if (await wouldLeaveNoOwners(partnerId, validated.staffId, 'remove')) {
          return NextResponse.json(
            { error: 'Cannot remove. There must be at least one owner.' },
            { status: 400 }
          );
        }
        result = await removeStaffMember({
          staffId: validated.staffId,
          partnerId,
          reason: validated.reason,
        });
        break;

      case 'cancel-invite':
        result = await removeStaffMember({
          staffId: validated.staffId,
          partnerId,
          reason: 'Invite cancelled',
        });
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Operation failed' },
      { status: 500 }
    );
  }
}
