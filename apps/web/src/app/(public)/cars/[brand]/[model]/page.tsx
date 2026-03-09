/**
 * Dynamic Model Hub Pages - SEO Optimized
 * /cars/toyota/land-cruiser, /cars/nissan/patrol, etc.
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ListingsView } from '@/components/listings/listings-view';
import { CAR_MAKES, CAR_MODELS } from '@/lib/filter-constants';

type CarMake = typeof CAR_MAKES[number];

interface PageProps {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateStaticParams() {
  const paths: { brand: string; model: string }[] = [];
  
  // Generate paths for all brand/model combinations
  CAR_MAKES.forEach((make) => {
    const models = CAR_MODELS[make] || [];
    models.forEach((model) => {
      paths.push({
        brand: make.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
        model: model.toLowerCase().replace(/\s+/g, '-'),
      });
    });
  });
  
  return paths;
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

function getModelFromSlug(brand: CarMake, slug: string): string | null {
  const models = CAR_MODELS[brand] || [];
  const normalized = slug.replace(/-/g, ' ').toLowerCase();
  const model = models.find(
    m => m.toLowerCase().replace(/-/g, ' ') === normalized
  );
  return model || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = getBrandFromSlug(brandSlug);
  
  if (!brand) {
    return { title: 'Brand Not Found | Revvup' };
  }
  
  const model = getModelFromSlug(brand, modelSlug);
  
  if (!model) {
    return { title: 'Model Not Found | Revvup' };
  }

  const title = `${brand} ${model} for Sale in UAE | Used & New | Revvup`;
  const description = `Find used ${brand} ${model} for sale in Dubai and UAE. Quality listings. Connect with private sellers and dealers. Book test drives online. Zero commission.`;

  return {
    title,
    description,
    keywords: `${brand.toLowerCase()} ${model.toLowerCase()} uae, ${brand.toLowerCase()} ${model.toLowerCase()} dubai, ${brand.toLowerCase()} ${model.toLowerCase()} for sale, used ${brand.toLowerCase()} ${model.toLowerCase()}, buy ${brand.toLowerCase()} ${model.toLowerCase()} uae`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://revvup.ae/cars/${brandSlug}/${modelSlug}`,
    },
    alternates: {
      canonical: `https://revvup.ae/cars/${brandSlug}/${modelSlug}`,
    },
  };
}

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default async function ModelPage({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = getBrandFromSlug(brandSlug);
  
  if (!brand) {
    notFound();
  }
  
  const model = getModelFromSlug(brand, modelSlug);
  
  if (!model) {
    notFound();
  }

  // Redirect to /listings with make and model filters
  redirect(`/listings?make=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`);
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
