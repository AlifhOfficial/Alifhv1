/**
 * New Listing Page - Revvup Design System
 * Authenticated users can create new car listings
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { NewListingView } from '@/components/listings/new-listing';

export default async function NewListingPage() {
  const user = await getSessionUser();

  return <NewListingView userId={user?.id} />;
}
