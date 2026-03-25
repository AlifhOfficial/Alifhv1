/**
 * API: Admin Partner Operations
 * POST /api/admin/partners/operations - Perform partner operations
 * 
 * Operations:
 * - suspend: Suspend a partner
 * - activate: Activate/unsuspend a partner
 * - cancel: Cancel partner (permanent)
 * - updateTier: Change partner tier
 * - verify: Verify partner
 * - unverify: Unverify partner
 * - addTag: Add tag to partner
 * - removeTag: Remove tag from partner
 * - addBadge: Add badge to partner
 * - removeBadge: Remove badge from partner
 * - deletePartner: Delete partner (super admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  suspendPartner,
  activatePartner,
  cancelPartner,
  updatePartnerTier,
  verifyPartner,
  unverifyPartner,
  addPartnerTag,
  removePartnerTag,
  addPartnerBadge,
  removePartnerBadge,
  adminDeletePartner,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


// ============================================================================
// Validation Schemas
// ============================================================================

const suspendPartnerSchema = z.object({
  operation: z.literal('suspend'),
  partnerId: z.string(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

const activatePartnerSchema = z.object({
  operation: z.literal('activate'),
  partnerId: z.string(),
});

const cancelPartnerSchema = z.object({
  operation: z.literal('cancel'),
  partnerId: z.string(),
});

const updateTierSchema = z.object({
  operation: z.literal('updateTier'),
  partnerId: z.string(),
  tier: z.enum(['flow', 'black']),
});

const verifyPartnerSchema = z.object({
  operation: z.literal('verify'),
  partnerId: z.string(),
});

const unverifyPartnerSchema = z.object({
  operation: z.literal('unverify'),
  partnerId: z.string(),
});

const tagOperationSchema = z.object({
  operation: z.enum(['addTag', 'removeTag']),
  partnerId: z.string(),
  tag: z.string(),
});

const badgeOperationSchema = z.object({
  operation: z.enum(['addBadge', 'removeBadge']),
  partnerId: z.string(),
  badge: z.string(),
});


const deletePartnerSchema = z.object({
  operation: z.literal('deletePartner'),
  partnerId: z.string(),
});

const operationSchema = z.discriminatedUnion('operation', [
  suspendPartnerSchema,
  activatePartnerSchema,
  cancelPartnerSchema,
  updateTierSchema,
  verifyPartnerSchema,
  unverifyPartnerSchema,
  tagOperationSchema,
  badgeOperationSchema,
  deletePartnerSchema,
]);

// ============================================================================
// POST - Perform Partner Operation
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    // Check authentication first
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check admin access
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }


    const body = await req.json();
    const validated = operationSchema.parse(body);

    let result;

    switch (validated.operation) {
      case 'suspend':
        result = await suspendPartner({
          partnerId: validated.partnerId,
          reason: validated.reason,
          suspendedBy: user.id,
        });
        break;

      case 'activate':
        result = await activatePartner(validated.partnerId);
        break;

      case 'cancel':
        result = await cancelPartner(validated.partnerId);
        break;

      case 'updateTier':
        result = await updatePartnerTier({
          partnerId: validated.partnerId,
          tier: validated.tier,
        });
        break;

      case 'verify':
        result = await verifyPartner({
          partnerId: validated.partnerId,
          verifiedBy: user.id,
        });
        break;

      case 'unverify':
        result = await unverifyPartner(validated.partnerId);
        break;

      case 'addTag':
        result = await addPartnerTag(validated.partnerId, validated.tag);
        break;

      case 'removeTag':
        result = await removePartnerTag(validated.partnerId, validated.tag);
        break;

      case 'addBadge':
        result = await addPartnerBadge(validated.partnerId, validated.badge);
        break;

      case 'removeBadge':
        result = await removePartnerBadge(validated.partnerId, validated.badge);
        break;

      case 'deletePartner':
        // Only super_admin can delete partners
        if (user.role !== 'super_admin') {
          return NextResponse.json(
            { error: 'Super admin access required to delete partners' },
            { status: 403 }
          );
        }
        result = await adminDeletePartner(validated.partnerId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
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
      { error: 'Operation failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
