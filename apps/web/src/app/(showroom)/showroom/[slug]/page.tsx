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
import { ShowroomPageClient } from './client';

// ============================================================================
// Types
// ============================================================================

interface ShowroomPageProps {
  params: Promise<{ slug: string }>;
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
      // Return a minimal object so we don't show "Not Found" for valid showrooms
      // The actual data will load client-side
      return { partner: { brandName: slug }, isPlaceholder: true };
    }
    
    const data = await response.json();
    return data.showroom;
  } catch {
    // Return minimal placeholder on error - actual data loads client-side
    return { partner: { brandName: slug }, isPlaceholder: true };
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

  const title = showroom.isPlaceholder 
    ? `${showroom.partner?.brandName} | Showroom`
    : (showroom.seoTitle || `${showroom.partner?.brandName} | Showroom`);
  const description = showroom.seoDescription || showroom.brandPhilosophy || `Explore ${showroom.partner?.brandName}'s premium showroom`;
  const image = showroom.seoImageUrl || showroom.heroImageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ShowroomPage({ params }: ShowroomPageProps) {
  const { slug } = await params;
  
  // Fetch showroom data for preload hints
  const showroom = await fetchShowroomMetadata(slug);
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
      <ShowroomPageClient slug={slug} />
    </>
  );
}
