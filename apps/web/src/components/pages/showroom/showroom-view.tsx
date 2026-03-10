/**
 * Showroom View Component
 * 
 * Public showroom page view - fetches data via API hook.
 * No direct database calls.
 */

'use client';

import { usePublicShowroom } from '@/hooks/showroom';
import type { ShowroomData } from '@/components/pages/showroom/types';
import {
  ShowroomHero,
  ShowroomInventory,
  ShowroomStory,
  ShowroomFounder,
  ShowroomGallery,
  ShowroomAchievements,
  ShowroomServices,
  ShowroomTeam,
  ShowroomTestimonials,
  ShowroomContact,
  ShowroomFooter,
} from '@/components/pages/showroom';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface ShowroomViewProps {
  slug: string;
  /**
   * Initial showroom data from server-side fetch.
   * When provided, content renders immediately.
   */
  initialShowroom?: ShowroomData | null;
  /**
   * Initial listings data from server-side fetch.
   * Avoids client-side waterfall for inventory section.
   */
  initialListings?: any | null;
}

/**
 * Loading skeleton for showroom
 */
function ShowroomSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton - matches showroom-hero layout */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1600px] mx-auto">
          {/* Brand Name & Tagline - Top, Centered */}
          <div className="px-4 sm:px-6 lg:px-8 mb-8 text-center">
            {/* Brand name label */}
            <Skeleton className="h-3 w-20 mx-auto mb-3" />
            {/* Tagline */}
            <Skeleton className="h-8 w-80 max-w-full mx-auto" />
          </div>
          
          {/* Hero Media - 21/9 aspect ratio */}
          <div className="px-4 sm:px-6 lg:px-8">
            <Skeleton className="w-full aspect-[21/9] rounded-2xl" />
          </div>
        </div>
      </section>
      
      {/* Inventory Preview Skeleton */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Car cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Story Section Skeleton */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1600px] mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="max-w-3xl">
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          </div>
          <div className="px-4 sm:px-6 lg:px-8">
            <Skeleton className="w-full aspect-[21/9] rounded-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Error state component
 */
function ShowroomError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-2xl font-medium text-foreground mb-2">Showroom Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This showroom may have been removed or is no longer available.
        </p>
        <Link 
          href="/listings" 
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Browse Listings
        </Link>
      </div>
    </div>
  );
}

export function ShowroomView({ slug, initialShowroom, initialListings }: ShowroomViewProps) {
  // Guard against undefined/invalid slug - must be valid CUID-like (20+ chars)
  const isValidSlug = !!slug && slug !== 'undefined' && slug !== 'null' && slug.length >= 10;
  
  const { showroom, isLoading, error } = usePublicShowroom(
    isValidSlug ? slug : null,
    { initialShowroom }
  );
  
  // Show content immediately if we have initial data
  // Only show skeleton if we have no data yet
  if (!showroom && (!isValidSlug || isLoading)) {
    return <ShowroomSkeleton />;
  }
  
  // Error or not found
  if (error || !showroom || !showroom.partner) {
    return <ShowroomError />;
  }
  
  // Cast to expected shape for components
  const showroomData = showroom as Parameters<typeof ShowroomHero>[0]['showroom'];

  return (
    <div className="min-h-screen bg-background">
      <ShowroomHero showroom={showroomData} />
      <ShowroomInventory showroom={showroomData} initialListings={initialListings} />
      <ShowroomStory showroom={showroomData} />
      <ShowroomFounder showroom={showroomData} />
      <ShowroomGallery showroom={showroomData} />
      <ShowroomAchievements showroom={showroomData} />
      <ShowroomServices showroom={showroomData} />
      <ShowroomTeam showroom={showroomData} />
      <ShowroomTestimonials showroom={showroomData} />
      <ShowroomContact showroom={showroomData} />
      <ShowroomFooter showroom={showroomData} />
    </div>
  );
}
