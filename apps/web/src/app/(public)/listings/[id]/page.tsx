/**
 * Listing Detail Page - Alifh Design System
 * Public page showing comprehensive car listing details
 * 
 * Architecture: Minimal page wrapper - component fetches its own data via hook
 * Follows the pattern used in settings, messaging, requests pages
 */

import { Metadata } from 'next';
import { ListingDetailView } from '@/components/listings/listing-detail';
import { getSessionUser } from '@/lib/auth/session-context';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Simple metadata - no DB calls needed for basic SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: 'View Listing | Alifh',
    description: 'View detailed car listing information',
    openGraph: {
      title: 'Car Listing | Alifh',
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Get current user (if authenticated) - follows pattern from other pages
  const currentUser = await getSessionUser();

  return (
    <ListingDetailView 
      listingId={id}
      currentUserId={currentUser?.id} 
      currentUserRole={currentUser?.role}
    />
  );
}
