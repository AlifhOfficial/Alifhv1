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
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCreateConversation } from '@/hooks/messaging';
import { useListingDetail, useTrackView, type SellerData } from '@/hooks/listings';
import { useFavoritesStatus } from '@/hooks/engagement';
import { useAuth } from '@/providers/auth-provider';

// Re-export types for backwards compatibility
export type { PartnerSellerData, UserSellerData, SellerData } from '@/hooks/listings';

interface ListingDetailViewProps {
  listingId: string;
}

export function ListingDetailView({ listingId }: ListingDetailViewProps) {
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { createConversation } = useCreateConversation();
  const { session: user, isAuthenticated } = useAuth();
  const { trackView } = useTrackView();
  
  // Fetch favorites status once (only if signed in) - CarCardDetailed subscribes to this data
  useFavoritesStatus({ enabled: isAuthenticated });
  
  // Fetch listing data via hook
  const { listing, sellerData, isLoading, error } = useListingDetail(listingId);
  
  // Track view when listing loads successfully (fire-and-forget)
  useEffect(() => {
    if (listing?.id && listing.isPublic) {
      trackView(listing.id);
    }
  }, [listing?.id, listing?.isPublic, trackView]);

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
  if (!isLoading && listing && !listing.isPublic) {
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const isOwner = user?.id === listing.userId;

    if (!isAdmin && !isOwner) {
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
      <main className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Breadcrumb */}
          {isLoading ? (
            <div className="flex items-center gap-2 py-4 mb-4 sm:mb-6">
              <Skeleton className="h-4 w-16" />
              <span className="text-muted-foreground/40">/</span>
              <Skeleton className="h-4 w-20" />
              <span className="text-muted-foreground/40">/</span>
              <Skeleton className="h-4 w-24" />
            </div>
          ) : listing ? (
            <nav className="flex items-center gap-2 text-sm font-bold tracking-tight py-4 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
              <Link 
                href="/listings" 
                className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                All Cars
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <Link 
                href={`/listings?make=${encodeURIComponent(listing.make)}`}
                className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {listing.make}
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <Link 
                href={`/listings?make=${encodeURIComponent(listing.make)}&model=${encodeURIComponent(listing.model)}`}
                className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {listing.model}
              </Link>
              {listing.trim && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="text-foreground font-bold whitespace-nowrap">
                    {listing.trim}
                  </span>
                </>
              )}
            </nav>
          ) : null}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 pb-6 lg:pb-8">
            {/* Main Column - Car Details (60%) */}
            <div className="lg:col-span-3 min-w-0">
              {isLoading ? (
                <CarCardDetailed.Skeleton />
              ) : listing ? (
                <CarCardDetailed listing={listing} kycVerified={sellerKycVerified} />
              ) : null}
            </div>

            {/* Sidebar - Clean stacked cards (40%) */}
            <div className="lg:col-span-2 min-w-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* 1. Seller Profile */}
                {isLoading ? (
                  <SellerProfileCard.Skeleton />
                ) : hasSellerData && sellerData ? (
                  <SellerProfileCard sellerData={sellerData} />
                ) : null}

                {/* 2. Actions Section - Contact + Booking combined */}
                {isLoading ? (
                  <ContactSection.Skeleton />
                ) : hasSellerData && sellerData && listing ? (
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
                ) : null}

                {/* 3. Listing Timestamp */}
                {isLoading ? (
                  <ListingTimestamp.Skeleton />
                ) : listing ? (
                  <ListingTimestamp
                    createdAt={listing.createdAt}
                    updatedAt={listing.updatedAt}
                    publishedAt={listing.publishedAt}
                    originalPublishedAt={listing.originalPublishedAt}
                    lastEditedAt={listing.lastEditedAt}
                  />
                ) : null}

                {/* 4. EMI Calculator */}
                {isLoading ? (
                  <EMICalculator.Skeleton />
                ) : listing ? (
                  <EMICalculator
                    price={listing.price}
                    currency={listing.currency}
                  />
                ) : null}

                {/* 5. Location */}
                {isLoading ? (
                  <LocationSection.Skeleton />
                ) : hasSellerData && sellerData ? (
                  <LocationSection sellerData={sellerData} />
                ) : null}

                {/* Safety Note */}
                {!isLoading && listing && (
                  <div className="py-4 border-t border-border flex items-start gap-3">
                    {isDealerListing ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {isDealerListing 
                        ? isBlackTierPartner
                          ? <><span className="font-black text-foreground">Elite Partner.</span> Verified, vetted, and held to the highest standards.</>
                          : 'We trust this dealer as a respected partner of Alifh.'
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
        />
      )}
    </div>
  );
}
