/**
 * API: Admin User Management - List All Users
 * GET /api/admin/users - List all users with complete information
 * 
 * Purpose: Admin dashboard - view and manage all users
 * Authentication: Required (Admin only)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: No cache (admin data)
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 403 for non-admin users
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAllUsers } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

// ============================================================================
// Helper: Check Admin Role
// ============================================================================

async function checkAdminAccess(user: any) {
  return user.role === 'admin' || user.role === 'super_admin';
}

// ============================================================================
// GET - List All Users
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(user);
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Forbidden: Admin access required' 
      }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'name' | 'email' | undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

    // Fetch users
    const users = await getAdminAllUsers({
      limit,
      offset,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        limit,
        offset,
        count: users.length,
      },
    }, { 
      status: 200,
      headers: CACHE_HEADERS_NO_CACHE,
    });

  } catch (error) {
    console.error('[Admin Users API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
