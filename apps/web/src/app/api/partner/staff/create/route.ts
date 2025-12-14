/**
 * POST /api/partner/staff/create
 * 
 * Create/invite new staff member
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createStaff, inviteStaff } from '@/lib/partner';
import { z } from '@alifh/shared';

const CreateStaffSchema = z.object({
  partnerId: z.string(),
  userId: z.string(),
  role: z.enum(['owner', 'admin', 'sales', 'viewer']),
  title: z.string().optional(),
  department: z.string().optional(),
  isPrimaryContact: z.boolean().optional(),
  permissions: z.object({
    manageListings: z.boolean(),
    manageTeam: z.boolean(),
    viewAnalytics: z.boolean(),
    manageBookings: z.boolean(),
    respondToLeads: z.boolean(),
    manageFinancials: z.boolean(),
    manageSettings: z.boolean(),
    exportData: z.boolean(),
  }),
  invite: z.boolean().optional(), // If true, send invitation
});

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
    const validated = CreateStaffSchema.parse(body);
    
    // Remove invite flag and prepare data for service
    const { invite, ...staffData } = validated;
    
    // If invite flag is set, use inviteStaff, otherwise createStaff
    const staff = invite
      ? await inviteStaff(staffData as any, session.user.id)
      : await createStaff(staffData as any);
    
    return NextResponse.json(staff, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create staff' },
      { status: 500 }
    );
  }
}
