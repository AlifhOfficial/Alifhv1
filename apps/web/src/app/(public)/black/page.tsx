/**
 * Black Directory Page
 * 
 * Premium showroom directory for Black tier members.
 * Showcases verified dealerships with signature showroom pages.
 * 
 * Architecture: Server-side data fetch for instant display
 */

import { getCachedPublishedShowrooms } from '@/lib/showroom-public';
import { BlackDirectoryView } from '@/components/pages/black';
import { getPublicUrl, getAppThumbUrl } from '@/utils';

export const metadata = {
  title: 'Black | Premium Car Showrooms & Dealers in UAE | Revvup',
  description: 'Curated collection of premium car dealerships and signature showrooms from verified Black tier partners. Luxury car dealers in Dubai, Abu Dhabi, and across UAE.',
  keywords: 'premium car showrooms uae, luxury car dealers dubai, black tier dealers, verified showrooms uae, premium car dealers abu dhabi, luxury auto dealers uae',
  openGraph: {
    title: 'Black | Premium Car Showrooms & Dealers in UAE | Revvup',
    description: 'Curated collection of premium car dealerships and signature showrooms from verified Black tier partners.',
    type: 'website',
    url: 'https://revvup.ae/black',
  },
  alternates: {
    canonical: 'https://revvup.ae/black',
  },
};

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

/**
 * Transform showroom data to card format with URLs (same as API)
 */
function attachCardUrls(showroom: any) {
  const cacheBuster = new Date(showroom.updatedAt).getTime();
  
  return {
    id: showroom.id,
    partnerId: showroom.partnerId,
    slug: showroom.slug,
    heroVideoUrl: showroom.heroVideoUrl || null,
    heroVideoFileUrl: getPublicUrl(showroom.heroVideoFile, cacheBuster),
    heroImageUrl: getPublicUrl(showroom.heroImage, cacheBuster),
    heroTagline: showroom.heroTagline,
    partner: {
      brandName: showroom.partner.brandName,
      logoUrl: getAppThumbUrl(showroom.partner.logo, cacheBuster),
      heroImageUrl: getPublicUrl(showroom.partner.heroImage, cacheBuster),
      isVerified: showroom.partner.isVerified,
      tier: showroom.partner.tier,
      googleRating: showroom.partner.googleRating,
      googleReviewCount: showroom.partner.googleReviewCount,
      city: showroom.partner.city,
      emirate: showroom.partner.emirate,
    },
    totalCarsSold: showroom.totalCarsSold,
    yearsInBusiness: showroom.yearsInBusiness,
    publishedAt: showroom.publishedAt,
  };
}

export default async function BlackPage() {
  // Fetch showrooms server-side for instant display
  let initialShowrooms = null;
  
  try {
    const { showrooms } = await getCachedPublishedShowrooms(1, 50);
    initialShowrooms = showrooms.map(attachCardUrls);
  } catch (error) {
    console.error('[BlackPage] Failed to fetch showrooms:', error);
    // Client will fetch if server fails
  }
  
  return <BlackDirectoryView initialShowrooms={initialShowrooms} />;
}
