/**
 * Listing Detail View Component - Redesigned
 * 
 * Main view for the public listing detail page.
 * Left side: Car details (images, specs, features)
 * Right side: Seller profile, booking, contact, timestamp, EMI calculator, location
 * 
 * Architecture: Component fetches its own data via useListingDetail hook
 * Follows the pattern used across the app for data fetching
 */

'use client';

import { CarCardDetailed } from '@/components/inventory';
import { BookingModal } from '@/components/features/bookings/shared';
import { SellerProfileCard } from './seller-profile-card';
import { ContactSection } from './contact-section';
import { EMICalculator } from './emi-calculator';
import { LocationSection } from './location-section';
import { ListingTimestamp } from './listing-timestamp';
import { SimilarListings } from './similar-listings';
import { JsonLd } from '@/components/seo/json-ld';
import { generateVehicleSchema } from '@/lib/seo-schema';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCreateConversation } from '@/hooks/messaging';
import { useListingDetail, useTrackView, type SellerData } from '@/hooks/listings';
import { useAuth } from '@/providers/auth-provider';
import type { CarDetailedData } from '@alifh/database';
import type { SimilarListingCard } from '@/hooks/listings/use-similar-listings';
import type { PublicBookingAvailabilityResponse } from '@/lib/bookings/public-availability';

// Re-export types for backwards compatibility
export type { PartnerSellerData, UserSellerData, SellerData } from '@/hooks/listings';

const LAST_PUBLIC_LISTINGS_URL_KEY = 'revvup:last-public-listings-url';

interface ListingDetailViewProps {
  listingId: string;
  /** 
   * Initial listing data from server-side fetch.
   * When provided, images render immediately without waiting for client fetch.
   */
  initialListing?: CarDetailedData | null;
  /**
   * Initial seller data from server-side fetch.
   * When provided, seller profile renders immediately.
   */
  initialSellerData?: SellerData | null;
  initialSimilarListings?: SimilarListingCard[];
  initialBookingAvailability?: PublicBookingAvailabilityResponse | null;
}

