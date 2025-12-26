/**
 * Staff Work Listings Page
 * Shows listings associated with a partner (work listings)
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { MyListingsView } from '@/components/listings/my-listings';

export const runtime = 'nodejs';

export default async function StaffWorkListingsPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/');
  }

  return <MyListingsView userId={user.id} listingType="work" />;
}
