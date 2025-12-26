/**
 * Staff Works For Page
 * Shows the partner profile that the staff member works for
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { redirect } from 'next/navigation';
import { StaffWorksFor } from '@/components/staff/staff-works-for';

export const dynamic = 'force-dynamic';

export default async function StaffWorksForPage() {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Check if user is staff
  const staffMembership = user.partnerMemberships?.find(m => m.staffRole !== 'owner');
  if (!staffMembership) redirect('/access-denied?reason=not-dealer-staff');

  return <StaffWorksFor />;
}