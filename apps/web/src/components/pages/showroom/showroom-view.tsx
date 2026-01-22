/**
 * Showroom View Component
 * 
 * Public showroom page view - fetches data via API hook.
 * No direct database calls.
 */

'use client';

import { usePublicShowroom } from '@/hooks/showroom';
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
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ShowroomViewProps {
  slug: string;
}

/**
 * Loading skeleton for showroom
 */
function ShowroomSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            {/* Logo skeleton */}
            <div className="w-14 h-14 mx-auto mb-6 rounded-lg bg-muted animate-pulse" />
            {/* Brand name skeleton */}
            <div className="h-3 w-24 mx-auto mb-4 bg-muted animate-pulse rounded" />
            {/* Tagline skeleton */}
            <div className="h-8 w-96 max-w-full mx-auto mb-4 bg-muted animate-pulse rounded" />
          </div>
          {/* Hero image skeleton */}
          <div className="aspect-[16/9] max-h-[600px] rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
      
      {/* Content skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
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

export function ShowroomView({ slug }: ShowroomViewProps) {
  // Guard against undefined/invalid slug - must be valid CUID-like (20+ chars)
  const isValidSlug = !!slug && slug !== 'undefined' && slug !== 'null' && slug.length >= 10;
  
  const { showroom, isLoading, error } = usePublicShowroom(
    isValidSlug ? slug : null
  );
  
  // Loading state (or waiting for valid slug)
  if (!isValidSlug || isLoading) {
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
      <ShowroomInventory showroom={showroomData} />
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
