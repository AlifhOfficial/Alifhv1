/**
 * My Listings Page - Alifh Design System
 * User's personal car listings management
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { MyListingsView } from '@/components/listings/my-listings';

export const metadata = {
  title: 'My Listings | Alifh',
  description: 'Manage your car listings',
};

export default async function MyListingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in?redirect=/user-dashboard/listings/my-listings');
  }

  // Personal listings - no partnerId (user's own listings)
  return <MyListingsView userId={user.id} listingType="personal" />;
}
