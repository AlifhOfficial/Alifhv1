/**
 * SEO Schema Generator - Vehicle Structured Data
 * Generates schema.org/Car JSON-LD for rich snippets in search results
 * 
 * @see https://schema.org/Car
 * @see https://developers.google.com/search/docs/appearance/structured-data/vehicle-listing
 */

import { BRAND_LOGO_SCHEMA_URL } from '@/lib/brand-assets';

interface ListingForSchema {
  id: string;
  slug?: string | null;
  vin?: string | null;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  condition: string;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  mileage: number;
  price: number;
  currency: string;
  description?: string | null;
  images: string[];
  thumbnail?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  emirate: string;
  city?: string | null;
  createdAt: Date | string;
  sellerType: string;
  partnerBrandName?: string | null;
  userId?: string | null;
}

interface SellerForSchema {
  type: 'partner' | 'user';
  name?: string;
  verified?: boolean;
}

/**
 * Generate schema.org/Car structured data for a listing
 * This helps Google show rich snippets in search results
 */
export function generateVehicleSchema(
  listing: ListingForSchema,
  seller?: SellerForSchema
) {
  const baseUrl = 'https://revvup.ae';
  const listingUrl = `${baseUrl}/listings/${listing.id}`;
  
  // Map our condition to schema.org values
  const conditionMap: Record<string, string> = {
    'new': 'https://schema.org/NewCondition',
    'used': 'https://schema.org/UsedCondition',
  };

  // Map body types to schema.org values
  const bodyTypeMap: Record<string, string> = {
    'sedan': 'Sedan',
    'suv': 'SUV',
    'coupe': 'Coupe',
    'convertible': 'Convertible',
    'hatchback': 'Hatchback',
    'wagon': 'StationWagon',
    'pickup': 'Truck',
    'van': 'Van',
    'sports': 'SportsCar',
    'luxury': 'LuxuryCar',
  };

  // Map fuel types to schema.org values
  const fuelTypeMap: Record<string, string> = {
    'petrol': 'Gasoline',
    'diesel': 'Diesel',
    'electric': 'Electric',
    'hybrid': 'Hybrid',
    'plugin_hybrid': 'Hybrid',
    'hydrogen': 'Hydrogen',
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    
    // Basic identification
    name: `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`,
    url: listingUrl,
    
    // Vehicle details
    brand: {
      '@type': 'Brand',
      name: listing.make,
    },
    model: listing.model,
    productionDate: listing.year.toString(),
    ...(listing.vin && { vehicleIdentificationNumber: listing.vin }),
    
    // Condition
    itemCondition: conditionMap[listing.condition] || 'https://schema.org/UsedCondition',
    
    // Specifications
    ...(listing.bodyType && bodyTypeMap[listing.bodyType] && {
      bodyType: bodyTypeMap[listing.bodyType],
    }),
    ...(listing.fuelType && fuelTypeMap[listing.fuelType] && {
      fuelType: fuelTypeMap[listing.fuelType],
    }),
    ...(listing.transmission && {
      vehicleTransmission: listing.transmission === 'automatic' ? 'Automatic' : 'Manual',
    }),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: listing.mileage,
      unitCode: 'KMT', // Kilometers
    },
    ...(listing.exteriorColor && {
      color: listing.exteriorColor,
    }),
    
    // Pricing
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency,
      availability: 'https://schema.org/InStock',
      url: listingUrl,
      ...(seller && {
        seller: seller.type === 'partner' 
          ? {
              '@type': 'Organization',
              name: seller.name || listing.partnerBrandName || 'Verified Dealer',
            }
          : {
              '@type': 'Person',
              name: 'Private Seller',
            },
      }),
    },
    
    // Images
    ...(listing.images.length > 0 && {
      image: listing.images.slice(0, 5).map(img => 
        img.startsWith('http') ? img : `${baseUrl}${img}`
      ),
    }),
    
    // Description
    ...(listing.description && {
      description: listing.description.slice(0, 500), // Limit for SEO
    }),
    
    // Location
    ...(listing.emirate && {
      availableAtOrFrom: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: listing.city || listing.emirate,
          addressRegion: listing.emirate,
          addressCountry: 'AE',
        },
      },
    }),
  };

  return schema;
}

/**
 * Generate Organization schema for Revvup marketplace
 * Should be added to homepage and main pages
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Revvup',
    url: 'https://revvup.ae',
    logo: BRAND_LOGO_SCHEMA_URL,
    description: 'Revvup is a UAE car marketplace where buyers browse for free and dealers list on a flat subscription — no commissions, no pay-to-rank, no hidden fees.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AE',
    },
    sameAs: [
      // Add social media links when available
    ],
  };
}

/**
 * Generate WebSite schema with search action for sitewide search
 * Should be added to the homepage
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Revvup',
    url: 'https://revvup.ae',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://revvup.ae/listings?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

interface ShowroomForSchema {
  slug: string;
  brandName: string;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  emirate?: string | null;
  city?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

/**
 * Generate AutoDealer schema for showroom pages
 * Helps search engines and LLMs understand dealer entities
 */
export function generateAutoDealerSchema(showroom: ShowroomForSchema) {
  const baseUrl = 'https://revvup.ae';
  const showroomUrl = `${baseUrl}/showroom/${showroom.slug}`;
  const locationLabel = showroom.city && showroom.emirate
    ? `${showroom.city}, ${showroom.emirate}`
    : showroom.emirate || 'UAE';

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: showroom.brandName,
    url: showroomUrl,
    ...(showroom.logoUrl && { logo: showroom.logoUrl }),
    ...(showroom.imageUrl && { image: showroom.imageUrl }),
    ...(showroom.description && { description: showroom.description }),
    ...(showroom.website && { sameAs: [showroom.website] }),
    ...(showroom.phone && { telephone: showroom.phone }),
    address: {
      '@type': 'PostalAddress',
      ...(showroom.address && { streetAddress: showroom.address }),
      ...(showroom.city && { addressLocality: showroom.city }),
      addressRegion: showroom.emirate || 'UAE',
      addressCountry: 'AE',
    },
    areaServed: locationLabel,
    ...(showroom.googleRating && showroom.googleReviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: showroom.googleRating,
        reviewCount: showroom.googleReviewCount,
      },
    }),
  };
}

/**
 * Generate BreadcrumbList schema for better navigation in search results
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
