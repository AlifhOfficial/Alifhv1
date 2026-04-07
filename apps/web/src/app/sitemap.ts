import { MetadataRoute } from 'next';
import { staticPages } from '@/lib/navigation';

const BASE_URL = 'https://revvup.ae';

// Force dynamic generation - don't cache sitemap at build time
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // 1. Static pages (from centralized navigation config)
  staticPages.forEach((page) => {
    urls.push({
      url: `${BASE_URL}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  });

  // 2. Dynamic canonical URLs from DB
  try {
    // Dynamic import to avoid build-time DB connection issues
    const { db, partner, carListing, eq, and, isNotNull, isNull, desc } = await import('@alifh/database');

    // Fetch active listings (most important for SEO - individual car pages)
    const activeListings = await db
      .select({ 
        id: carListing.id, 
        updatedAt: carListing.updatedAt,
        createdAt: carListing.createdAt 
      })
      .from(carListing)
      .where(
        and(
          eq(carListing.lifecycleStatus, 'active'),
          isNull(carListing.deletedAt)
        )
      )
      .orderBy(desc(carListing.createdAt))
      .limit(10000); // Google allows up to 50k URLs per sitemap

    if (activeListings && activeListings.length > 0) {
      activeListings.forEach((l) => {
        urls.push({
          url: `${BASE_URL}/listings/${l.id}`,
          lastModified: l.updatedAt || l.createdAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });
      });
    }

    const activePartners = await db
      .select({ slug: partner.slug, updatedAt: partner.updatedAt })
      .from(partner)
      .where(and(eq(partner.status, 'active'), eq(partner.isVerified, true), isNotNull(partner.slug)))
      .limit(500);

    if (activePartners && activePartners.length > 0) {
      activePartners.forEach((p) => {
        if (p.slug) {
          urls.push({
            url: `${BASE_URL}/showroom/${p.slug}`,
            lastModified: p.updatedAt || new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      });
    }

  } catch (error) {
    console.error('Error fetching partners for sitemap:', error);
  }

  return urls;
}
