/**
 * Listing Detail Page - Revvup Design System
 * Public page showing comprehensive car listing details
 * 
 * Architecture: Server component with generateMetadata for SEO/OG tags
 * - All data fetched server-side, passed to client for instant display
 * - Primary image preloaded for immediate render (no flash)
 * - No client-side fetch waterfall - everything renders instantly
 */

import { Metadata } from 'next';
import { 
  getListingDetailed, 
  getDealerBaseProfile, 
  getUserProfileByUserId,
  getStaffEffectivePhone,
  calculatePartnerStats,
  calculateUserStats,
  getSimilarListings,
} from '@alifh/database';
import { ListingDetailView } from '@/components/listings/listing-detail';
import { ImagePreloader } from '@/components/ui/image-preloader';
import type { SellerData } from '@/hooks/listings';
import type { SimilarListingCard } from '@/hooks/listings/use-similar-listings';
import { getPublicBookingAvailability, type PublicBookingAvailabilityResponse } from '@/lib/bookings/public-availability';


interface PageProps {
  params: Promise<{ id: string }>;
}

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://cdn.revvup.ae';

function getImageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  return `${CDN_URL}/${key}`;
}

// Fetch seller data based on listing type (same logic as API route)
type ListingResult = NonNullable<Awaited<ReturnType<typeof getListingDetailed>>>;

async function fetchSellerData(listing: ListingResult): Promise<SellerData | null> {
  try {
    if (listing.partnerId) {
      // Partner listing - fetch dealer profile and staff phone
      const [partnerProfile, staffContact, partnerStats] = await Promise.all([
        getDealerBaseProfile(listing.partnerId),
        listing.postedByRole === 'staff' && listing.userId
          ? getStaffEffectivePhone(listing.userId, listing.partnerId)
          : Promise.resolve(null),
        calculatePartnerStats(listing.partnerId),
      ]);
      
      // Cast through unknown - DB type is compatible but TypeScript can't verify
      return { 
        type: 'partner' as const, 
        partnerId: listing.partnerId,
        partner: partnerProfile, 
        partnerStats,
        staffContact: staffContact ? {
          phone: staffContact.phone,
          displayName: staffContact.displayName,
        } : null,
      } as unknown as SellerData;
    } else {
      // User listing - fetch profile
      const [userProfile, userStats] = await Promise.all([
        getUserProfileByUserId(listing.userId),
        calculateUserStats(listing.userId),
      ]);
      
      // Cast through unknown - DB type is compatible but TypeScript can't verify
      return { 
        type: 'user' as const, 
        userId: listing.userId,
        userProfile,
        userStats,
      } as unknown as SellerData;
    }
  } catch (error) {
    console.error('[fetchSellerData] Failed:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const listing = await getListingDetailed(id);
    
    if (!listing || listing.moderationStatus !== 'approved' || listing.lifecycleStatus !== 'active') {
      return {
        title: 'Listing Not Found | Revvup',
        description: 'This car listing is no longer available.',
        robots: { index: false, follow: true },
      };
    }

    const title = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''} for Sale in Dubai | Revvup`;
    const priceFormatted = new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: listing.currency || 'AED',
      maximumFractionDigits: 0,
    }).format(listing.price);
    
    const description = [
      `Buy this ${listing.year} ${listing.make} ${listing.model} for ${priceFormatted}.`,
      listing.mileage ? `${listing.mileage.toLocaleString()} km.` : null,
      listing.transmission ? `${listing.transmission} transmission.` : null,
      listing.fuelType ? `${listing.fuelType} engine.` : null,
      'Book test drive online. Revvup UAE.',,
    ].filter(Boolean).join(' ');

    // Get primary image for OG
    const ogImage = getImageUrl(listing.thumbnail || listing.images?.[0]);

    return {
      title,
      description,
      keywords: `${listing.make} ${listing.model} ${listing.year}, buy ${listing.make} ${listing.model}, used ${listing.make} for sale dubai, ${listing.make} ${listing.model} price uae`,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://revvup.ae/listings/${id}`,
        siteName: 'Revvup',
        images: ogImage ? [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${listing.year} ${listing.make} ${listing.model}`,
        }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
      alternates: {
        canonical: `https://revvup.ae/listings/${id}`,
      },
    };
  } catch (error) {
    console.error('[generateMetadata] Failed to fetch listing:', error);
    return {
      title: 'Car Listing | Revvup',
      description: 'View car listing details on Revvup UAE.',
    };
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch listing AND seller data server-side for instant display
  // No client-side fetch waterfall - everything renders immediately
  let initialListing = null;
  let initialSellerData: SellerData | null = null;
  let initialSimilarListings: SimilarListingCard[] = [];
  let initialBookingAvailability: PublicBookingAvailabilityResponse | null = null;
  
  try {
    const listing = await getListingDetailed(id);
    // Only pass public, approved listings as initial data
    if (listing?.moderationStatus === 'approved' && listing?.lifecycleStatus === 'active') {
      initialListing = listing;
      const [sellerData, similarListings] = await Promise.all([
        fetchSellerData(listing),
        getSimilarListings({
          excludeId: listing.id,
          price: listing.price,
          bodyType: listing.bodyType,
          make: listing.make,
          model: listing.model,
          mileage: listing.mileage,
          fuelType: listing.fuelType,
        }),
      ]);
      initialSellerData = sellerData;
      initialSimilarListings = similarListings;
      if (listing.partnerId) {
        initialBookingAvailability = await getPublicBookingAvailability(listing.id, {
          mode: 'dates',
          prefetchSlots: true,
        });
      }
    }
  } catch (error) {
    // Silently fail - client will fetch and show error state
    console.error('[ListingDetailPage] Server fetch failed:', error);
  }

  // Preload primary image for instant display (browser starts fetch during HTML parse)
  const primaryImageUrl = initialListing 
    ? getImageUrl(initialListing.thumbnail || initialListing.images?.[0])
    : null;

  return (
    <>
      {/* Preload primary image - browser fetches immediately, before React hydrates */}
      {primaryImageUrl && (
        <ImagePreloader 
          src={primaryImageUrl} 
          as="image"
          fetchPriority="high"
        />
      )}
      <ListingDetailView 
        listingId={id} 
        initialListing={initialListing} 
        initialSellerData={initialSellerData}
        initialSimilarListings={initialSimilarListings}
        initialBookingAvailability={initialBookingAvailability}
      />
    </>
  );
}
