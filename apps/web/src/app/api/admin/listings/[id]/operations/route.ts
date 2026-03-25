/**
 * API: Admin Listing Operations
 * POST /api/admin/listings/[id]/operations - Perform listing moderation operations
 * 
 * Operations:
 * - approve: Approve a pending listing and publish it
 * - reject: Reject a pending listing with reason
 * - suspend: Suspend a listing (hide from public with reason)
 * - unsuspend: Clear admin suspension and optionally reactivate
 * 
 * Purpose: Unified listing moderation endpoint
 * Authentication: Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { getClientIp } from '@/lib/utils/get-client-ip';
import {
  approveListingAsAdmin,
  rejectListingAsAdmin,
  suspendListingAsAdmin,
  unsuspendListingAsAdmin,
  createAuditLogEntry,
  getListingModerationContext,
} from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


// ============================================================================
// Validation Schemas
// ============================================================================

const approveSchema = z.object({
  operation: z.literal('approve'),
});

const rejectSchema = z.object({
  operation: z.literal('reject'),
  reason: z.string().min(1, 'Rejection reason is required'),
});

const suspendSchema = z.object({
  operation: z.literal('suspend'),
  reason: z.string().min(1, 'Suspension reason is required'),
});

const unsuspendSchema = z.object({
  operation: z.literal('unsuspend'),
  setLifecycleStatus: z.enum(['active', 'archived']).optional(),
});

const operationSchema = z.discriminatedUnion('operation', [
  approveSchema,
  rejectSchema,
  suspendSchema,
  unsuspendSchema,
]);

// ============================================================================
// POST - Perform Listing Moderation Operation
// ============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (sessionUser.role !== 'admin' && sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }


    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    
    // Validate input
    const validated = operationSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    // Get before state for audit
    const before = await getListingModerationContext(id);
    
    let after: Awaited<ReturnType<typeof getListingModerationContext>> = null;
    let message = '';
    let auditAction = '';
    let metadata: Record<string, unknown> | undefined;

    switch (validated.data.operation) {
      case 'approve':
        after = await approveListingAsAdmin(id, sessionUser.id);
        message = 'Listing approved and published';
        auditAction = 'listing.moderation.approve';
        break;

      case 'reject':
        after = await rejectListingAsAdmin({
          listingId: id,
          adminUserId: sessionUser.id,
          adminName: sessionUser.name,
          reason: validated.data.reason,
        });
        message = 'Listing rejected';
        auditAction = 'listing.moderation.reject';
        metadata = { reason: validated.data.reason };
        break;

      case 'suspend':
        after = await suspendListingAsAdmin({
          listingId: id,
          adminUserId: sessionUser.id,
          adminName: sessionUser.name,
          reason: validated.data.reason,
        });
        message = 'Listing suspended';
        auditAction = 'listing.moderation.suspend';
        metadata = { reason: validated.data.reason };
        break;

      case 'unsuspend':
        after = await unsuspendListingAsAdmin({
          listingId: id,
          adminUserId: sessionUser.id,
          adminName: sessionUser.name,
          setLifecycleStatus: validated.data.setLifecycleStatus,
        });
        message = 'Listing unsuspended';
        auditAction = 'listing.moderation.unsuspend';
        metadata = { setLifecycleStatus: validated.data.setLifecycleStatus ?? 'archived' };
        break;
    }

    if (!after) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Create audit log entry
    void createAuditLogEntry({
      action: auditAction,
      entityType: 'car_listing',
      entityId: id,
      userId: sessionUser.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      metadata,
      oldValues: before
        ? {
            moderationStatus: before.moderationStatus,
            lifecycleStatus: before.lifecycleStatus,
            publishedAt: before.publishedAt ? before.publishedAt.toISOString() : null,
            expiresAt: before.expiresAt ? before.expiresAt.toISOString() : null,
          }
        : null,
      newValues: after
        ? {
            moderationStatus: after.moderationStatus,
            lifecycleStatus: after.lifecycleStatus,
            publishedAt: after.publishedAt ? after.publishedAt.toISOString() : null,
            expiresAt: after.expiresAt ? after.expiresAt.toISOString() : null,
          }
        : null,
    });

    const response = NextResponse.json({
      success: true,
      message,
      operation: validated.data.operation,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[admin/listings/[id]/operations] Error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
