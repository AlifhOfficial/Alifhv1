/**
 * Contact Section Component - Alifh Design System
 * 
 * Unified action section combining contact and booking options.
 * Clean, minimal design following "Less is More" principle.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, Copy, Check, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/utils';
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
  partnerId,
  isOwnPartnerListing = false,
  onStartChat,
  isStartingChat,
  showBooking = false,
  onBookTestDrive,
  partnerName,
  className,
}: ContactSectionProps) {
  const router = useRouter();
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine the phone number to display
  let phoneNumber: string | null = null;
  let contactName: string | null = null;

  if (sellerData.type === 'partner' && sellerData.partner) {
    phoneNumber = sellerData.partner.phone;
    contactName = sellerData.partner.brandName;
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
    if (!currentUserId) {
      router.push('/sign-in?redirectTo=' + encodeURIComponent(`/listings/${listingId}`));
      return;
    }
    onStartChat?.();
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
            "flex-1 min-w-[100px] py-3 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap",
            isBlocked
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isStartingChat ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              {isBlocked ? blockedMessage : 'Chat'}
            </>
          )}
        </button>

        {/* Call Button - If phone available */}
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="flex-1 min-w-[100px] py-3 px-4 border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        )}

        {/* Book Test Drive - If dealer listing */}
        {showBooking && onBookTestDrive && (
          <button
            onClick={onBookTestDrive}
            className="flex-1 min-w-[100px] py-3 px-4 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            Book
          </button>
        )}
      </div>

      {/* Phone number display when revealed */}
      {phoneNumber && showPhone && (
        <div className="py-3 border-y border-border">
          {contactName && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {contactName}
            </p>
          )}
          <div className="flex items-center justify-between">
            <a
              href={`tel:${phoneNumber}`}
              className="text-base font-semibold text-foreground hover:text-primary transition-colors"
            >
              {formatPhoneForDisplay(phoneNumber)}
            </a>
            <button
              onClick={handleCopyPhone}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Copy phone number"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Show/Hide phone toggle */}
      {phoneNumber && (
        <button
          onClick={() => setShowPhone(!showPhone)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPhone ? 'Hide phone number' : 'Show phone number'}
        </button>
      )}

      {/* No phone available message */}
      {sellerData.type === 'user' && !phoneNumber && !showBooking && (
        <p className="text-sm text-muted-foreground">
          Seller prefers chat
        </p>
      )}
    </div>
  );
}
