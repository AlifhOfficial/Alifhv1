/**
 * GET /api/partner/request/list
 * POST /api/partner/request/list
 * 
 * List partner requests or create new request
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listRequests, createRequest } from '@/lib/partner';
import { CreateRequestInputSchema } from '@alifh/shared';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    // Admin-only endpoint
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    const filters: any = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);
    
    const requests = await listRequests(filters);
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error listing requests:', error);
    return NextResponse.json(
      { error: 'Failed to list requests' },
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
    
    const validated = CreateRequestInputSchema.parse({
      ...body,
      userId: session.user.id,
    });
    
    const partnerRequest = await createRequest(validated);
    
    return NextResponse.json(partnerRequest, { status: 201 });
  } catch (error: any) {
    console.error('Error creating request:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create request' },
      { status: 500 }
    );
  }
}
