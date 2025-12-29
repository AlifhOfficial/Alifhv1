/**
 * Listing Detail View Component - Redesigned
 * 
 * Main view for the public listing detail page.
 * Left side: Car details (images, specs, features)
 * Right side: Seller profile, booking, contact, timestamp, EMI calculator, location
 */

'use client';

import { Navbar } from '@/components/navbar';
import { CarCardDetailed } from '@/components/inventory';
import { BookingModal } from '@/components/booking';
import { SellerProfileCard } from './seller-profile-card';
import { ContactSection } from './contact-section';
import { BookingSection } from './booking-section';
import { EMICalculator } from './emi-calculator';
import { LocationSection } from './location-section';
import { ListingTimestamp } from './listing-timestamp';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateConversation } from '@/hooks/messaging';
import type { CarDetailedData } from '@alifh/database';

// Types for seller data from existing queries
export interface PartnerSellerData {
  type: 'partner';
  partner: {
    id: string;
    companyNameLegal: string;
    brandName: string;
    tradeLicense: string;
    status: string;
    tier: string;
    email: string;
    phone: string;
    website: string | null;
    address: string | null;
    emirate: string | null;
    city: string | null;
    locationLat: number | null;
    locationLng: number | null;
    showroomCount: number;
    logo: string | null;
    heroImage: string | null;
    description: string | null;
    specialties: string[] | null;
    experienceYears: number | null;
    foundedYear: number | null;
    googleReviewUrl: string | null;
    googleRating: number | null;
    googleReviewCount: number | null;
    platformRating: number | null;
    platformReviewCount: number | null;
    isVerified: boolean;
    badges: string[] | null;
    tags: string[] | null;
  } | null;
  partnerStats?: {
    inventoryCount: number;
    totalSales: number;
    responseTime: number | null;
    responseRate: number | null;
  };
}

export interface UserSellerData {
  type: 'user';
  userProfile: {
    id: string;
    userId: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    description: string | null;
    kycVerified: boolean;
    badges: string[] | null;
    tags: string[] | null;
    locationLat: number | null;
    locationLng: number | null;
    locationCity: string | null;
    locationEmirate: string | null;
    inventoryCount: number;
    rating: number | null;
    platformRating: number | null;
    platformReviewCount: number;
    avgResponseTime: number | null;
    privacySettings: { showPhone?: boolean; showEmail?: boolean };
    memberSince: Date;
    emailVerified: boolean;
    phoneVerified: boolean;
  } | null;
  userBasic: {
    id: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: Date;
  } | null;
}

export type SellerData = PartnerSellerData | UserSellerData;

interface ListingDetailViewProps {
  listing: CarDetailedData;
  sellerData: SellerData;
  currentUserId?: string;
}

export function ListingDetailView({ listing, sellerData, currentUserId }: ListingDetailViewProps) {
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { createConversation } = useCreateConversation();
  
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
  const partnerAddress = sellerData.type === 'partner' && sellerData.partner 
    ? sellerData.partner.address 
    : null;

  // Check if we have valid seller data
  const hasSellerData = sellerData.type === 'partner' 
    ? !!sellerData.partner 
    : !!(sellerData.userProfile || sellerData.userBasic);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/listings" 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Listings
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column - Car Details */}
            <div className="lg:col-span-2">
              <CarCardDetailed listing={listing} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* 1. Seller Profile */}
                {hasSellerData && (
                  <SellerProfileCard sellerData={sellerData} />
                )}

                {/* 2. Booking Section (Partner listings only) */}
                {isDealerListing && (
                  <BookingSection
                    onBookTestDrive={() => setIsBookingModalOpen(true)}
                    partnerName={listing.partnerBrandName || 'Dealer'}
                  />
                )}

                {/* 3. Contact Section */}
                {hasSellerData && (
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
                {hasSellerData && (
                  <LocationSection sellerData={sellerData} />
                )}

                {/* Safety Note */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    <strong>Safety Tip:</strong> Always meet in a public place and verify the vehicle before making any payment.
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
