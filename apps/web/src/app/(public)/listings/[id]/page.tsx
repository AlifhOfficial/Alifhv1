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
import { getListingDetailed } from '@alifh/database';
import { ListingDetailView } from '@/components/listings/listing-detail';
import { ImagePreloader } from '@/components/ui/image-preloader';
import { getCachedPublicListingDetailBundle } from '@/lib/listing-detail-cache';
import { buildListingBrandedImageUrl } from '@/lib/listing-share';
import { getCdnPublicUrl } from '@/utils/storage';

interface PageProps {
  params: Promise<{ id: string }>;
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

    const priceFormatted = new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: listing.currency || 'AED',
      maximumFractionDigits: 0,
    }).format(listing.price);
    const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;
    const title = `${carTitle} — ${priceFormatted} | Revvup`;
    const locationLabel = listing.emirate ? listing.emirate.replace(/_/g, ' ') : null;
    const summaryBits = [
      listing.mileage ? `${listing.mileage.toLocaleString()} km` : null,
      listing.specs ? `${listing.specs} Specs` : null,
      locationLabel,
    ].filter(Boolean);
    const description = [
      `${carTitle} for ${priceFormatted}.`,
      summaryBits.length > 0 ? `${summaryBits.join(' • ')}.` : null,
      'Buy and sell cars on Revvup. Free. Forever.',
    ].filter(Boolean).join(' ');

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
      description: 'View car listing details on Revvup UAE.',
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
    const { listing, sellerData, similarListings } = await getCachedPublicListingDetailBundle(id);
    // Only pass public, approved listings as initial data
    if (listing?.moderationStatus === 'approved' && listing?.lifecycleStatus === 'active') {
      initialListing = listing;
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
      />
    </>
  );
}
