/**
 * New Listing Page - Alifh Design System
 * Authenticated users can create new car listings
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { NewListingView } from '@/components/listings/new-listing';

export const metadata = {
  title: 'List Your Car | Alifh',
  description: 'Create a new car listing on Alifh marketplace',
};

export default async function NewListingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/sign-in?redirect=/listings/new');
  }

  return <NewListingView userId={user.id} />;
}
