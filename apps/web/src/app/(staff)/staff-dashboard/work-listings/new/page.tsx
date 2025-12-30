/**
 * Staff New Work Listing Page
 */

'use client';

import { NewWorkListingView } from '@/components/staff/work-listings';
import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';

export default function StaffNewWorkListingPage() {
  const { session } = useAuth();
  
  if (!session) {
    redirect('/');
  }

  // Get staff's partner membership
  const staffMembership = (session as any).partnerMemberships?.find((m: any) => m.staffRole !== 'viewer');
  if (!staffMembership) {
    redirect('/access-denied?reason=not-dealer-staff');
  }

  return <NewWorkListingView userId={session.id} partnerId={staffMembership.partnerId} />;
}
