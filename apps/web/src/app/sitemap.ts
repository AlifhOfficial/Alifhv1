import { MetadataRoute } from 'next';
import { CAR_MAKES, UAE_EMIRATES } from '@/lib/filter-constants';
import { staticPages, toolPages } from '@/lib/navigation';

const BASE_URL = 'https://revvup.ae';

// Force dynamic generation - don't cache sitemap at build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

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

  // 2. Tools pages (SEO traffic magnets - from centralized config)
  urls.push({
    url: `${BASE_URL}/tools`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  toolPages.forEach((tool) => {
    urls.push({
      url: `${BASE_URL}/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
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
    // Skip brands with special characters that cause URL issues
    if (make === 'Citroën') return;
    
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

  // 6. Model hub pages (top models per brand - Based on UAE market trends)
  const popularModels = [
    // Mercedes-Benz (3924 listings - #1 in UAE)
    { brand: 'mercedes-benz', model: 'G-Class' },
    { brand: 'mercedes-benz', model: 'S-Class' },
    { brand: 'mercedes-benz', model: 'E-Class' },
    { brand: 'mercedes-benz', model: 'C-Class' },
    { brand: 'mercedes-benz', model: 'GLE' },
    { brand: 'mercedes-benz', model: 'GLS' },
    { brand: 'mercedes-benz', model: 'GLC' },
    { brand: 'mercedes-benz', model: 'GLA' },
    { brand: 'mercedes-benz', model: 'A-Class' },
    { brand: 'mercedes-benz', model: 'AMG GT' },
    // Toyota (2212 listings - #2 in UAE)
    { brand: 'toyota', model: 'Land Cruiser' },
    { brand: 'toyota', model: 'Land Cruiser 300' },
    { brand: 'toyota', model: 'Land Cruiser Prado' },
    { brand: 'toyota', model: 'Hilux' },
    { brand: 'toyota', model: 'Camry' },
    { brand: 'toyota', model: 'Corolla' },
    { brand: 'toyota', model: 'Fortuner' },
    { brand: 'toyota', model: 'RAV4' },
    { brand: 'toyota', model: 'Yaris' },
    { brand: 'toyota', model: 'GR Supra' },
    // BMW (1957 listings - #3 in UAE)
    { brand: 'bmw', model: 'X5' },
    { brand: 'bmw', model: 'X6' },
    { brand: 'bmw', model: 'X7' },
    { brand: 'bmw', model: '7-Series' },
    { brand: 'bmw', model: '5-Series' },
    { brand: 'bmw', model: '3-Series' },
    { brand: 'bmw', model: 'M3' },
    { brand: 'bmw', model: 'M4' },
    { brand: 'bmw', model: 'M5' },
    { brand: 'bmw', model: 'X3' },
    { brand: 'bmw', model: 'X4' },
    // Nissan (1757 listings - #4 in UAE)
    { brand: 'nissan', model: 'Patrol' },
    { brand: 'nissan', model: 'X-Trail' },
    { brand: 'nissan', model: 'Altima' },
    { brand: 'nissan', model: 'Maxima' },
    { brand: 'nissan', model: 'Pathfinder' },
    { brand: 'nissan', model: 'Armada' },
    { brand: 'nissan', model: 'Kicks' },
    { brand: 'nissan', model: 'Z' },
    // Land Rover (1492 listings - #5 in UAE)
    { brand: 'land-rover', model: 'Range Rover' },
    { brand: 'land-rover', model: 'Range Rover Sport' },
    { brand: 'land-rover', model: 'Defender' },
    { brand: 'land-rover', model: 'Discovery' },
    { brand: 'land-rover', model: 'Range Rover Velar' },
    { brand: 'land-rover', model: 'Range Rover Evoque' },
    { brand: 'land-rover', model: 'Discovery Sport' },
    // Porsche (1108 listings - #6 in UAE)
    { brand: 'porsche', model: 'Cayenne' },
    { brand: 'porsche', model: 'Macan' },
    { brand: 'porsche', model: '911' },
    { brand: 'porsche', model: 'Panamera' },
    { brand: 'porsche', model: 'Taycan' },
    { brand: 'porsche', model: '718 Cayman' },
    { brand: 'porsche', model: '718 Boxster' },
    // Ford (1096 listings - #7 in UAE)
    { brand: 'ford', model: 'F-150' },
    { brand: 'ford', model: 'Mustang' },
    { brand: 'ford', model: 'Explorer' },
    { brand: 'ford', model: 'Ranger' },
    { brand: 'ford', model: 'Raptor' },
    { brand: 'ford', model: 'Expedition' },
    { brand: 'ford', model: 'Bronco' },
    // Audi (912 listings - #8 in UAE)
    { brand: 'audi', model: 'Q7' },
    { brand: 'audi', model: 'Q5' },
    { brand: 'audi', model: 'Q8' },
    { brand: 'audi', model: 'A6' },
    { brand: 'audi', model: 'A4' },
    { brand: 'audi', model: 'A8' },
    { brand: 'audi', model: 'RS6' },
    { brand: 'audi', model: 'RS7' },
    { brand: 'audi', model: 'e-tron' },
    // Hyundai (713 listings - #9 in UAE)
    { brand: 'hyundai', model: 'Tucson' },
    { brand: 'hyundai', model: 'Santa Fe' },
    { brand: 'hyundai', model: 'Palisade' },
    { brand: 'hyundai', model: 'Elantra' },
    { brand: 'hyundai', model: 'Creta' },
    { brand: 'hyundai', model: 'Sonata' },
    { brand: 'hyundai', model: 'Ioniq 5' },
    // Jeep (686 listings - #10 in UAE)
    { brand: 'jeep', model: 'Wrangler' },
    { brand: 'jeep', model: 'Grand Cherokee' },
    { brand: 'jeep', model: 'Gladiator' },
    { brand: 'jeep', model: 'Wagoneer' },
    { brand: 'jeep', model: 'Grand Wagoneer' },
    { brand: 'jeep', model: 'Compass' },
    // Lexus (553 listings)
    { brand: 'lexus', model: 'LX' },
    { brand: 'lexus', model: 'RX' },
    { brand: 'lexus', model: 'ES' },
    { brand: 'lexus', model: 'GX' },
    { brand: 'lexus', model: 'LS' },
    { brand: 'lexus', model: 'NX' },
    { brand: 'lexus', model: 'LC' },
    // Chevrolet (512 listings)
    { brand: 'chevrolet', model: 'Tahoe' },
    { brand: 'chevrolet', model: 'Suburban' },
    { brand: 'chevrolet', model: 'Silverado' },
    { brand: 'chevrolet', model: 'Corvette' },
    { brand: 'chevrolet', model: 'Camaro' },
    // GMC (200 listings)
    { brand: 'gmc', model: 'Yukon' },
    { brand: 'gmc', model: 'Sierra' },
    { brand: 'gmc', model: 'Terrain' },
    { brand: 'gmc', model: 'Acadia' },
    // Honda (375 listings)
    { brand: 'honda', model: 'Accord' },
    { brand: 'honda', model: 'Civic' },
    { brand: 'honda', model: 'CR-V' },
    { brand: 'honda', model: 'HR-V' },
    { brand: 'honda', model: 'Pilot' },
    // Kia (627 listings)
    { brand: 'kia', model: 'Sportage' },
    { brand: 'kia', model: 'Sorento' },
    { brand: 'kia', model: 'Telluride' },
    { brand: 'kia', model: 'Seltos' },
    { brand: 'kia', model: 'Carnival' },
    { brand: 'kia', model: 'Stinger' },
    { brand: 'kia', model: 'EV6' },
    // Mitsubishi (619 listings)
    { brand: 'mitsubishi', model: 'Pajero' },
    { brand: 'mitsubishi', model: 'Outlander' },
    { brand: 'mitsubishi', model: 'Montero' },
    { brand: 'mitsubishi', model: 'L200' },
    { brand: 'mitsubishi', model: 'Eclipse Cross' },
    // Volkswagen (634 listings)
    { brand: 'volkswagen', model: 'Tiguan' },
    { brand: 'volkswagen', model: 'Touareg' },
    { brand: 'volkswagen', model: 'Golf' },
    { brand: 'volkswagen', model: 'Passat' },
    { brand: 'volkswagen', model: 'Teramont' },
    // Ferrari (546 listings)
    { brand: 'ferrari', model: 'F8' },
    { brand: 'ferrari', model: '488' },
    { brand: 'ferrari', model: 'Roma' },
    { brand: 'ferrari', model: '812' },
    { brand: 'ferrari', model: 'SF90' },
    // Rolls-Royce (530 listings)
    { brand: 'rolls-royce', model: 'Phantom' },
    { brand: 'rolls-royce', model: 'Ghost' },
    { brand: 'rolls-royce', model: 'Cullinan' },
    { brand: 'rolls-royce', model: 'Wraith' },
    // Lamborghini (396 listings)
    { brand: 'lamborghini', model: 'Urus' },
    { brand: 'lamborghini', model: 'Huracan' },
    { brand: 'lamborghini', model: 'Aventador' },
    { brand: 'lamborghini', model: 'Revuelto' },
    // MG (347 listings)
    { brand: 'mg', model: 'HS' },
    { brand: 'mg', model: 'ZS' },
    { brand: 'mg', model: 'ZS EV' },
    { brand: 'mg', model: '5' },
    // Infiniti (344 listings)
    { brand: 'infiniti', model: 'QX80' },
    { brand: 'infiniti', model: 'QX60' },
    { brand: 'infiniti', model: 'QX50' },
    { brand: 'infiniti', model: 'Q50' },
    // Mazda (341 listings)
    { brand: 'mazda', model: 'CX-5' },
    { brand: 'mazda', model: 'CX-9' },
    { brand: 'mazda', model: '3' },
    { brand: 'mazda', model: '6' },
    { brand: 'mazda', model: 'CX-30' },
    // BYD (326 listings)
    { brand: 'byd', model: 'Atto 3' },
    { brand: 'byd', model: 'Seal' },
    { brand: 'byd', model: 'Tang' },
    { brand: 'byd', model: 'Han' },
    // Bentley (312 listings)
    { brand: 'bentley', model: 'Bentayga' },
    { brand: 'bentley', model: 'Continental GT' },
    { brand: 'bentley', model: 'Flying Spur' },
    // Tesla (310 listings)
    { brand: 'tesla', model: 'Model 3' },
    { brand: 'tesla', model: 'Model S' },
    { brand: 'tesla', model: 'Model X' },
    { brand: 'tesla', model: 'Model Y' },
  ];

  popularModels.forEach(({ brand, model }) => {
    // Slugify model name to match dynamic route format
    const modelSlug = model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    urls.push({
      url: `${BASE_URL}/cars/${brand}/${modelSlug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    });
  });

  // 7. Partner/Showroom pages (active verified partners only)
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
