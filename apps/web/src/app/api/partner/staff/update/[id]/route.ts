/**
 * PATCH /api/partner/staff/update/[id]
 * DELETE /api/partner/staff/update/[id]
 * 
 * Update or remove staff member
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateStaff, removeStaff } from '@/lib/partner';
import { PartnerStaffUpdateSchema } from '@alifh/shared';

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
    
    const validated = PartnerStaffUpdateSchema.parse(body);
    const staff = await updateStaff(id, validated);
    
    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error updating staff:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason');
    
    const staff = await removeStaff(id, reason || undefined);
    
    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error removing staff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove staff' },
      { status: 500 }
    );
  }
}
