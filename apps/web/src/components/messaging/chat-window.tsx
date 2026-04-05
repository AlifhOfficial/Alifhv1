/**
 * Chat Window - Revvup Design System
 * Clean, lean chat interface
 */

'use client';

import { ArrowLeft, X } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import type { InitialMessagesData } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { ChatThread, useChatThreadController } from './chat-thread';

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  inbox?: 'personal' | 'staff';
  conversationType?: string;
  otherParticipant?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    lastReadAt?: Date | string | null;
    lastSeenAt?: Date | string | null;
  };
  partner?: { id: string; name: string; logo: string | null };
  listing?: { id: string; title: string; thumbnail: string | null };
  unreadCount?: number;
  myLastReadAt?: Date | string | null;
  onBack?: () => void;
  className?: string;
  initialMessages?: InitialMessagesData;
}

export function ChatWindow({
  conversationId,
  userId,
  inbox = 'personal',
  otherParticipant,
  partner,
  listing,
  myLastReadAt,
  onBack,
  className,
  initialMessages,
}: ChatWindowProps) {
  const controller = useChatThreadController({
    conversationId,
    userId,
    otherParticipant,
    listing,
    myLastReadAt,
    initialMessages,
  });

  // Display
  const displayName = inbox === 'personal' && partner ? partner.name : otherParticipant?.name || 'User';
  const isPartnerBrand = inbox === 'personal' && partner;
  const lastActiveAt =
    controller.otherLastSeenAt ??
    controller.otherLastReadAt ??
    (otherParticipant?.lastSeenAt ? new Date(otherParticipant.lastSeenAt) : null) ??
    (otherParticipant?.lastReadAt ? new Date(otherParticipant.lastReadAt) : null);

  // Format last seen with relative time
  const getLastSeenText = (date: Date) => {
    // Using formatDistanceToNow which handles the time calculation internally
    return formatDistanceToNow(date, { addSuffix: false });
  };

  const defaultText = inbox === 'personal' && listing
    ? `Hi ${displayName}, is the ${listing.title} still available?`
    : undefined;

  return (
    <div className={cn('flex flex-col h-full w-full min-h-0 bg-background overflow-hidden overscroll-contain', className)}>
      {/* Header - fixed at top, never scrolls */}
      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/40 z-10">
        {onBack && (
          <button onClick={onBack} className="p-1.5 sm:p-2 hover:bg-sidebar rounded-lg transition-colors lg:hidden" aria-label="Back">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        )}

        <div className="relative flex-shrink-0">
          {isPartnerBrand ? (
            <BrandAvatar logoUrl={partner?.logo} brandName={partner?.name || 'Partner'} size="sm" className="w-8 h-8 sm:w-10 sm:h-10" />
          ) : (
            <UserAvatar src={otherParticipant?.avatarUrl} name={displayName} size="md" className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          {partner ? (
            <Link
              href={`/listings?partnerId=${partner.id}&partnerName=${encodeURIComponent(partner.name)}&sort=relevance`}
              className="text-subhead sm:text-subhead font-bold tracking-tight truncate text-foreground hover:text-primary hover:underline transition-colors block leading-snug"
            >
              {displayName}
            </Link>
          ) : (
            <h3 className="text-subhead sm:text-subhead font-bold tracking-tight truncate text-foreground leading-snug">{displayName}</h3>
          )}
          {listing && (
            <Link
              href={`/listings/${listing.id}`}
              className="text-caption1 text-muted-foreground/70 truncate hover:text-primary hover:underline transition-colors block leading-snug"
            >
              {listing.title}
            </Link>
          )}
          <div className="flex items-center gap-1.5">
            {controller.isOtherOnline && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[10px] sm:text-caption1 font-semibold text-success">Active</span>
              </div>
            )}
            {!controller.isOtherOnline && lastActiveAt && (
              <span className="text-[10px] sm:text-caption1 text-muted-foreground/70">Last seen {getLastSeenText(lastActiveAt)}</span>
            )}
            {!controller.isOtherOnline && !lastActiveAt && (
              <span className="text-[10px] sm:text-caption1 text-muted-foreground/50">Away</span>
            )}
          </div>
        </div>

        {onBack && (
          <button 
            onClick={onBack} 
            className="p-1.5 sm:p-2 hover:bg-sidebar rounded-lg transition-colors hidden lg:flex" 
            aria-label="Close"
            title="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <ChatThread
        controller={controller}
        defaultText={defaultText}
      />
    </div>
  );
}
