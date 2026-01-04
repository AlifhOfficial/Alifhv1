/**
 * API: Single Consignment Funnel
 * GET /api/partner/consignment/funnels/[id] - Get funnel details
 * PUT /api/partner/consignment/funnels/[id] - Update funnel
 * DELETE /api/partner/consignment/funnels/[id] - Delete funnel
 * 
 * Purpose: Manage individual consignment funnel
 * Authentication: Required (partner staff only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getFunnelById,
  updateFunnel,
  deleteFunnel,
} from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_GENERAL } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const funnelLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

// Validation schema for funnel filters
const filtersSchema = z.object({
  makes: z.array(z.string()).optional(),
  bodyTypes: z.array(z.string()).optional(),
  fuelTypes: z.array(z.string()).optional(),
  minYear: z.number().min(1900).max(2030).optional(),
  maxYear: z.number().min(1900).max(2030).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  maxMileage: z.number().min(0).optional(),
  emirates: z.array(z.string()).optional(),
  specs: z.array(z.string()).optional(),
});

const updateFunnelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  filters: filtersSchema.optional(),
  position: z.number().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/partner/consignment/funnels/[id]
 * Get funnel details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await funnelLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const membership = (user as any).partnerMemberships?.find(
      (m: any) => m.staffRole !== 'viewer'
    );
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a partner staff member' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const funnel = await getFunnelById(id);
    
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }
    
    // Check ownership - must be same partner AND same staff member
    if (funnel.partnerId !== membership.partnerId || funnel.staffId !== user.id) {
      return NextResponse.json({ error: 'Not your funnel' }, { status: 403 });
    }

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('[API] Error fetching funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/partner/consignment/funnels/[id]
 * Update funnel
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await funnelLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Any staff member can update funnels
    const membership = (user as any).partnerMemberships?.find(
      (m: any) => m.staffRole !== 'viewer'
    );
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Partner staff access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const validated = updateFunnelSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    const funnel = await updateFunnel(id, membership.partnerId, user.id, validated.data);
    
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found or not yours' }, { status: 404 });
    }

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('[API] Error updating funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/partner/consignment/funnels/[id]
 * Delete funnel
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await funnelLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Any staff member can delete funnels
    const membership = (user as any).partnerMemberships?.find(
      (m: any) => m.staffRole !== 'viewer'
    );
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Partner staff access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = await deleteFunnel(id, membership.partnerId, user.id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Funnel not found or not yours' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
