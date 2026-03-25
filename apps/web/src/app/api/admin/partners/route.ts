/**
 * API: Admin Partner Management - List All Partners
 * GET /api/admin/partners - List all partners with complete information
 * 
 * Purpose: Admin dashboard - view and manage all partners
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
import { getAdminAllPartners } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET - List All Partners
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
    const partnerId = searchParams.get('partnerId'); // Single partner fetch
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') as 'pending' | 'active' | 'suspended' | 'cancelled' | undefined;
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'brandName' | 'status' | undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

    // Fetch partners
    const partners = await getAdminAllPartners({
      partnerId: partnerId || undefined,
      limit,
      offset,
      status,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: partners,
      pagination: {
        limit,
        offset,
        count: partners.length,
      },
      filters: {
        status: status || 'all',
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
