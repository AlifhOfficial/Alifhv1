/**
 * PATCH /api/partner/[id]
 * 
 * Update partner information
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updatePartner } from '@/lib/partner';
import { PartnerUpdateSchema } from '@alifh/shared';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validated = PartnerUpdateSchema.parse(body);
    
    // Update partner
    const partner = await updatePartner(id, validated);
    
    return NextResponse.json(partner);
  } catch (error: any) {
    console.error('Error updating partner:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update partner' },
      { status: 500 }
    );
  }
}
