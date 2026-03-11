/**
 * Edit Listing Page - Server Component
 * Resolves auth server-side, delegates to client component for fetching/editing
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { EditListingClient } from './edit-listing-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();

  return <EditListingClient id={id} userId={user!.id} userRole={(user as any)?.role} />;
}
