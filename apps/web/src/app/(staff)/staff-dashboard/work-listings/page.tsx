/**
 * Staff Work Listings Page
 * Shows listings associated with a partner (work listings)
 */

'use client';

import { MyListingsView } from '@/components/listings/my-listings';
import { useAuth } from '@/providers/auth-provider';

export default function StaffWorkListingsPage() {
  const { session } = useAuth();

  return <MyListingsView userId={session?.id} listingType="work" />;
}
