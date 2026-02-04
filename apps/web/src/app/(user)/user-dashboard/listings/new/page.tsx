/**
 * New Listing Page - Revvup Design System
 * Authenticated users can create new car listings
 */

'use client';

import { NewListingView } from '@/components/listings/new-listing';
import { useAuth } from '@/providers/auth-provider';

export default function NewListingPage() {
  const { session } = useAuth();

  return <NewListingView userId={session?.id} />;
}
