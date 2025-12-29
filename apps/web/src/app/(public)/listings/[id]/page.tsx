/**
 * Listing Detail Page - Alifh Design System
 * Public page showing comprehensive car listing details
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getListingDetailed, getDealerBaseProfile, getUserProfileByUserId, db, user } from '@alifh/database';
import { calculatePartnerStats } from '@alifh/database/server';
import { ListingDetailView } from '@/components/listings/listing-detail';
import type { SellerData } from '@/components/listings/listing-detail/listing-detail-view';
import { getSessionUser } from '@/lib/auth/session-context';
import { cache } from 'react';
import { eq } from 'drizzle-orm';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getListingDetailedCached = cache((id: string) => getListingDetailed(id));
const getDealerBaseProfileCached = cache((partnerId: string) => getDealerBaseProfile(partnerId));
const getPartnerStatsCached = cache((partnerId: string) => calculatePartnerStats(partnerId));
const getUserProfileCached = cache((userId: string) => getUserProfileByUserId(userId));

// Get user basic info (name, image, verification)
const getUserBasicInfo = cache(async (userId: string) => {
  const [result] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return result ?? null;
});

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingDetailedCached(id);
  
  if (!listing || !listing.isPublic) {
    return {
      title: 'Listing Not Found | Alifh',
    };
  }

  const title = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;
  const description = listing.description || 
    `${title} for sale in ${listing.emirate}. ${listing.mileage.toLocaleString()} km, ${listing.specs} specs.`;

  return {
    title: `${title} | Alifh`,
    description,
    openGraph: {
      title,
      description,
      images: listing.thumbnail ? [listing.thumbnail] : listing.images.slice(0, 1),
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingDetailedCached(id);

  if (!listing) {
    notFound();
  }

  // Get current user (if authenticated)
  const currentUser = await getSessionUser();

  // Only show public listings to unauthenticated users
  if (!listing.isPublic) {
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
    const isOwner = currentUser?.id === listing.userId;

    if (!isAdmin && !isOwner) {
      notFound();
    }
  }

  // Get seller info based on listing type
  let sellerData: SellerData;

  if (listing.partnerId) {
    // Partner listing - fetch dealer profile and stats
    const [partnerProfile, partnerStats] = await Promise.all([
      getDealerBaseProfileCached(listing.partnerId),
      getPartnerStatsCached(listing.partnerId),
    ]);
    sellerData = { type: 'partner', partner: partnerProfile, partnerStats } as SellerData;
  } else {
    // User listing - fetch user profile and basic info
    const [userProfile, userBasic] = await Promise.all([
      getUserProfileCached(listing.userId),
      getUserBasicInfo(listing.userId),
    ]);
    sellerData = { type: 'user', userProfile, userBasic } as SellerData;
  }

  return (
    <ListingDetailView 
      listing={listing} 
      sellerData={sellerData} 
      currentUserId={currentUser?.id} 
    />
  );
}
