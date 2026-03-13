/**
 * Public Showroom Page
 * Premium brand manifesto display for Black tier partners
 * 
 * Philosophy: Less is more. Let the brand breathe.
 * 
 * Architecture:
 * - Metadata: Server-side via API fetch for SEO
 * - Page content: Client component that fetches via API hook
 * 
 * No direct database imports - all data comes through /api/showroom/[slug]
 */

import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ShowroomPageClient } from './client';
import { isDatabaseConfigured } from '@/lib/env/database';

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
  if (!isDatabaseConfigured()) {
    console.log('[generateStaticParams] Skipping - no database URL configured (build time)');
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
  try {
    // Get host from headers for absolute URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const response = await fetch(`${protocol}://${host}/api/showroom/${encodeURIComponent(slug)}`, {
      next: { revalidate: 600 }, // 10 min cache
      cache: 'force-cache',
    });
    
    if (!response.ok) {
      return null; // Return null for 404s
    }
    
    const data = await response.json();
    return data.showroom;
  } catch {
    return null; // Return null on error
  }
}

/**
 * Server-side fetch for showroom listings
 * Fetches initial inventory to avoid client-side waterfall
 */
async function fetchShowroomListings(partnerId: string, partnerName: string) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const params = new URLSearchParams({
      partnerId: partnerId,
      partnerName: partnerName,
      limit: '24',
    });
    
    const response = await fetch(`${protocol}://${host}/api/listings/search?${params}`, {
      next: { revalidate: 300 }, // 5 min cache
      cache: 'force-cache',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
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
  
  const image = showroom.seoImageUrl || showroom.heroImageUrl;
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
      images: image ? [image] : [],
      type: 'website',
      url: `https://revvup.ae/showroom/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
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
          // @ts-ignore - fetchpriority is valid but not in types
          fetchpriority="high"
        />
      )}
      {/* Preload hero image as fallback/poster */}
      {heroImageUrl && (
        <link 
          rel="preload" 
          href={heroImageUrl} 
          as="image" 
          // @ts-ignore
          fetchpriority="high"
        />
      )}
      {/* Pass showroom data to client - renders instantly, no client fetch needed */}
      <ShowroomPageClient slug={slug} initialShowroom={showroom} initialListings={initialListings} />
    </>
  );
}
