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
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
