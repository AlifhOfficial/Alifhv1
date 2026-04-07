/**
 * Dynamic Hub Pages - Location OR Brand - SEO Optimized
 * Handles both:
 * - /cars/dubai (location)
 * - /cars/toyota (brand)
 * 
 * Smart routing: checks if slug is a location first, then brand
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CAR_MAKES, UAE_EMIRATES } from '@/lib/filter-constants';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

type CarMake = typeof CAR_MAKES[number];
type Emirates = typeof UAE_EMIRATES[number]['value'];
type SpecType = 'gcc' | 'american' | 'european' | 'japanese';
type BlackListing = 'black';

// Black listings metadata (quality-verified cars)
const BLACK_META = {
  name: 'Black Listings',
  displayName: 'Black Verified Cars',
  description: 'Browse Black verified cars in UAE. Quality-first listings with complete transparency. Connect with trusted sellers offering excellence.',
  slug: 'black-listings',
};

// Specs metadata (regional specifications)
const SPECS_META: Record<SpecType, { name: string; displayName: string; description: string; slug: string }> = {
  gcc: {
    name: 'GCC Specs',
    displayName: 'GCC Specs',
    description: 'Browse GCC specs cars for sale in UAE. Full warranty coverage, easy registration, and regional specifications. Quality listings from dealers and private sellers.',
    slug: 'gcc-specs',
  },
  american: {
    name: 'American Specs',
    displayName: 'American Specs',
    description: 'Find American specs cars in UAE. Import vehicles with US specifications. Browse quality listings. Connect with trusted sellers.',
    slug: 'american-specs',
  },
  european: {
    name: 'European Specs',
    displayName: 'European Specs',
    description: 'European specs cars for sale in UAE. Browse import vehicles with EU specifications. Quality listings from dealers and private sellers.',
    slug: 'european-specs',
  },
  japanese: {
    name: 'Japanese Specs',
    displayName: 'Japanese Specs',
    description: 'Japanese specs cars for sale in UAE. Import vehicles with JDM specifications. Browse quality listings with full transparency.',
    slug: 'japanese-specs',
  },
};

// Location metadata
const EMIRATE_META: Record<Emirates, { name: string; displayName: string; description: string }> = {
  dubai: {
    name: 'Dubai',
    displayName: 'Dubai',
    description: 'Find used cars for sale in Dubai. Browse new and second-hand cars from private sellers and dealers. Free listings, no commission.',
  },
  abu_dhabi: {
    name: 'Abu Dhabi',
    displayName: 'Abu Dhabi',
    description: 'Browse used cars for sale in Abu Dhabi. Connect with private sellers and dealers. Book test drives online.',
  },
  sharjah: {
    name: 'Sharjah',
    displayName: 'Sharjah',
    description: 'Used cars for sale in Sharjah. Browse second-hand cars from trusted sellers. No hidden fees.',
  },
  ajman: {
    name: 'Ajman',
    displayName: 'Ajman',
    description: 'Find and buy used cars in Ajman. Free for private sellers. Book test drives instantly.',
  },
  ras_al_khaimah: {
    name: 'Ras Al Khaimah',
    displayName: 'Ras Al Khaimah',
    description: 'Used cars for sale in Ras Al Khaimah. Quality listings. Connect with sellers directly. Zero commission marketplace.',
  },
  fujairah: {
    name: 'Fujairah',
    displayName: 'Fujairah',
    description: 'Browse used cars in Fujairah. Buy from private sellers and dealers. Free test drive booking.',
  },
  umm_al_quwain: {
    name: 'Umm Al Quwain',
    displayName: 'Umm Al Quwain',
    description: 'Find used cars for sale in Umm Al Quwain. No paid boosts or hidden fees.',
  },
};

interface PageProps {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams() {
  const params: { brand: string }[] = [];
  
  // Add all locations
  UAE_EMIRATES.forEach((emirate) => {
    params.push({ brand: emirate.value });
  });
  
  // Add all brands
  CAR_MAKES.forEach((make) => {
    params.push({
      brand: make.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
    });
  });
  
  // Add all specs types
  Object.values(SPECS_META).forEach((spec) => {
    params.push({ brand: spec.slug });
  });
  
  // Add Black listings
  params.push({ brand: BLACK_META.slug });
  
  return params;
}

function getBlackFromSlug(slug: string): BlackListing | null {
  return slug === BLACK_META.slug ? 'black' : null;
}

function getSpecFromSlug(slug: string): SpecType | null {
  const spec = Object.entries(SPECS_META).find(([_, meta]) => meta.slug === slug);
  return spec ? (spec[0] as SpecType) : null;
}

function getLocationFromSlug(slug: string): Emirates | null {
  const emirate = UAE_EMIRATES.find(e => e.value === slug);
  return emirate ? emirate.value : null;
}

function getBrandFromSlug(slug: string): CarMake | null {
  // Try exact match first (handles Mercedes-Benz, Rolls-Royce correctly)
  const exactMatch = CAR_MAKES.find(
    make => make.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
  if (exactMatch) return exactMatch;
  
  // Try with 'and' -> '&' conversion (handles Lynk & Co)
  const withAmpersand = slug.replace(/and/g, '&');
  const ampersandMatch = CAR_MAKES.find(
    make => make.toLowerCase().replace(/\s+/g, '-') === withAmpersand.toLowerCase()
  );
  if (ampersandMatch) return ampersandMatch;
  
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: slug } = await params;
  const ogImage = '/opengraph-image';
  
  // Check if it's Black listings first (highest priority)
  const isBlack = getBlackFromSlug(slug);
  if (isBlack) {
    return {
      title: `${BLACK_META.displayName} for Sale in UAE | Quality First | Revvup`,
      description: REVVUP_META_DESCRIPTION,
      keywords: 'black verified cars uae, quality cars dubai, verified listings uae, black cars for sale, trusted sellers uae, quality first cars dubai, verified dealers uae, excellence cars dubai',
      openGraph: {
        title: `${BLACK_META.displayName} for Sale in UAE | Revvup`,
        description: REVVUP_META_DESCRIPTION,
        type: 'website',
        url: `https://revvup.ae/cars/${slug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${BLACK_META.displayName} on Revvup`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${BLACK_META.displayName} for Sale in UAE | Revvup`,
        description: REVVUP_META_DESCRIPTION,
        images: ['/twitter-image'],
      },
      alternates: {
        canonical: `https://revvup.ae/cars/${slug}`,
      },
    };
  }
  
  // Check if it's a spec type
  const specType = getSpecFromSlug(slug);
  if (specType) {
    const spec = SPECS_META[specType];
    return {
      title: `${spec.displayName} Cars for Sale in UAE | Quality Listings | Revvup`,
      description: REVVUP_META_DESCRIPTION,
      keywords: `${spec.name.toLowerCase()} cars uae, ${spec.name.toLowerCase()} dubai, ${spec.slug} cars for sale, buy ${spec.slug} uae, ${spec.name.toLowerCase()} vehicles dubai, regional specs cars uae`,
      openGraph: {
        title: `${spec.displayName} Cars for Sale in UAE | Revvup`,
        description: REVVUP_META_DESCRIPTION,
        type: 'website',
        url: `https://revvup.ae/cars/${slug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${spec.displayName} cars on Revvup`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${spec.displayName} Cars for Sale in UAE | Revvup`,
        description: REVVUP_META_DESCRIPTION,
        images: ['/twitter-image'],
      },
      alternates: {
        canonical: `https://revvup.ae/cars/${slug}`,
      },
    };
  }
  
  // Check if it's a location
  const location = getLocationFromSlug(slug);
  if (location) {
    const emirate = EMIRATE_META[location];
    return {
      title: `Used Cars for Sale in ${emirate.displayName} | No Ads | Revvup`,
      description: REVVUP_META_DESCRIPTION,
      keywords: `used cars ${emirate.name.toLowerCase()}, cars for sale ${emirate.name.toLowerCase()}, buy car ${emirate.name.toLowerCase()}, second hand cars ${emirate.name.toLowerCase()}, ${emirate.name.toLowerCase()} used cars, sell car ${emirate.name.toLowerCase()}`,
      openGraph: {
        title: `Used Cars for Sale in ${emirate.displayName} | Revvup`,
        description: REVVUP_META_DESCRIPTION,
        type: 'website',
        url: `https://revvup.ae/cars/${slug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `Used cars for sale in ${emirate.displayName} on Revvup`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Used Cars for Sale in ${emirate.displayName} | Revvup`,
        description: REVVUP_META_DESCRIPTION,
        images: ['/twitter-image'],
      },
      alternates: {
        canonical: `https://revvup.ae/cars/${slug}`,
      },
    };
  }
  
  // Otherwise, it's a brand
  const brand = getBrandFromSlug(slug);
  if (!brand) {
    return { title: 'Not Found | Revvup' };
  }

  const description = REVVUP_META_DESCRIPTION;

  return {
    title: `${brand} Cars for Sale in UAE | Used & New | Revvup`,
    description,
    keywords: `${brand.toLowerCase()} cars uae, used ${brand.toLowerCase()} dubai, ${brand.toLowerCase()} for sale uae, buy ${brand.toLowerCase()} dubai, ${brand.toLowerCase()} dealers uae, second hand ${brand.toLowerCase()} dubai`,
    openGraph: {
      title: `${brand} Cars for Sale in UAE | Revvup`,
      description,
      type: 'website',
      url: `https://revvup.ae/cars/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brand} cars for sale on Revvup`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand} Cars for Sale in UAE | Revvup`,
      description,
      images: ['/twitter-image'],
    },
    alternates: {
      canonical: `https://revvup.ae/cars/${slug}`,
    },
  };
}

// ISR: Static redirect pages, cached until redeploy

export default async function HubPage({ params }: PageProps) {
  const { brand: slug } = await params;
  
  // Check if it's Black listings - redirect to /listings with black=true filter
  const isBlack = getBlackFromSlug(slug);
  if (isBlack) {
    redirect(`/listings?black=true&sort=relevance`);
  }
  
  // Check if it's a spec type - redirect to /listings with specs filter
  const specType = getSpecFromSlug(slug);
  if (specType) {
    redirect(`/listings?specs=${encodeURIComponent(specType)}`);
  }
  
  // Check if it's a location - redirect to /listings with emirate filter
  const location = getLocationFromSlug(slug);
  if (location) {
    redirect(`/listings?emirate=${encodeURIComponent(location)}`);
  }
  
  // Otherwise, it's a brand - redirect to /listings with make filter
  const brand = getBrandFromSlug(slug);
  if (!brand) {
    notFound();
  }

  redirect(`/listings?make=${encodeURIComponent(brand)}`);
}

function _PageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-8">
      <div className="max-w-[1600px] mx-auto px-4 compact:px-6 large:px-8">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
