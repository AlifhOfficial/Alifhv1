/**
 * Message Bubble Component - Revvup Design System
 * Individual message display with sender/receiver styling
 */

'use client';

import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { cn } from '@/utils/cn';
import { getAppThumbUrl } from '@/utils/storage';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '@/hooks/messaging';
import { LocationBubble } from './location-bubble';
import Link from 'next/link';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showSeen?: boolean;
  otherUserAvatar?: string | null;
  otherUserName?: string | null;
  listing?: { id: string; title: string; thumbnail: string | null };
  /** Compact mode for floating chat windows */
  compact?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showSeen = false,
  otherUserAvatar,
  otherUserName,
  listing,
  compact = false,
}: MessageBubbleProps) {
  const { sender, text, mediaUrl, mediaType, mediaMetadata, createdAt, isEdited, isSystemMessage } = message;
  
  // Check if this is a temporary optimistic message
  const isOptimistic = message.id.startsWith('temp-');

  // Extract location data if present
  const locationData = mediaType === 'location' && mediaMetadata ? {
    latitude: (mediaMetadata as { latitude?: number }).latitude,
    longitude: (mediaMetadata as { longitude?: number }).longitude,
    address: (mediaMetadata as { address?: string }).address,
    placeName: (mediaMetadata as { placeName?: string }).placeName,
  } : null;

  // System message (centered, muted)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-2">
        <small className="text-caption1 text-muted-foreground/70 px-3 py-1.5 bg-muted/40 rounded-full font-semibold">
          {text}
        </small>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-end mb-1 sm:mb-1.5 group animate-in fade-in slide-in-from-bottom-2 duration-200',
        compact ? 'gap-1.5' : 'gap-2 sm:gap-2.5',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isOptimistic && 'opacity-70'
      )}
    >
      {/* Avatar - only show for received messages */}
      {/* Use otherUserAvatar/Name (partner info when available) instead of individual sender info */}
      {!isOwn && (
        showAvatar ? (
          <UserAvatar
            src={otherUserAvatar ?? sender.avatarUrl}
            name={otherUserName ?? sender.name}
            size="sm"
            className={cn(compact ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8', 'flex-shrink-0')}
          />
        ) : (
          <div className={cn(compact ? 'w-6' : 'w-6 sm:w-8', 'flex-shrink-0')} />
        )
      )}

      {/* Message Content */}
      <div className={cn(
        'flex flex-col min-w-0',
        compact ? 'max-w-[85%]' : 'max-w-[85%] sm:max-w-[80%] md:max-w-[65%]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {/* Listing Preview - rendered OUTSIDE the bubble, clickable to listing */}
        {listing && (
          <Link
            href={`/listings/${listing.id}`}
            className="mb-1.5 sm:mb-2 max-w-[240px] sm:max-w-[280px] rounded-xl overflow-hidden border border-border/30 bg-card shadow-sm block hover:border-primary/50 hover:shadow-md transition-all"
          >
            {getAppThumbUrl(listing.thumbnail) ? (
              <img 
                src={getAppThumbUrl(listing.thumbnail)!} 
                alt={listing.title} 
                className="w-full aspect-[4/3] object-cover" 
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-muted/40" />
            )}
            <div className="p-2 sm:p-2.5 bg-card">
              <p className="text-caption1 sm:text-subhead font-bold text-foreground line-clamp-2">
                {listing.title}
              </p>
            </div>
          </Link>
        )}

        {/* Message Bubble with Hover Timestamp */}
        <div className="relative flex items-center gap-1">
          {/* Message Bubble */}
          <div
            className={cn(
              'break-words transition-all duration-200',
              compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl sm:rounded-[18px] px-3 sm:px-4 py-2 sm:py-2.5',
              isOwn
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-sidebar border border-border/30 text-foreground rounded-bl-md',
              isOptimistic && 'opacity-70'
            )}
          >
            {/* Media (if any) */}
            {mediaUrl && mediaType === 'image' && (
              <img
                src={mediaUrl}
                alt="Attached"
                className="rounded-lg mb-2 max-w-full h-auto"
              />
            )}

            {/* Location (if any) */}
            {locationData?.latitude && locationData?.longitude && (
              <div className="mb-2">
                <LocationBubble
                  latitude={locationData.latitude}
                  longitude={locationData.longitude}
                  address={locationData.address}
                  placeName={locationData.placeName}
                  isOwn={isOwn}
                  compact={compact}
                />
              </div>
            )}

            {/* Text */}
            {text && (
              <p className={cn(
                'whitespace-pre-wrap font-medium',
                compact ? 'text-footnote leading-snug' : 'text-subhead leading-relaxed'
              )}>
                {text}
              </p>
            )}

            {/* Edited indicator */}
            {isEdited && (
              <small className={cn(
                'text-caption1 opacity-70 mt-1 block',
                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                (edited)
              </small>
            )}
          </div>
          
          {/* Sending dot - right of bubble for own messages */}
          {isOptimistic && isOwn && (
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse" />
          )}

          {/* Hover Timestamp - Shows on hover */}
          <small 
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-caption1 text-muted-foreground/70',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none whitespace-nowrap z-10',
              isOwn ? '-left-2 -translate-x-full' : '-right-2 translate-x-full',
              isOptimistic && 'opacity-0' // Hide timestamp for optimistic messages
            )}
          >
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </small>
        </div>

        {/* Seen indicator */}
        {showSeen && isOwn && (
          <div className="mt-1 flex items-center justify-end gap-1.5 px-2">
            <small className="text-caption1 text-muted-foreground/70">Seen</small>
            <UserAvatar
              src={otherUserAvatar}
              name={otherUserName || 'User'}
              size="xs"
              className="w-4 h-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}
