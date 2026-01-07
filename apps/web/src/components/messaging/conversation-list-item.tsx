/**
 * Conversation List Item - Alifh Design System
 * Single conversation in the sidebar
 */

'use client';

import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/hooks/messaging';
import { Pin } from 'lucide-react';

interface ConversationListItemProps {
  conversation: Conversation;
  inbox?: 'personal' | 'staff';
  isActive?: boolean;
  isNested?: boolean; // When nested under a partner group
  onClick: () => void;
}

function safeDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ConversationListItem({
  conversation,
  inbox = 'personal',
  isActive = false,
  isNested = false,
  onClick,
}: ConversationListItemProps) {
  const {
    otherParticipant,
    lastMessagePreview,
    lastMessageAt,
    unreadCount,
    isPinned,
    isMuted,
    listing,
    partner,
  } = conversation;

  // For nested items (under partner group), show listing title as primary
  // For flat items, show partner name or user name as primary
  const displayName = isNested
    ? listing?.title || 'General Inquiry'
    : inbox === 'personal' && partner
      ? partner.name
      : otherParticipant?.name || 'User';
  
  // Secondary info for nested - don't show redundant "Re: title" when title is already the display name
  const showListingContext = listing && !isNested;
  
  // For personal inbox with partner (non-nested), show brand logo; otherwise show user avatar
  // For nested items, we skip the avatar entirely or show a smaller listing indicator
  const isPartnerBrand = !isNested && (inbox === 'personal' && partner);
  const lastMessageDate = safeDate(lastMessageAt);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left transition-colors duration-150',
        isNested 
          ? 'py-2.5 px-3 hover:bg-muted/20 rounded-xl' 
          : 'py-3.5 px-4 hover:bg-muted/20 rounded-xl',
        isActive && 'bg-muted/40'
      )}
    >
      <div className="flex items-start overflow-hidden gap-3">
        {/* Avatar - hide for nested items, they have curved line */}
        {isNested ? null : isPartnerBrand ? (
          <BrandAvatar
            logoUrl={partner?.logo}
            brandName={partner?.name || 'Partner'}
            size="sm"
            className="w-11 h-11 flex-shrink-0"
          />
        ) : (
          <UserAvatar
            src={otherParticipant?.avatarUrl}
            name={displayName}
            size="lg"
            className="w-11 h-11 flex-shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-1 overflow-hidden">
            <h3
              className={cn(
                'text-[15px] font-semibold tracking-tight truncate',
                unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
              )}
            >
              {displayName}
            </h3>
            <small className="text-xs text-muted-foreground/60 ml-2 flex-shrink-0 font-medium">
              {lastMessageDate ? formatDistanceToNow(lastMessageDate, { addSuffix: true }) : ''}
            </small>
          </div>

          {/* Listing Context (only for non-nested items) */}
          {showListingContext && (
            <small className="text-xs text-muted-foreground/60 mb-0.5 truncate block">
              Re: {listing.title}
            </small>
          )}

          <div className="flex items-center justify-between overflow-hidden gap-2">
            <p
              className={cn(
                'text-[15px] truncate min-w-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis',
                unreadCount > 0
                  ? 'text-foreground/70 font-semibold'
                  : 'text-muted-foreground/70'
              )}
            >
              {lastMessagePreview || 'No messages yet'}
            </p>
            {unreadCount > 0 && (
              <small className="text-xs flex-shrink-0 px-2 py-0.5 font-semibold bg-red-500/90 text-white rounded-full min-w-[18px] text-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </small>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
