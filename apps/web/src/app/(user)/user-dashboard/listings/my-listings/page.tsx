/**
 * My Listings Page - Revvup Design System
 * User's personal car listings management
 */

'use client';

import { MyListingsView } from '@/components/listings/my-listings';
import { useAuth } from '@/providers/auth-provider';

export default function MyListingsPage() {
  const { session } = useAuth();

  // Personal listings - no partnerId (user's own listings)
  return <MyListingsView userId={session?.id} listingType="personal" />;
}
