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
import { ListingDetailView } from '@/components/listings/listing-detail';
import { ImagePreloader } from '@/components/ui/image-preloader';
import { JsonLd } from '@/components/seo/json-ld';
import { buildListingBrandedImageUrl } from '@/lib/listing-share';
import { generateVehicleSchema } from '@/lib/seo-schema';
import { getCdnPublicUrl } from '@/utils/storage';
import {
  getCachedListingDetailed,
  getCachedSimilarListings,
  getCachedDealerProfile,
  getCachedUserProfile,
  getCachedStaffContact,
  getCachedPartnerStats,
  getCachedHasShowroom,
} from '@/lib/listing-detail-cache';
import { getCachedUserStats } from '@/lib/user-stats-cache';
const LISTING_FALLBACK_DESCRIPTION =
  'Explore verified car listings in the UAE on Revvup. Browse photos, pricing, and details with no paid boosts.';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const listing = await getCachedListingDetailed(id);
    
    if (!listing || listing.moderationStatus !== 'approved' || listing.lifecycleStatus !== 'active') {
      return {
        title: 'Listing Not Found | Revvup',
        description: LISTING_FALLBACK_DESCRIPTION,
        robots: { index: false, follow: true },
      };
    }

    const priceFormatted = new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: listing.currency || 'AED',
      maximumFractionDigits: 0,
    }).format(listing.price);
    const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;
    const title = `${carTitle} — ${priceFormatted} | Revvup`;
    const description = listing.description
      ? listing.description.slice(0, 160)
      : `Browse ${carTitle} listings in the UAE. View photos, price, and details, then book a test drive on Revvup.`;

    const ogImageUrl = buildListingBrandedImageUrl(id);

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
        images: [{
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${carTitle} on Revvup`,
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
      alternates: {
        canonical: `https://revvup.ae/listings/${id}`,
      },
    };
  } catch (error) {
    console.error('[generateMetadata] Failed to fetch listing:', error);
    return {
      title: 'Car Listing | Revvup',
      description: LISTING_FALLBACK_DESCRIPTION,
    };
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch listing AND seller data server-side for instant display
  // No client-side fetch waterfall - everything renders immediately
  let initialListing = null;
  let initialSellerData = null;
  let initialSimilarListings = [];
  
  try {
    const listing = await getCachedListingDetailed(id);
    
    // Only process public, approved listings
    if (listing?.moderationStatus === 'approved' && listing?.lifecycleStatus === 'active') {
      initialListing = listing;
      
      // Fetch seller data in parallel with similar listings
      const [sellerData, similarListings] = await Promise.all([
        (async () => {
          if (listing.partnerId) {
            const [partnerProfile, staffContact, partnerStats, hasShowroom] = await Promise.all([
              getCachedDealerProfile(listing.partnerId),
              listing.postedByRole === 'staff' && listing.userId
                ? getCachedStaffContact(listing.userId, listing.partnerId)
                : Promise.resolve(null),
              getCachedPartnerStats(listing.partnerId),
              getCachedHasShowroom(listing.partnerId),
            ]);
            
            return {
              type: 'partner' as const,
              partnerId: listing.partnerId,
              partner: partnerProfile,
              partnerStats: partnerStats ? { ...partnerStats, hasShowroom } : null,
              staffContact: staffContact ? {
                phone: staffContact.phone,
                displayName: staffContact.displayName,
              } : null,
            };
          }
          
          const [userProfile, userStats] = await Promise.all([
            getCachedUserProfile(listing.userId),
            getCachedUserStats(listing.userId),
          ]);
          
          return {
            type: 'user' as const,
            userId: listing.userId,
            userProfile,
            userStats,
          };
        })(),
        getCachedSimilarListings({
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
    }
  } catch (error) {
    // Silently fail - client will fetch and show error state
    console.error('[ListingDetailPage] Server fetch failed:', error);
  }

  // Preload primary image for instant display (browser starts fetch during HTML parse)
  const primaryImageUrl = initialListing 
    ? getCdnPublicUrl(initialListing.thumbnail || initialListing.images?.[0])
    : null;

  const sellerSchema = initialSellerData
    ? initialSellerData.type === 'partner'
      ? {
          type: 'partner' as const,
          name:
            initialSellerData.partner?.brandName ||
            initialSellerData.partner?.companyNameLegal ||
            'Verified Dealer',
        }
      : {
          type: 'user' as const,
          name: initialSellerData.userProfile?.displayName || 'Private Seller',
        }
    : undefined;

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
      {initialListing && (
        <div className="sr-only">
          Revvup car listing summary: {initialListing.year} {initialListing.make} {initialListing.model}
          {initialListing.trim ? ` ${initialListing.trim}` : ''}, priced at{' '}
          {new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: initialListing.currency || 'AED',
            maximumFractionDigits: 0,
          }).format(initialListing.price)}
          . Quality-ranked, no paid boosts. Book test drives online.
        </div>
      )}
      {initialListing && (
        <JsonLd data={generateVehicleSchema(initialListing, sellerSchema)} />
      )}
      <ListingDetailView 
        listingId={id} 
        initialListing={initialListing} 
        initialSellerData={initialSellerData}
        initialSimilarListings={initialSimilarListings}
      />
    </>
  );
}
