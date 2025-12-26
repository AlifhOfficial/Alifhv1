/**
 * Staff New Work Listing Page
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { NewWorkListingView } from '@/components/staff/work-listings';

export const runtime = 'nodejs';

export default async function StaffNewWorkListingPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/');
  }

  // Get staff's partner membership
  const staffMembership = user.partnerMemberships?.find((m) => m.staffRole !== 'viewer');
  if (!staffMembership) {
    redirect('/access-denied?reason=not-dealer-staff');
  }

  return <NewWorkListingView userId={user.id} partnerId={staffMembership.partnerId} />;
}
