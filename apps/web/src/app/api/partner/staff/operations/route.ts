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
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    let result;

    switch (validated.operation) {
      case 'update':
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
        result = await suspendStaffMember(validated.staffId, partnerId);
        break;

      case 'activate':
        result = await activateStaffMember(validated.staffId, partnerId);
        break;

      case 'remove':
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
