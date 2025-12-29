/**
 * Contact Section Component - Alifh Design System
 * 
 * Clean, minimal contact options following "Less is More" principle.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import type { SellerData } from '@/hooks/listings';

interface ContactSectionProps {
  sellerData: SellerData;
  listingId: string;
  currentUserId?: string;
  sellerUserId: string;
  partnerId?: string | null;
  onStartChat?: () => void;
  isStartingChat?: boolean;
  className?: string;
}

export function ContactSection({
  sellerData,
  listingId,
  currentUserId,
  sellerUserId,
  partnerId,
  onStartChat,
  isStartingChat,
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
    <div className={cn(
      "p-4 bg-card border border-border/40 rounded-2xl space-y-3",
      className
    )}>
      <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
        Contact
      </p>

      {/* Primary Action - Chat Button */}
      <button
        onClick={handleChatClick}
        disabled={isStartingChat || isOwnListing}
        className={cn(
          "w-full py-3 px-4 rounded-full text-sm font-medium tracking-tight transition-colors flex items-center justify-center gap-2",
          isOwnListing
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isStartingChat ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Starting Chat...
          </>
        ) : isOwnListing ? (
          'Your Listing'
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            Chat with {sellerData.type === 'partner' ? 'Showroom' : 'Seller'}
          </>
        )}
      </button>

      {/* Phone Number - Secondary Action */}
      {phoneNumber && (
        <div className="space-y-2">
          <button
            onClick={() => setShowPhone(!showPhone)}
            className="w-full py-3 px-4 border border-border/40 rounded-full text-sm font-medium tracking-tight text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {showPhone ? 'Hide Number' : 'Show Phone'}
          </button>

          {showPhone && (
            <div className="p-3 bg-muted/30 rounded-xl border border-border/40">
              {contactName && (
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">
                  {contactName}
                </p>
              )}
              <div className="flex items-center justify-between">
                <a
                  href={`tel:${phoneNumber}`}
                  className="text-base font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
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
        </div>
      )}

      {/* No phone available message */}
      {sellerData.type === 'user' && !phoneNumber && (
        <p className="text-xs text-muted-foreground/70 text-center">
          Seller prefers chat
        </p>
      )}
    </div>
  );
}
