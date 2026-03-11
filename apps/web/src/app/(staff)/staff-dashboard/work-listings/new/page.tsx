/**
 * Staff New Work Listing Page
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { NewWorkListingView } from '@/components/staff/work-listings';

export default async function StaffNewWorkListingPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/?auth=signin');
  }

  // Get staff's partner membership
  const staffMembership = (user as any).partnerMemberships?.find((m: any) => m.staffRole !== 'viewer');
  if (!staffMembership) {
    redirect('/access-denied?reason=not-dealer-staff');
  }

  return <NewWorkListingView userId={user.id} partnerId={staffMembership.partnerId} />;
}
