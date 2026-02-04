import { MetadataRoute } from 'next';
import { CAR_MAKES, UAE_EMIRATES } from '@/lib/filter-constants';

const BASE_URL = 'https://revvup.ae';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // 1. Static high-priority pages
  urls.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  urls.push({
    url: `${BASE_URL}/sell`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  urls.push({
    url: `${BASE_URL}/listings`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  });

  urls.push({
    url: `${BASE_URL}/black`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // 2. Location hub pages (7 emirates)
  UAE_EMIRATES.forEach((emirate) => {
    urls.push({
      url: `${BASE_URL}/cars/${emirate.value}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  });

  // 3. Brand hub pages (79 makes)
  CAR_MAKES.forEach((make) => {
    const slug = make.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    urls.push({
      url: `${BASE_URL}/cars/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    });
  });

  // 4. Regional specs pages (4 types)
  const specTypes = ['gcc-specs', 'american-specs', 'european-specs', 'japanese-specs'];
  specTypes.forEach((spec) => {
    urls.push({
      url: `${BASE_URL}/cars/${spec}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // 5. Black listings page
  urls.push({
    url: `${BASE_URL}/cars/black-listings`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  });

  // 6. Model hub pages (top models per brand)
  // Using most popular models for key brands
  const popularModels = [
    // Toyota
    { brand: 'toyota', model: 'land-cruiser' },
    { brand: 'toyota', model: 'camry' },
    { brand: 'toyota', model: 'corolla' },
    { brand: 'toyota', model: 'hilux' },
    { brand: 'toyota', model: 'prado' },
    { brand: 'toyota', model: 'yaris' },
    { brand: 'toyota', model: 'rav4' },
    { brand: 'toyota', model: 'fortuner' },
    // Nissan
    { brand: 'nissan', model: 'patrol' },
    { brand: 'nissan', model: 'x-trail' },
    { brand: 'nissan', model: 'altima' },
    { brand: 'nissan', model: 'maxima' },
    { brand: 'nissan', model: 'pathfinder' },
    // Lexus
    { brand: 'lexus', model: 'lx' },
    { brand: 'lexus', model: 'rx' },
    { brand: 'lexus', model: 'es' },
    { brand: 'lexus', model: 'gx' },
    // Mercedes-Benz
    { brand: 'mercedes-benz', model: 's-class' },
    { brand: 'mercedes-benz', model: 'e-class' },
    { brand: 'mercedes-benz', model: 'c-class' },
    { brand: 'mercedes-benz', model: 'gle' },
    { brand: 'mercedes-benz', model: 'g-class' },
    { brand: 'mercedes-benz', model: 'gls' },
    // BMW
    { brand: 'bmw', model: '3-series' },
    { brand: 'bmw', model: '5-series' },
    { brand: 'bmw', model: '7-series' },
    { brand: 'bmw', model: 'x5' },
    { brand: 'bmw', model: 'x6' },
    { brand: 'bmw', model: 'x7' },
    // Audi
    { brand: 'audi', model: 'q7' },
    { brand: 'audi', model: 'q5' },
    { brand: 'audi', model: 'a6' },
    { brand: 'audi', model: 'a4' },
    // Land Rover
    { brand: 'land-rover', model: 'range-rover' },
    { brand: 'land-rover', model: 'range-rover-sport' },
    { brand: 'land-rover', model: 'defender' },
    { brand: 'land-rover', model: 'discovery' },
    // Porsche
    { brand: 'porsche', model: '911' },
    { brand: 'porsche', model: 'cayenne' },
    { brand: 'porsche', model: 'macan' },
    { brand: 'porsche', model: 'panamera' },
    // Ford
    { brand: 'ford', model: 'f-150' },
    { brand: 'ford', model: 'mustang' },
    { brand: 'ford', model: 'explorer' },
    { brand: 'ford', model: 'ranger' },
    // Chevrolet
    { brand: 'chevrolet', model: 'tahoe' },
    { brand: 'chevrolet', model: 'silverado' },
    { brand: 'chevrolet', model: 'corvette' },
    { brand: 'chevrolet', model: 'suburban' },
    // GMC
    { brand: 'gmc', model: 'yukon' },
    { brand: 'gmc', model: 'sierra' },
    { brand: 'gmc', model: 'denali' },
    // Honda
    { brand: 'honda', model: 'accord' },
    { brand: 'honda', model: 'civic' },
    { brand: 'honda', model: 'cr-v' },
    { brand: 'honda', model: 'hr-v' },
    // Hyundai
    { brand: 'hyundai', model: 'tucson' },
    { brand: 'hyundai', model: 'santa-fe' },
    { brand: 'hyundai', model: 'elantra' },
    { brand: 'hyundai', model: 'creta' },
  ];

  popularModels.forEach(({ brand, model }) => {
    urls.push({
      url: `${BASE_URL}/cars/${brand}/${model}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    });
  });

  // 7. Partner/Showroom pages (active verified partners only)
  try {
    // Dynamic import to avoid build-time DB connection issues
    const { db, partner, eq, and, isNotNull } = await import('@alifh/database');

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

    // 8. Partner listing pages (all active partners - for inventory browsing)
    const allActivePartners = await db
      .select({ slug: partner.slug, updatedAt: partner.updatedAt })
      .from(partner)
      .where(and(eq(partner.status, 'active'), isNotNull(partner.slug)))
      .limit(500);

    if (allActivePartners && allActivePartners.length > 0) {
      allActivePartners.forEach((p) => {
        if (p.slug) {
          urls.push({
            url: `${BASE_URL}/cars/dealer/${p.slug}`,
            lastModified: p.updatedAt || new Date(),
            changeFrequency: 'daily',
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
