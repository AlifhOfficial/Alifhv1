/**
 * Public Showroom Page
 * Premium brand manifesto display for Black tier partners
 * 
 * Philosophy: Less is more. Let the brand breathe.
 * 
 * Architecture:
 * - Metadata: Server-side via shared server helpers
 * - Page content: Client component hydrated from SSR data
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShowroomPageClient } from './client';
import {
  getCachedPublicShowroom,
  getCachedPublicShowroomListings,
  incrementPublicShowroomViews,
} from '@/lib/showroom-public';

// ============================================================================
// Types
// ============================================================================

interface ShowroomPageProps {
  params: Promise<{ slug: string }>;
}

// ============================================================================
// Static Generation
// ============================================================================

/**
 * Generate static paths for all active partner showroom pages
 * This pre-generates pages for all verified dealerships
 */
export async function generateStaticParams() {
  // Skip during build time when DATABASE_URL is not available
  if (!process.env.DATABASE_URL) {
    console.warn('[generateStaticParams] Skipping - no DATABASE_URL (build time)');
    return [];
  }
  
  try {
    // Import here to avoid build-time DB connection issues
    const { db, partner, eq, and } = await import('@alifh/database');
    
    // Get all active, verified partners
    const partners = await db
      .select({
        id: partner.id,
        brandName: partner.brandName,
        slug: partner.id, // Use ID as slug for now
      })
      .from(partner)
      .where(
        and(
          eq(partner.status, 'active'),
          eq(partner.isVerified, true)
        )
      )
      .limit(500); // Reasonable limit for static generation
    
    // Generate slug from brand name (lowercase, hyphenated)
    return partners.map(p => ({
      slug: p.brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  } catch (error) {
    console.error('[generateStaticParams] Failed to fetch partners:', error);
    return []; // Return empty array on error - pages will be generated on-demand
  }
}

// ============================================================================
// Server-side API fetch for metadata
// ============================================================================

async function fetchShowroomMetadata(slug: string) {
  return getCachedPublicShowroom(slug);
}

/**
 * Server-side fetch for showroom listings
 * Fetches initial inventory to avoid client-side waterfall
 */
async function fetchShowroomListings(partnerId: string, partnerName: string) {
  try {
    return await getCachedPublicShowroomListings(partnerId, partnerName);
  } catch {
    return null;
  }
}

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata({ params }: ShowroomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const showroom = await fetchShowroomMetadata(slug);
  
  if (!showroom) {
    return { title: 'Showroom' };
  }

  const brandName = showroom.partner?.brandName || slug;
  const title = showroom.isPlaceholder 
    ? `${brandName} | Premium Car Showroom in UAE | Revvup`
    : (showroom.seoTitle || `${brandName} | Premium Car Showroom in UAE | Revvup`);
  
  const description = showroom.seoDescription || 
    showroom.brandPhilosophy || 
    `Explore ${brandName}'s premium car showroom in UAE. Browse verified inventory, read reviews, and connect with trusted dealers.`;
  
  const image = showroom.seoImageUrl || showroom.heroImageUrl || '/opengraph-image';
  const location = showroom.partner?.emirate || 'UAE';
  const isBlackTier = showroom.partner?.tier === 'black';
  
  // Generate SEO keywords
  const keywords = [
    `${brandName.toLowerCase()} uae`,
    `${brandName.toLowerCase()} showroom`,
    `${brandName.toLowerCase()} ${location.toLowerCase()}`,
    `${brandName.toLowerCase()} car dealer`,
    `${brandName.toLowerCase()} cars for sale`,
    isBlackTier && 'premium car showroom',
    isBlackTier && 'luxury car dealer uae',
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          alt: `${brandName} showroom on Revvup`,
        },
      ],
      type: 'website',
      url: `https://revvup.ae/showroom/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `https://revvup.ae/showroom/${slug}`,
    },
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ShowroomPage({ params }: ShowroomPageProps) {
  const { slug } = await params;
  
  // Fetch showroom data - used for both validation and passing to client
  const showroom = await fetchShowroomMetadata(slug);
  
  // Return 404 if partner doesn't exist
  if (!showroom) {
    notFound();
  }

  incrementPublicShowroomViews(showroom.id);
  
  // Fetch initial listings server-side to avoid client-side waterfall
  const initialListings = showroom.partner?.id 
    ? await fetchShowroomListings(showroom.partner.id, showroom.partner.brandName || '')
    : null;
  
  const heroVideoUrl = showroom?.heroVideoFileUrl || null;
  const heroImageUrl = showroom?.heroImageUrl || null;

  return (
    <>
      {/* Preload video for instant playback */}
      {heroVideoUrl && (
        <link 
          rel="preload" 
          href={heroVideoUrl} 
          as="video" 
          // @ts-expect-error - fetchpriority is valid but not in React link types
          fetchpriority="high"
        />
      )}
      {/* Preload hero image as fallback/poster */}
      {heroImageUrl && (
        <link 
          rel="preload" 
          href={heroImageUrl} 
          as="image" 
          // @ts-expect-error - fetchpriority is valid but not in React link types
          fetchpriority="high"
        />
      )}
      {/* Pass showroom data to client - renders instantly, no client fetch needed */}
      <ShowroomPageClient slug={slug} initialShowroom={showroom} initialListings={initialListings} />
    </>
  );
}
