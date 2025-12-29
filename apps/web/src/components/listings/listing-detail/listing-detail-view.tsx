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

import { Navbar } from '@/components/shared/navbar';
import { CarCardDetailed } from '@/components/inventory';
import { BookingModal } from '@/components/features/bookings/shared';
import { SellerProfileCard } from './seller-profile-card';
import { ContactSection } from './contact-section';
import { BookingSection } from './booking-section';
import { EMICalculator } from './emi-calculator';
import { LocationSection } from './location-section';
import { ListingTimestamp } from './listing-timestamp';
import { ChevronLeft, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateConversation } from '@/hooks/messaging';
import { useListingDetail, type SellerData } from '@/hooks/listings';

// Re-export types for backwards compatibility
export type { PartnerSellerData, UserSellerData, SellerData } from '@/hooks/listings';

interface ListingDetailViewProps {
  listingId: string;
  currentUserId?: string;
  currentUserRole?: string;
}

export function ListingDetailView({ listingId, currentUserId, currentUserRole }: ListingDetailViewProps) {
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { createConversation } = useCreateConversation();
  
  // Fetch listing data via hook
  const { listing, sellerData, isLoading, error } = useListingDetail(listingId);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error or not found state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Listing Not Found</h1>
              <p className="text-muted-foreground mb-6">This listing may have been removed or is no longer available.</p>
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

  // Access control for non-public listings
  if (!listing.isPublic) {
    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin';
    const isOwner = currentUserId === listing.userId;

    if (!isAdmin && !isOwner) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h1 className="text-2xl font-semibold text-foreground mb-2">Listing Not Available</h1>
                <p className="text-muted-foreground mb-6">This listing is not currently public.</p>
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

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;

  // Check if this listing is from a dealer (has partnerId) - only dealer listings can be booked
  const isDealerListing = !!listing.partnerId;

  const handleChatWithSeller = async () => {
    // Check if user is authenticated
    if (!currentUserId) {
      router.push('/sign-in?redirectTo=' + encodeURIComponent(`/listings/${listing.id}`));
      return;
    }

    // Don't allow chatting with yourself
    if (currentUserId === listing.userId) {
      return;
    }

    setIsStartingChat(true);
    try {
      const { conversationId } = await createConversation({
        otherUserId: listing.userId,
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
    router.push('/sign-in?redirectTo=' + encodeURIComponent(`/listings/${listing.id}`));
  };

  // Get partner address for booking modal
  const partnerAddress = sellerData?.type === 'partner' && sellerData.partner 
    ? sellerData.partner.address 
    : null;

  // Check if we have valid seller data
  const hasSellerData = sellerData 
    ? (sellerData.type === 'partner' ? !!sellerData.partner : !!sellerData.userProfile)
    : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Breadcrumb - Clean, minimal */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link 
              href="/listings" 
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-tight"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Listings</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Column - Car Details */}
            <div className="lg:col-span-2">
              <CarCardDetailed listing={listing} />
            </div>

            {/* Sidebar - Clean stacked cards */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* 1. Seller Profile */}
                {hasSellerData && sellerData && (
                  <SellerProfileCard sellerData={sellerData} />
                )}

                {/* 2. Contact Section - Primary action */}
                {hasSellerData && sellerData && (
                  <ContactSection
                    sellerData={sellerData}
                    listingId={listing.id}
                    currentUserId={currentUserId}
                    sellerUserId={listing.userId}
                    partnerId={listing.partnerId}
                    onStartChat={handleChatWithSeller}
                    isStartingChat={isStartingChat}
                  />
                )}

                {/* 3. Booking Section (Partner listings only) */}
                {isDealerListing && (
                  <BookingSection
                    onBookTestDrive={() => setIsBookingModalOpen(true)}
                    partnerName={listing.partnerBrandName || 'Dealer'}
                  />
                )}

                {/* 4. Listing Timestamp */}
                <ListingTimestamp
                  createdAt={listing.createdAt}
                  updatedAt={listing.updatedAt}
                  publishedAt={listing.publishedAt}
                />

                {/* 5. EMI Calculator */}
                <EMICalculator
                  price={listing.price}
                  currency={listing.currency}
                />

                {/* 6. Location */}
                {hasSellerData && sellerData && (
                  <LocationSection sellerData={sellerData} />
                )}

                {/* Safety Note - Minimal, muted design following design system */}
                <div className="p-4 bg-muted/30 border border-border/40 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Safety Tip:</span> Meet in public places and verify the vehicle before payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {isDealerListing && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          listingId={listing.id}
          listingTitle={carTitle}
          listingThumbnail={listing.thumbnail}
          partnerName={listing.partnerBrandName || 'Dealer'}
          partnerAddress={partnerAddress}
          isAuthenticated={!!currentUserId}
          onLoginRequired={handleLoginRequired}
        />
      )}
    </div>
  );
}
