/**
 * Listing Detail Page - Revvup Design System
 * Public page showing comprehensive car listing details
 * 
 * Architecture: Server component with generateMetadata for SEO/OG tags
 * Data for display fetched client-side via ListingDetailView
 */

import { Metadata } from 'next';
import { getListingDetailed } from '@alifh/database';
import { ListingDetailView } from '@/components/listings/listing-detail';


interface PageProps {
  params: Promise<{ id: string }>;
}

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://cdn.revvup.ae';

function getImageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  return `${CDN_URL}/${key}`;
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
      'Book test drive online. VIN shown. Revvup UAE.',
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

  return <ListingDetailView listingId={id} />;
}
