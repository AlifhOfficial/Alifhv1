/**
 * PATCH /api/partner/request/[id]
 * 
 * Update partner request (admin only - for approval/rejection)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { approveRequest, rejectRequest, addInternalNotes } from '@/lib/partner';
import { z } from '@alifh/shared';

const UpdateRequestSchema = z.object({
  action: z.enum(['approve', 'reject', 'add_notes']),
  reason: z.string().optional(),
  notes: z.string().optional(),
  partnerId: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    // Admin-only endpoint
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateRequestSchema.parse(body);
    
    let result;
    
    switch (validated.action) {
      case 'approve':
        if (!validated.partnerId) {
          return NextResponse.json(
            { error: 'partnerId is required for approval' },
            { status: 400 }
          );
        }
        result = await approveRequest(id, session.user.id, validated.partnerId);
        break;
        
      case 'reject':
        if (!validated.reason) {
          return NextResponse.json(
            { error: 'reason is required for rejection' },
            { status: 400 }
          );
        }
        result = await rejectRequest(id, session.user.id, validated.reason);
        break;
        
      case 'add_notes':
        if (!validated.notes) {
          return NextResponse.json(
            { error: 'notes are required' },
            { status: 400 }
          );
        }
        result = await addInternalNotes(id, validated.notes);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating request:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}