export function ListingDetailView({
  listingId,
  initialListing,
  initialSellerData,
  initialSimilarListings,
  initialBookingAvailability,
}: ListingDetailViewProps) {
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { createConversation } = useCreateConversation();
  const { session: user, isAuthenticated } = useAuth();
  const { trackView } = useTrackView();
  
  // Fetch listing data via hook - pass initial data for instant display
  const { listing, sellerData, isAdminPreview, isLoading, error } = useListingDetail(listingId, {
    initialListing,
    initialSellerData,
  });
  
  // Track view when listing loads successfully (fire-and-forget)
  // Only track for live/public listings - not admin previews
  useEffect(() => {
    if (listing?.id && listing.isPublic && !isAdminPreview) {
      trackView(listing.id);
    }
  }, [listing?.id, listing?.isPublic, isAdminPreview, trackView]);

  // Error or not found state (only show after loading completes)
  if (!isLoading && (error || !listing)) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Listing Not Found</h1>
              <p className="text-muted-foreground font-medium mb-6">This listing may have been removed or is no longer available.</p>
              <Link 
                href="/listings" 
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Listings
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Access control for non-public listings (only check after loading)
  // If isAdminPreview is true, admin already validated server-side
  if (!isLoading && listing && !listing.isPublic && !isAdminPreview) {
    const isOwner = user?.id === listing.userId;

    if (!isOwner) {
      return (
        <div className="min-h-screen bg-background">
          <main className="pt-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Listing Not Available</h1>
                <p className="text-muted-foreground font-medium mb-6">This listing is not currently public.</p>
                <Link 
                  href="/listings" 
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Listings
                </Link>
              </div>
            </div>
          </main>
        </div>
      );
    }
  }

  const carTitle = listing ? `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}` : '';
  const breadcrumbItems = listing ? [
    { label: 'All Cars', type: 'button' as const },
    { label: listing.make, href: `/listings?make=${encodeURIComponent(listing.make)}` },
    { label: listing.model, href: `/listings?make=${encodeURIComponent(listing.make)}&model=${encodeURIComponent(listing.model)}` },
    ...(listing.trim ? [{ label: listing.trim }] : []),
  ] : [];

  // Check if this listing is from a dealer (has partnerId) - only dealer listings can be booked
  const isDealerListing = !!listing?.partnerId;
  
  // Check if current user is staff of the partner that owns this listing
  const isOwnPartnerListing = listing?.partnerId 
    ? (user?.partnerMemberships ?? []).some(m => m.partnerId === listing.partnerId)
    : false;

  // Check if partner is Black tier
  const isBlackTierPartner = sellerData?.type === 'partner' && sellerData.partner?.tier === 'black';

  const handleChatWithSeller = async () => {
    // Check if user is authenticated
    if (!user?.id) {
      // Always use "/" as base URL for auth modals for consistency
      window.location.href = `/?auth=signin&redirect=${encodeURIComponent(`/listings/${listing.id}`)}`;
      return;
    }

    // Don't allow chatting with yourself
    if (user.id === listing.userId) {
      return;
    }
    
    // Don't allow partner staff to chat about their own dealership's listings
    if (isOwnPartnerListing) {
      return;
    }

    setIsStartingChat(true);
    try {
      // For staff listings, message the currently assigned staff member
      // userId is updated when listings are reassigned
      const contactUserId = listing.userId;
      
      const { conversationId } = await createConversation({
        otherUserId: contactUserId,
        listingId: listing.id,
        partnerId: listing.partnerId ?? undefined,
      });

      // Navigate to the messaging page with this conversation
      router.push(`/user-dashboard/messaging?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsStartingChat(false);
    }
  };

  const handleLoginRequired = () => {
    // Always use "/" as base URL for auth modals for consistency
    window.location.href = `/?auth=signin&redirect=${encodeURIComponent(`/listings/${listingId}`)}`;
  };

  const handleBackToAllCars = () => {
    if (typeof window === 'undefined') {
      router.push('/listings');
      return;
    }

    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      const cameFromListings =
        referrer &&
        referrer.origin === window.location.origin &&
        referrer.pathname === '/listings';

      if (cameFromListings && window.history.length > 1) {
        router.back();
        return;
      }
    } catch {
      // Fall through to stored URL / default route.
    }

    const savedListingsUrl = window.sessionStorage.getItem(LAST_PUBLIC_LISTINGS_URL_KEY);
    router.push(savedListingsUrl || '/listings');
  };

  // Get partner address for booking modal
  const partnerAddress = sellerData?.type === 'partner' && sellerData.partner 
    ? sellerData.partner.address 
    : null;

  // Check if we have valid seller data
  const hasSellerData = sellerData 
    ? (sellerData.type === 'partner' ? !!sellerData.partner : !!sellerData.userProfile)
    : false;

  // Extract KYC verified status from seller data
  // Partners are considered verified if partner.isVerified is true
  // Users are verified if userProfile.kycVerified is true
  const sellerKycVerified = sellerData
    ? sellerData.type === 'partner'
      ? sellerData.partner?.isVerified ?? false
      : sellerData.userProfile?.kycVerified ?? false
    : false;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* SEO: Vehicle Schema for Rich Snippets */}
      {listing && listing.isPublic && (
        <JsonLd 
          data={generateVehicleSchema(listing, sellerData ? {
            type: sellerData.type,
            name: sellerData.type === 'partner' 
              ? sellerData.partner?.brandName 
              : `${sellerData.userProfile?.firstName || ''} ${sellerData.userProfile?.lastName || ''}`.trim(),
            verified: sellerData.type === 'partner'
              ? sellerData.partner?.isVerified
              : sellerData.userProfile?.kycVerified,
          } : undefined)}
        />
      )}
      
      <main className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Admin Preview Banner */}
          {isAdminPreview && listing && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-700 dark:text-amber-400">Admin Preview</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400/80 mt-0.5">
                    This listing is <strong>{listing.moderationStatus}</strong> ({listing.lifecycleStatus}).
                    It is not visible to the public.
                  </p>
                </div>
                <Link
                  href="/admin-dashboard/listings"
                  className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap"
                >
                  ← Back to Moderation
                </Link>
              </div>
            </div>
          )}
          
          {/* Breadcrumb */}
          {isLoading ? (
            <div className="flex items-center gap-2 py-4 mb-2 sm:mb-3 h-14 overflow-hidden">
              <Skeleton className="h-4 w-16" />
              <span className="text-muted-foreground/40">/</span>
              <Skeleton className="h-4 w-20" />
              <span className="text-muted-foreground/40">/</span>
              <Skeleton className="h-4 w-24" />
            </div>
          ) : listing ? (
            <nav className="flex items-center py-4 mb-2 sm:mb-3 h-14 overflow-hidden">
              <div className="flex items-center gap-2 text-sm font-bold tracking-tight overflow-x-auto scrollbar-hide whitespace-nowrap min-w-0 max-w-full">
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;

                  return (
                    <div key={`${item.label}-${index}`} className="flex items-center gap-2 shrink-0 min-w-0">
                      {index > 0 && <span className="text-muted-foreground/40">/</span>}
                      {'type' in item ? (
                        <button
                          type="button"
                          onClick={handleBackToAllCars}
                          className={cn(
                            "transition-colors whitespace-nowrap",
                            isLast ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </button>
                      ) : item.href && !isLast ? (
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-foreground whitespace-nowrap max-w-[40vw] sm:max-w-[28vw] truncate">
                          {item.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
          ) : null}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 pb-6 lg:pb-8">
            {/* Main Column - Car Details (60%) */}
            <div className="lg:col-span-3 min-w-0">
              {listing ? (
                <CarCardDetailed listing={listing} kycVerified={sellerKycVerified} />
              ) : (
                <CarCardDetailed.Skeleton />
              )}
            </div>

            {/* Sidebar - Clean stacked cards (40%) */}
            <div className="lg:col-span-2 min-w-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* 1. Seller Profile - show skeleton until seller data loads */}
                {hasSellerData && sellerData ? (
                  <SellerProfileCard sellerData={sellerData} />
                ) : (
                  <SellerProfileCard.Skeleton />
                )}

                {/* 2. Actions Section - Contact + Booking combined */}
                {hasSellerData && sellerData && listing ? (
                  <ContactSection
                    sellerData={sellerData}
                    listingId={listing.id}
                    currentUserId={user?.id}
                    sellerUserId={listing.userId}
                    partnerId={listing.partnerId}
                    isOwnPartnerListing={isOwnPartnerListing}
                    onStartChat={handleChatWithSeller}
                    isStartingChat={isStartingChat}
                    showBooking={isDealerListing}
                    onBookTestDrive={() => setIsBookingModalOpen(true)}
                    partnerName={listing.partnerBrandName || 'Dealer'}
                  />
                ) : (
                  <ContactSection.Skeleton />
                )}

                {/* 3. Listing Timestamp */}
                {listing ? (
                  <ListingTimestamp
                    createdAt={listing.createdAt}
                    updatedAt={listing.updatedAt}
                    publishedAt={listing.publishedAt}
                    originalPublishedAt={listing.originalPublishedAt}
                    lastEditedAt={listing.lastEditedAt}
                  />
                ) : (
                  <ListingTimestamp.Skeleton />
                )}

                {/* 4. EMI Calculator */}
                {listing ? (
                  <EMICalculator
                    price={listing.price}
                    currency={listing.currency}
                  />
                ) : (
                  <EMICalculator.Skeleton />
                )}

                {/* 5. Location - show skeleton until seller data loads */}
                {hasSellerData && sellerData ? (
                  <LocationSection sellerData={sellerData} />
                ) : (
                  <LocationSection.Skeleton />
                )}

                {/* Safety Note */}
                {listing && (
                  <div className="py-4 flex items-start gap-3">
                    {isDealerListing ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {isDealerListing 
                        ? isBlackTierPartner
                          ? <><span className="font-black text-foreground">Elite Partner.</span> Verified, vetted, and held to the highest standards.</>
                          : 'We trust this dealer as a respected partner of Revvup.'
                        : <><span className="font-bold text-foreground">Safety Tip:</span> Meet in public places and verify the vehicle before payment.</>
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Listings - non-blocking, loads after main content */}
          {listing && (
            <SimilarListings 
              listingId={listing.id} 
              enabled={listing.isPublic}
              initialListings={initialSimilarListings}
            />
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {isDealerListing && listing && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          listingId={listing.id}
          listingTitle={carTitle}
          listingThumbnail={listing.thumbnail}
          partnerName={listing.partnerBrandName || 'Dealer'}
          partnerAddress={partnerAddress}
          isAuthenticated={!!user?.id}
          onLoginRequired={handleLoginRequired}
          initialAvailability={initialBookingAvailability ?? null}
        />
      )}
    </div>
  );
}
