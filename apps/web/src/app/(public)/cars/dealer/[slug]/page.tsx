/**
 * Partner Listing Hub Pages - SEO Optimized
 * /cars/dealer/{partner-slug} redirects to filtered listings
 * 
 * For partners without showrooms - focuses on their inventory
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Skip during build time when DATABASE_URL is not available
  if (!process.env.DATABASE_URL) {
    return [];
  }
  
  try {
    // Dynamic import to avoid build-time DB connection issues
    const { db, partner, eq } = await import('@alifh/database');
    
    // Get all active partners (with or without showrooms)
    const partners = await db
      .select({ 
        slug: partner.slug,
      })
      .from(partner)
      .where(eq(partner.status, 'active'))
      .limit(500);

    return partners.map((p) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error('[Partner Listings] Failed to generate static params:', error);
    return [];
  }
}

async function getPartnerBySlug(slug: string) {
  try {
    const { db, partner, eq } = await import('@alifh/database');
    
    const result = await db
      .select({
        id: partner.id,
        brandName: partner.brandName,
        slug: partner.slug,
        emirate: partner.emirate,
        tier: partner.tier,
      })
      .from(partner)
      .where(eq(partner.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('[Partner Listings] Failed to fetch partner:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const partnerData = await getPartnerBySlug(slug);
  const ogImage = '/opengraph-image';

  if (!partnerData) {
    return { title: 'Not Found | Revvup' };
  }

  const brandName = partnerData.brandName;
  const location = partnerData.emirate || 'UAE';
  const isBlackTier = partnerData.tier === 'black';

  const title = isBlackTier
    ? `${brandName} Cars for Sale in ${location} | Black Verified | Revvup`
    : `${brandName} Cars for Sale in ${location} | Verified Dealer | Revvup`;

  const description = isBlackTier
    ? `Browse quality-verified cars from ${brandName} in ${location}. Black tier verified dealer. Book test drives online.`
    : `Browse used cars for sale from ${brandName} in ${location}. Verified dealer listings. Connect directly with the dealership.`;

  const keywords = isBlackTier
    ? `${brandName.toLowerCase()} cars ${location.toLowerCase()}, ${brandName.toLowerCase()} uae, black verified dealer, quality cars ${brandName.toLowerCase()}, ${brandName.toLowerCase()} showroom ${location.toLowerCase()}`
    : `${brandName.toLowerCase()} cars ${location.toLowerCase()}, ${brandName.toLowerCase()} dealer uae, ${brandName.toLowerCase()} showroom, cars for sale ${brandName.toLowerCase()}, ${brandName.toLowerCase()} inventory`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://revvup.ae/cars/dealer/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brandName} dealer listings on Revvup`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/twitter-image'],
    },
    alternates: {
      canonical: `https://revvup.ae/cars/dealer/${slug}`,
    },
  };
}

// ISR: Cache for 1 day - partner metadata rarely changes

export default async function PartnerListingsPage({ params }: PageProps) {
  const { slug } = await params;
  const partnerData = await getPartnerBySlug(slug);

  if (!partnerData) {
    notFound();
  }

  // Redirect to filtered listings with partnerId and partnerName
  const partnerName = encodeURIComponent(partnerData.brandName);
  redirect(`/listings?partnerId=${partnerData.id}&partnerName=${partnerName}&sort=relevance`);
}
