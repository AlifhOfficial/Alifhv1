/**
 * API: Admin User Management - Search User
 * GET /api/admin/users/search - Search user by email or phone
 * 
 * Purpose: Admin dashboard - find specific user
 * Authentication: Required (Admin only)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: No cache (admin data)
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 403 for non-admin users
 * - Returns 404 if user not found
 * - Returns 400 for validation errors
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAdminUserByEmail, 
  getAdminUserByPhone,
  searchAdminUsers,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';

// ============================================================================
// GET - Search User
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

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const query = searchParams.get('q'); // For autocomplete search

    // Autocomplete search (name or email partial match)
    if (query) {
      const limit = parseInt(searchParams.get('limit') || '10');
      const results = await searchAdminUsers(query, limit);
      
      return NextResponse.json({
        success: true,
        data: results,
        searchType: 'autocomplete',
      }, { 
        status: 200,
      });
    }

    // Search by email
    if (email) {
      const userData = await getAdminUserByEmail(email);
      
      if (!userData) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
          searchType: 'email',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: userData,
        searchType: 'email',
      }, { 
        status: 200,
      });
    }

    // Search by phone
    if (phone) {
      const userData = await getAdminUserByPhone(phone);
      
      if (!userData) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
          searchType: 'phone',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: userData,
        searchType: 'phone',
      }, { 
        status: 200,
      });
    }

    // No search parameter provided
    return NextResponse.json({
      error: 'Bad request: Provide email, phone, or q (query) parameter',
    }, { status: 400 });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
