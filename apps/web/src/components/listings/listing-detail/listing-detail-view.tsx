/**
 * Listing Detail View Component
 * Main view for the public listing detail page
 */

'use client';

import { Navbar } from '@/components/navbar';
import { CarCardDetailed } from '@/components/inventory';
import { BookingModal } from '@/components/booking';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateConversation } from '@/hooks/messaging';
import type { CarDetailedData } from '@alifh/database';

interface ListingDetailViewProps {
  listing: CarDetailedData;
  currentUserId?: string;
}

export function ListingDetailView({ listing, currentUserId }: ListingDetailViewProps) {
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { createConversation, isCreating } = useCreateConversation();
  
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

            {/* Sidebar - Contact & Actions */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Contact Card */}
                <div className="p-6 bg-card border border-border/40 rounded-xl space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Interested in this {listing.make}?</h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleChatWithSeller}
                      disabled={isStartingChat || currentUserId === listing.userId}
                      className="w-full py-3 px-4 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isStartingChat ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Starting Chat...
                        </>
                      ) : currentUserId === listing.userId ? (
                        'Your Listing'
                      ) : (
                        'Chat with Seller'
                      )}
                    </button>
                    
                    {/* Only show booking button for dealer listings */}
                    {isDealerListing && (
                      <button 
                        onClick={() => setIsBookingModalOpen(true)}
                        className="w-full py-3 px-4 bg-green-500 text-white text-sm font-medium rounded-full hover:bg-green-600 transition-colors"
                      >
                        Book Test Drive
                      </button>
                    )}
                    
                    <button className="w-full py-3 px-4 text-foreground text-sm font-medium rounded-full hover:bg-secondary/10 transition-colors border border-border">
                      Request Price Quote
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Typically responds within 24 hours
                  </p>
                </div>

                {/* Price Summary */}
                <div className="p-6 bg-muted/20 border border-border/40 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Listed Price</span>
                    <span className="text-lg font-bold text-blue-500">
                      {new Intl.NumberFormat('en-AE', {
                        style: 'currency',
                        currency: listing.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(listing.price)}
                    </span>
                  </div>
                  
                  {listing.isNegotiable && (
                    <p className="text-xs text-muted-foreground">
                      Price is negotiable. Make an offer!
                    </p>
                  )}

                  {listing.fairValue && (
                    <div className="pt-3 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Fair Market Value</span>
                        <span className="text-sm font-medium text-foreground">
                          {new Intl.NumberFormat('en-AE', {
                            style: 'currency',
                            currency: listing.currency,
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(listing.fairValue / 100)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Facts */}
                <div className="p-6 bg-card border border-border/40 rounded-xl space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Quick Facts</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Mileage</p>
                      <p className="font-medium text-foreground">{listing.mileage.toLocaleString()} km</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Year</p>
                      <p className="font-medium text-foreground">{listing.year}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Transmission</p>
                      <p className="font-medium text-foreground capitalize">{listing.transmission?.replace(/_/g, ' ') || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Fuel Type</p>
                      <p className="font-medium text-foreground capitalize">{listing.fuelType?.replace(/_/g, ' ') || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Body Type</p>
                      <p className="font-medium text-foreground capitalize">{listing.bodyType?.replace(/_/g, ' ') || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Specs</p>
                      <p className="font-medium text-foreground uppercase">{listing.specs}</p>
                    </div>
                  </div>
                </div>

                {/* Safety Note */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
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
          partnerAddress={null}
          isAuthenticated={!!currentUserId}
          onLoginRequired={handleLoginRequired}
        />
      )}
    </div>
  );
}
