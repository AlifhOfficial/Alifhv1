/**
 * API: Admin User Operations
 * POST /api/admin/users/operations - Perform user operations (ban, role change, etc.)
 * 
 * Operations:
 * - ban: Ban a user
 * - unban: Unban a user
 * - updateRole: Change user role
 * - addTag: Add tag to user
 * - removeTag: Remove tag from user
 * - addBadge: Add badge to user
 * - removeBadge: Remove badge from user
 * - verifyEmail: Manually verify email
 * - verifyPhone: Manually verify phone
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  banUser,
  unbanUser,
  updateUserRole,
  addUserTag,
  removeUserTag,
  addUserBadge,
  removeUserBadge,
  verifyUserEmail,
  verifyUserPhone,
  adminDeleteUser,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';

function resolveWsBroadcastUrl() {
  const wsUrl = process.env.INTERNAL_WS_URL || process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.revvup.ae';
  if (wsUrl.startsWith('wss://')) return `${wsUrl.replace('wss://', 'https://')}/broadcast`;
  if (wsUrl.startsWith('ws://')) return `${wsUrl.replace('ws://', 'http://')}/broadcast`;
  return `${wsUrl}/broadcast`;
}


// ============================================================================
// Validation Schemas
// ============================================================================

const banUserSchema = z.object({
  operation: z.literal('ban'),
  userId: z.string(),
  reason: z.string().min(5, 'Ban reason must be at least 5 characters'),
  expiresAt: z.string().datetime().optional().nullable(),
});

const unbanUserSchema = z.object({
  operation: z.literal('unban'),
  userId: z.string(),
});

const updateRoleSchema = z.object({
  operation: z.literal('updateRole'),
  userId: z.string(),
  role: z.enum(['user', 'admin', 'super_admin']),
});

const tagOperationSchema = z.object({
  operation: z.enum(['addTag', 'removeTag']),
  userId: z.string(),
  tag: z.string(),
});

const badgeOperationSchema = z.object({
  operation: z.enum(['addBadge', 'removeBadge']),
  userId: z.string(),
  badge: z.string(),
});

const verifySchema = z.object({
  operation: z.enum(['verifyEmail', 'verifyPhone']),
  userId: z.string(),
});

const deleteUserSchema = z.object({
  operation: z.literal('deleteUser'),
  userId: z.string(),
});

const operationSchema = z.discriminatedUnion('operation', [
  banUserSchema,
  unbanUserSchema,
  updateRoleSchema,
  tagOperationSchema,
  badgeOperationSchema,
  verifySchema,
  deleteUserSchema,
]);

// ============================================================================
// POST - Perform User Operation
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
      case 'ban':
        result = await banUser({
          userId: validated.userId,
          reason: validated.reason,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
          bannedBy: user.id,
        });
        
        // Notify banned user via WebSocket for immediate client-side effect
        const wsBroadcastUrl = resolveWsBroadcastUrl();
        fetch(wsBroadcastUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `user:${validated.userId}`,
            message: {
              type: 'account_banned',
              reason: validated.reason,
              expiresAt: validated.expiresAt || null,
            },
          }),
        }).catch(() => {
          // Silently fail - WebSocket is optional
        });
        break;

      case 'unban':
        result = await unbanUser(validated.userId);
        break;

      case 'updateRole':
        // Only super_admin can change roles
        if (user.role !== 'super_admin') {
          return NextResponse.json(
            { error: 'Super admin access required to change roles' },
            { status: 403 }
          );
        }
        result = await updateUserRole({
          userId: validated.userId,
          role: validated.role,
          updatedBy: user.id,
        });
        break;

      case 'addTag':
        result = await addUserTag(validated.userId, validated.tag);
        break;

      case 'removeTag':
        result = await removeUserTag(validated.userId, validated.tag);
        break;

      case 'addBadge':
        result = await addUserBadge(validated.userId, validated.badge);
        break;

      case 'removeBadge':
        result = await removeUserBadge(validated.userId, validated.badge);
        break;

      case 'verifyEmail':
        result = await verifyUserEmail(validated.userId);
        break;

      case 'verifyPhone':
        result = await verifyUserPhone(validated.userId);
        break;
      case 'deleteUser':
        // Only super_admin can delete users
        if (user.role !== 'super_admin') {
          return NextResponse.json(
            { error: 'Super admin access required to delete users' },
            { status: 403 }
          );
        }
        result = await adminDeleteUser(validated.userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      operation: validated.operation,
      result,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    // Log the actual error for debugging
    console.error('[Admin User Operations] Error:', error);

    return NextResponse.json(
      { 
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
