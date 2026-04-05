/**
 * Contact Section Component - Revvup Design System
 * 
 * Unified action section combining contact and booking options.
 * Clean, minimal design following "Less is More" principle.
 */

'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Copy, Check, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import type { SellerData } from '@/hooks/listings';

interface ContactSectionProps {
  sellerData: SellerData;
  listingId: string;
  currentUserId?: string;
  sellerUserId: string;
  partnerId?: string | null;
  /** True if current user is staff of the partner that owns this listing */
  isOwnPartnerListing?: boolean;
  onStartChat?: () => void;
  isStartingChat?: boolean;
  // Booking props (optional - for dealer listings)
  showBooking?: boolean;
  onBookTestDrive?: () => void;
  partnerName?: string;
  className?: string;
}

export function ContactSection({
  sellerData,
  listingId,
  currentUserId,
  sellerUserId,
  partnerId: _partnerId,
  isOwnPartnerListing = false,
  onStartChat,
  isStartingChat,
  showBooking = false,
  onBookTestDrive,
  partnerName: _partnerName,
  className,
}: ContactSectionProps) {
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auth required modal for chat and booking
  const { isAuthenticated, showModal: showAuthModal, openModal: openAuthModal, closeModal: closeAuthModal } = useAuthRequired({
    feature: "contact the seller",
    redirectTo: `/listings/${listingId}`,
  });

  // Determine the phone number to display
  // Partner listings: staff phone → company phone → staff personal phone
  // User listings: user's phone (if privacy allows)
  let phoneNumber: string | null = null;
  let contactName: string | null = null;

  if (sellerData.type === 'partner' && sellerData.partner) {
    // Priority: staff phone → company phone
    // Staff phone already includes fallback to personal phone via getStaffEffectivePhone
    phoneNumber = sellerData.staffContact?.phone ?? sellerData.partner.phone;
    contactName = sellerData.staffContact?.displayName ?? sellerData.partner.brandName;
  } else if (sellerData.type === 'user') {
    const profile = sellerData.userProfile;
    const showPhoneSetting = profile?.privacySettings?.showPhone ?? true;
    
    if (showPhoneSetting && profile?.phone) {
      phoneNumber = profile.phone;
      contactName = profile.userName ?? 
        [profile.firstName, profile.lastName].filter(Boolean).join(' ') ?? 
        'Seller';
    }
  }

  const isOwnListing = currentUserId === sellerUserId;
  const isBlocked = isOwnListing || isOwnPartnerListing;
  const blockedMessage = isOwnPartnerListing ? 'Your Dealership' : 'Your Listing';

  const handleChatClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    onStartChat?.();
  };

  const handleBookClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    onBookTestDrive?.();
  };

  const handleCopyPhone = async () => {
    if (!phoneNumber) return;
    await navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPhoneForDisplay = (phone: string) => {
    if (phone.startsWith('+971')) {
      return phone.replace(/(\+971)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    }
    return phone;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Primary Actions - Row of buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Chat Button - Primary */}
        <button
          onClick={handleChatClick}
          disabled={isStartingChat || isBlocked}
          className={cn(
            "flex-1 min-w-[100px] py-3 px-4 rounded-full text-subhead font-bold transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap",
            isBlocked
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isStartingChat ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              {isBlocked ? blockedMessage : 'Chat'}
            </>
          )}
        </button>

        {/* Call Button - If phone available and not own listing */}
        {phoneNumber && !isBlocked && (
          <a
            href={`tel:${phoneNumber}`}
            className="flex-1 min-w-[100px] py-3 px-4 bg-muted rounded-full text-subhead font-bold text-foreground hover:bg-muted/80 transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap"
          >
            <Phone className="w-5 h-5" />
            Call
          </a>
        )}

        {/* Book Test Drive - If dealer listing and not own listing */}
        {showBooking && onBookTestDrive && !isBlocked && (
          <button
            onClick={handleBookClick}
            className="flex-1 min-w-[100px] py-3 px-4 bg-success text-white rounded-full text-subhead font-bold hover:bg-success/90 transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap"
          >
            <Calendar className="w-5 h-5" />
            Book
          </button>
        )}
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onClose={closeAuthModal}
        feature="contact the seller"
        redirectTo={`/listings/${listingId}`}
      />

      {/* Phone number display when revealed */}
      {phoneNumber && showPhone && (
        <div className="py-3">
          {contactName && (
            <p className="text-footnote text-muted-foreground/70 uppercase tracking-wider font-bold mb-1">
              {contactName}
            </p>
          )}
          <div className="flex items-center justify-between">
            <a
              href={`tel:${phoneNumber}`}
              className="text-headline font-bold text-foreground hover:text-primary transition-colors"
            >
              {formatPhoneForDisplay(phoneNumber)}
            </a>
            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 hover:bg-success-muted rounded-lg transition-colors"
                title="Chat on WhatsApp"
              >
                <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <button
                onClick={handleCopyPhone}
                className="p-2.5 hover:bg-muted rounded-lg transition-colors"
                title="Copy phone number"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show/Hide phone toggle */}
      {phoneNumber && !isBlocked && (
        <button
          onClick={() => setShowPhone(!showPhone)}
          className="text-subhead font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPhone ? 'Hide phone number' : 'Show phone number'}
        </button>
      )}

      {/* No phone available message */}
      {sellerData.type === 'user' && !phoneNumber && !showBooking && (
        <p className="text-subhead font-semibold text-muted-foreground">
          Seller prefers chat
        </p>
      )}
    </div>
  );
}

function ContactSectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Primary Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-12 flex-1 min-w-[100px] rounded-full" />
        <Skeleton className="h-12 flex-1 min-w-[100px] rounded-full" />
      </div>
    </div>
  );
}

ContactSection.Skeleton = ContactSectionSkeleton;
