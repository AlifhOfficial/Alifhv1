/**
 * GET /api/partner/list
 * POST /api/partner/list
 * 
 * List all partners with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { listPartners, createPartner } from '@/lib/partner';
import { CreatePartnerInputSchema } from '@alifh/shared';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') as 'pending' | 'active' | 'suspended' | 'cancelled' | null;
    const tier = searchParams.get('tier') as 'standard' | 'gold' | 'platinum' | 'black' | null;
    const emirate = searchParams.get('emirate');
    const isVerified = searchParams.get('isVerified');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    const filters: any = {};
    
    if (status) filters.status = status;
    if (tier) filters.tier = tier;
    if (emirate) filters.emirate = emirate;
    if (isVerified !== null) filters.isVerified = isVerified === 'true';
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);
    
    const partners = await listPartners(filters);
    
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error listing partners:', error);
    return NextResponse.json(
      { error: 'Failed to list partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validated = CreatePartnerInputSchema.parse(body);
    
    // Create partner
    const partner = await createPartner(validated);
    
    return NextResponse.json(partner, { status: 201 });
  } catch (error: any) {
    console.error('Error creating partner:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create partner' },
      { status: 500 }
    );
  }
}
