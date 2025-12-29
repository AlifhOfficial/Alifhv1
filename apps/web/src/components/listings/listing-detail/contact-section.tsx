/**
 * Contact Section Component
 * 
 * Displays contact options for the listing detail page sidebar.
 * Shows phone number and chat button with appropriate handling for
 * partner listings vs private sellers.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { cn } from '@/utils';
import type { SellerData } from './listing-detail-view';

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
    const userBasic = sellerData.userBasic;
    const showPhone = profile?.privacySettings?.showPhone ?? true;
    
    if (showPhone && profile?.phone) {
      phoneNumber = profile.phone;
      contactName = userBasic?.name ?? 
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
    // Format UAE phone numbers nicely
    if (phone.startsWith('+971')) {
      return phone.replace(/(\+971)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    }
    return phone;
  };

  // Get response time info
  const responseTime = sellerData.type === 'partner' 
    ? sellerData.partnerStats?.responseTime
    : sellerData.userProfile?.avgResponseTime;

  return (
    <div className={cn(
      "p-5 bg-card border border-border/40 rounded-xl space-y-4",
      className
    )}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Contact
      </h4>

      <div className="space-y-3">
        {/* Chat Button */}
        <button
          onClick={handleChatClick}
          disabled={isStartingChat || isOwnListing}
          className={cn(
            "w-full py-3 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2",
            isOwnListing
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          {isStartingChat ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

        {/* Phone Number */}
        {phoneNumber && (
          <div className="space-y-2">
            <button
              onClick={() => setShowPhone(!showPhone)}
              className="w-full py-3 px-4 border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              {showPhone ? 'Hide Number' : 'Show Phone Number'}
              {showPhone ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showPhone && (
              <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                {contactName && (
                  <p className="text-xs text-muted-foreground">{contactName}</p>
                )}
                <div className="flex items-center justify-between">
                  <a
                    href={`tel:${phoneNumber}`}
                    className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {formatPhoneForDisplay(phoneNumber)}
                  </a>
                  <button
                    onClick={handleCopyPhone}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Copy phone number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No phone available message for private sellers with hidden phone */}
        {sellerData.type === 'user' && !phoneNumber && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Seller prefers to be contacted via chat
          </p>
        )}
      </div>

      {/* Response time hint */}
      <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/40">
        {responseTime
          ? `Typically responds within ${formatResponseTime(responseTime)}`
          : 'Typically responds within 24 hours'
        }
      </p>
    </div>
  );
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
}
