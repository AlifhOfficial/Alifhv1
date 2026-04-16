/**
 * API: Consignment Funnels
 * GET /api/partner/consignment/funnels - List partner's funnels
 * POST /api/partner/consignment/funnels - Create a new funnel
 * 
 * Purpose: Manage consignment funnels (saved searches for potential consignment listings)
 * Authentication: Required (partner staff only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getPartnerFunnels,
  getPartnerFunnelCounts,
  createFunnel,
} from '@alifh/database';

export const runtime = 'nodejs';


// Validation schema for funnel filters
const filtersSchema = z.object({
  makes: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
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

const createFunnelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  filters: filtersSchema,
  position: z.number().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/partner/consignment/funnels
 * List all funnels for the partner with matching counts
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Get partner membership
    const membership = (user as any).partnerMemberships?.find(
      (m: any) => m.staffRole !== 'viewer'
    );
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a partner staff member' },
        { status: 403 }
      );
    }

    const partnerId = membership.partnerId;
    const staffId = user.id; // Each staff member has their own funnels

    // Get funnels for this staff member
    const funnels = await getPartnerFunnels(partnerId, staffId);
    
    // Get counts (optional - can be expensive, skip if ?counts=false)
    const includeCounts = req.nextUrl.searchParams.get('counts') !== 'false';
    let counts: Record<string, number> = {};
    
    if (includeCounts) {
      counts = await getPartnerFunnelCounts(partnerId, staffId);
    }

    return NextResponse.json(
      {
        funnels: funnels.map(f => ({
          ...f,
          matchCount: counts[f.id] ?? null,
        })),
      },
      {
      }
    );
  } catch (error) {
    console.error('[API] Error fetching funnels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partner/consignment/funnels
 * Create a new funnel
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Get partner membership (staff, manager, or owner can create funnels)
    const membership = (user as any).partnerMemberships?.find(
      (m: any) => m.staffRole !== 'viewer'
    );
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Partner staff access required to create funnels' },
        { status: 403 }
      );
    }

    const partnerId = membership.partnerId;
    const staffId = user.id; // Each staff member owns their own funnels

    // Parse and validate body
    const body = await req.json().catch(() => null);
    const validated = createFunnelSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    // Create funnel for this staff member
    const funnel = await createFunnel({
      partnerId,
      staffId,
      name: validated.data.name,
      description: validated.data.description ?? undefined,
      filters: validated.data.filters,
      position: validated.data.position,
      isActive: validated.data.isActive ?? true,
    });

    return NextResponse.json({ funnel }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
