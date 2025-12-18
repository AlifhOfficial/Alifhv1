/**
 * Car Detail Page Component - Alifh Design System
 * Following "Less is More" principle with minimalist aesthetic
 * Matching car-card design language with modular 2-column layout
 */

'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useListingDetail } from '@/hooks/use-listing-detail';
import { useFavorites } from '@/hooks/favorites';
import { cn } from '@/lib/utils';
import { CarDetailContent } from '@/components/listing/car-detail-content';

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  
  const { data: listing, isLoading, error } = useListingDetail(listingId);
  const {
    isFavorite,
    isSuperliked,
    toggleFavorite,
    toggleSuperlike,
  } = useFavorites(listingId);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Listing Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }
  
  const isBlack = listing.isBlackMember;

  return (
    <div className={cn(
      "min-h-screen",
      isBlack ? "bg-black" : "bg-background"
    )}>
      {/* Header - Compact & Minimal */}
      <div className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-sm",
        isBlack 
          ? "bg-black/80 border-zinc-800" 
          : "bg-background/80 border-border/40"
      )}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                isBlack
                  ? "text-zinc-400 hover:text-zinc-200"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            
            <div className="flex items-center gap-1">
              <button
                onClick={toggleFavorite}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isFavorite
                    ? "text-rose-500"
                    : isBlack
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-muted-foreground/70 hover:text-foreground"
                )}
                aria-label={isFavorite ? "Remove favorite" : "Add to favorites"}
              >
                <Heart
                  className="h-4 w-4"
                  fill={isFavorite ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
              
              <button
                onClick={toggleSuperlike}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isSuperliked
                    ? "text-yellow-500"
                    : isBlack
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-muted-foreground/70 hover:text-foreground"
                )}
                aria-label={isSuperliked ? "Remove superlike" : "Superlike"}
              >
                <Sparkles
                  className="h-4 w-4"
                  fill={isSuperliked ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
              
              <button
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isBlack
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-muted-foreground/70 hover:text-foreground"
                )}
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Grid Layout */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Car Details */}
            <div className="lg:col-span-2">
              <CarDetailContent listing={listing} isBlack={isBlack} />
            </div>

            {/* Right Column - Seller Profile (Placeholder for future) */}
            <div className="lg:col-span-1">
              <div className={cn(
                "p-6 rounded-xl border sticky top-24",
                isBlack
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-card border-border/40"
              )}>
                <h3 className={cn(
                  "text-sm font-bold uppercase tracking-wider mb-4",
                  isBlack ? "text-zinc-300" : "text-foreground"
                )}>
                  Contact Seller
                </h3>
                <p className={cn(
                  "text-xs",
                  isBlack ? "text-zinc-400" : "text-muted-foreground"
                )}>
                  Seller contact information will be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
