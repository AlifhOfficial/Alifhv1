/**
 * Conversation List Item - Revvup Design System
 * Single conversation in the sidebar
 */

'use client';

import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/hooks/messaging';
import Link from 'next/link';

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
    isPinned: _isPinned,
    isMuted: _isMuted,
    listing,
    partner,
  } = conversation;

  const isOnline = otherParticipant?.isOnline ?? false;
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
          ? 'py-2.5 px-3 hover:bg-sidebar rounded-lg' 
          : 'py-3 px-3 hover:bg-sidebar rounded-xl',
        isActive && 'bg-sidebar'
      )}
    >
      <div className="flex items-start overflow-hidden gap-3">
        {/* Avatar - hide for nested items, they have curved line */}
        {isNested ? null : isPartnerBrand ? (
          <div className="relative flex-shrink-0">
            <BrandAvatar
              logoUrl={partner?.logo}
              brandName={partner?.name || 'Partner'}
              size="sm"
              className="w-11 h-11"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-favorite text-primary-foreground border-2 border-background inline-flex items-center justify-center text-caption2 font-semibold leading-none tabular-nums">
                {unreadCount > 99 ? '99' : unreadCount}
              </span>
            )}
            {isOnline && (
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-background bg-success" />
            )}
          </div>
        ) : (
          <div className="relative flex-shrink-0">
            <UserAvatar
              src={otherParticipant?.avatarUrl}
              name={displayName}
              size="lg"
              className="w-11 h-11"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-favorite text-primary-foreground border-2 border-background inline-flex items-center justify-center text-caption2 font-semibold leading-none tabular-nums">
                {unreadCount > 99 ? '99' : unreadCount}
              </span>
            )}
            {isOnline && (
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-background bg-success" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-0.5 overflow-hidden">
            <h3
              className={cn(
                'text-subhead font-bold truncate flex-1',
                unreadCount > 0 ? 'text-foreground' : 'text-foreground/90'
              )}
            >
              {displayName}
            </h3>
            <span className="text-caption1 font-medium text-muted-foreground/50 ml-2 flex-shrink-0">
              {lastMessageDate ? formatDistanceToNow(lastMessageDate, { addSuffix: false }) : ''}
            </span>
          </div>

          {/* Listing Context (only for non-nested items) */}
          {showListingContext && (
            <Link
              href={`/listings/${listing.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-caption1 font-medium text-muted-foreground/50 mb-0.5 truncate block hover:text-primary hover:underline transition-colors"
            >
              Re: {listing.title}
            </Link>
          )}

          <div className="flex items-center justify-between overflow-hidden gap-2">
            <p
              className={cn(
                'text-subhead truncate min-w-0 flex-1',
                unreadCount > 0
                  ? 'text-foreground/80 font-semibold'
                  : 'text-muted-foreground/70 font-medium'
              )}
            >
              {lastMessagePreview || 'No messages yet'}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
