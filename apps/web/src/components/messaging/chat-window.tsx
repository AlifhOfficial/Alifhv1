/**
 * Chat Window - Revvup Design System
 * Clean, lean chat interface
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, X } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { LocationPickerDialog } from './location-picker-dialog';
import { useMessages, useSendMessage, useSendLocationMessage, useMarkAsRead } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import { format, formatDistanceToNow, isSameDay } from 'date-fns';
import type { LocationResult } from '@/hooks/use-location';
import Link from 'next/link';

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
}

export function ChatWindow({
  conversationId,
  userId,
  inbox = 'personal',
  otherParticipant,
  partner,
  listing,
  unreadCount = 0,
  myLastReadAt,
  onBack,
  className,
}: ChatWindowProps) {
  const {
    messages,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchMore,
    isOtherTyping,
    otherLastReadAt,
    isOtherOnline,
    otherLastSeenAt,
    sendTyping,
  } = useMessages(conversationId, userId, {
    initialLastReadAt: otherParticipant?.lastReadAt ?? null,
    initialLastSeenAt: otherParticipant?.lastSeenAt ?? null,
    otherUserId: otherParticipant?.id ?? null,
  });

  const { sendMessage, isSending } = useSendMessage();
  const { sendLocationMessage } = useSendLocationMessage();
  const { markAsRead } = useMarkAsRead();

  // Location picker dialog state
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isNearBottomRef = useRef(true);
  const paginationSnapshotRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const lastNewestMessageIdRef = useRef<string | null>(null);
  const hasAutoScrolledInitiallyRef = useRef(false);
  const [isDocumentActive, setIsDocumentActive] = useState(true);

  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.clientHeight - container.scrollTop;
    isNearBottomRef.current = distanceFromBottom < 100;
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const updateActivity = () => {
      setIsDocumentActive(document.visibilityState === 'visible' && document.hasFocus());
    };

    updateActivity();
    document.addEventListener('visibilitychange', updateActivity);
    window.addEventListener('focus', updateActivity);
    window.addEventListener('blur', updateActivity);

    return () => {
      document.removeEventListener('visibilitychange', updateActivity);
      window.removeEventListener('focus', updateActivity);
      window.removeEventListener('blur', updateActivity);
    };
  }, []);

  // Track if user is near bottom (for auto-scroll on new messages)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScrollState = () => updateScrollState();
    handleScrollState();
    container.addEventListener('scroll', handleScrollState);
    return () => container.removeEventListener('scroll', handleScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    const container = containerRef.current;
    const snapshot = paginationSnapshotRef.current;
    if (!container || !snapshot) return;

    const heightDelta = container.scrollHeight - snapshot.scrollHeight;
    container.scrollTop = snapshot.scrollTop + heightDelta;
    paginationSnapshotRef.current = null;
  }, [orderedMessages]);

  useEffect(() => {
    if (orderedMessages.length === 0 || isLoading) return;

    const container = containerRef.current;
    if (!container) return;

    const newestMessageId = messages[0]?.id ?? null;

    if (!hasAutoScrolledInitiallyRef.current) {
      container.scrollTop = container.scrollHeight;
      hasAutoScrolledInitiallyRef.current = true;
      lastNewestMessageIdRef.current = newestMessageId;
      updateScrollState();
      return;
    }

    const hasNewNewestMessage = newestMessageId !== lastNewestMessageIdRef.current;
    lastNewestMessageIdRef.current = newestMessageId;

    if (hasNewNewestMessage && isNearBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      updateScrollState();
    }
  }, [messages, orderedMessages.length, isLoading, updateScrollState]);

  // Find the NEWEST message that was read by other user (for "seen" indicator)
  const lastReadMsgId = useMemo(() => {
    if (!otherLastReadAt) return null;
    // Messages are newest-first, find the first (newest) own message that's been read
    for (const m of messages) {
      if (m.senderId === userId && new Date(m.createdAt) <= otherLastReadAt) {
        return m.id;
      }
    }
    return null;
  }, [messages, otherLastReadAt, userId]);

  // Track last message we've marked as read to prevent duplicate API calls
  const lastMarkedMsgIdRef = useRef<string | null>(null);
  
  // Parse myLastReadAt once
  const myLastReadAtDate = useMemo(() => {
    if (!myLastReadAt) return null;
    const d = myLastReadAt instanceof Date ? myLastReadAt : new Date(myLastReadAt);
    return isNaN(d.getTime()) ? null : d;
  }, [myLastReadAt]);
  
  // Reset tracking on conversation switch
  useEffect(() => {
    lastMessageIdRef.current = null;
    lastMarkedMsgIdRef.current = null;
    paginationSnapshotRef.current = null;
    lastNewestMessageIdRef.current = null;
    hasAutoScrolledInitiallyRef.current = false;
  }, [conversationId]);

  // Smart mark-as-read: only call API when necessary
  useEffect(() => {
    if (isLoading || messages.length === 0 || !isDocumentActive) return;
    
    const newestMessage = messages[0];
    if (!newestMessage) return;
    
    // Skip if we've already marked this exact message in this session
    if (newestMessage.id === lastMarkedMsgIdRef.current) return;
    
    const newestMessageTime = new Date(newestMessage.createdAt);
    const newestIsFromOther = newestMessage.senderId !== userId;
    
    // Skip if we've already read past this message (persisted in DB)
    const alreadyRead = myLastReadAtDate && newestMessageTime <= myLastReadAtDate;
    
    // Update tracking
    lastMessageIdRef.current = newestMessage.id;
    
    // Only call API if:
    // - Newest message is from other user AND we haven't read it yet
    // (If we already read it, our lastReadAt is already >= message time, so "Seen" works)
    if (newestIsFromOther && !alreadyRead) {
      lastMarkedMsgIdRef.current = newestMessage.id;
      markAsRead(conversationId);
    }
  }, [conversationId, isLoading, messages, userId, markAsRead, myLastReadAtDate, isDocumentActive]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();

    if (isFetchingMore || !hasMore) return;
    if (el.scrollTop > 80) return;

    paginationSnapshotRef.current = {
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
    };

    void fetchMore();
  }, [fetchMore, hasMore, isFetchingMore, updateScrollState]);

  const handleSend = async (text: string) => {
    await sendMessage({ conversationId, senderId: userId, text });
  };

  const handleOpenLocationDialog = () => {
    setIsLocationDialogOpen(true);
  };

  const handleConfirmLocation = async (location: LocationResult) => {
    await sendLocationMessage({ conversationId, senderId: userId, location });
  };

  // Display
  const displayName = inbox === 'personal' && partner ? partner.name : otherParticipant?.name || 'User';
  const isPartnerBrand = inbox === 'personal' && partner;
  // Use lastSeenAt first, fallback to lastReadAt, then to initial values from conversation
  const lastActiveAt = otherLastSeenAt ?? otherLastReadAt ?? 
    (otherParticipant?.lastSeenAt ? new Date(otherParticipant.lastSeenAt) : null) ?? 
    (otherParticipant?.lastReadAt ? new Date(otherParticipant.lastReadAt) : null);

  // Format last seen with relative time
  const getLastSeenText = (date: Date) => {
    // Using formatDistanceToNow which handles the time calculation internally
    return formatDistanceToNow(date, { addSuffix: false });
  };

  const defaultText = inbox === 'personal' && listing && messages.length === 0
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
              className="text-sm sm:text-[15px] font-bold tracking-tight truncate text-foreground hover:text-primary hover:underline transition-colors block leading-snug"
            >
              {displayName}
            </Link>
          ) : (
            <h3 className="text-sm sm:text-[15px] font-bold tracking-tight truncate text-foreground leading-snug">{displayName}</h3>
          )}
          {listing && (
            <Link
              href={`/listings/${listing.id}`}
              className="text-xs font-medium text-muted-foreground/70 truncate hover:text-primary hover:underline transition-colors block leading-snug"
            >
              {listing.title}
            </Link>
          )}
          <div className="flex items-center gap-1.5">
            {isOtherOnline && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400">Active</span>
              </div>
            )}
            {!isOtherOnline && lastActiveAt && (
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/70">Last seen {getLastSeenText(lastActiveAt)}</span>
            )}
            {!isOtherOnline && !lastActiveAt && (
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/50">Away</span>
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

      <div ref={containerRef} onScroll={handleScroll} className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2">
        {isFetchingMore && (
          <div className="sticky top-0 z-10 -mt-1 flex justify-center py-2 pointer-events-none">
            <div className="rounded-full bg-background/90 px-3 py-1 backdrop-blur-sm">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-2 sm:gap-3 py-4">
            <Skeleton className="h-9 w-36 rounded-2xl rounded-br-md self-end" />
            <Skeleton className="h-12 w-44 rounded-2xl rounded-bl-md self-start" />
            <Skeleton className="h-8 w-28 rounded-2xl rounded-br-md self-end" />
            <Skeleton className="h-10 w-40 rounded-2xl rounded-bl-md self-start" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center space-y-2.5 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-sidebar flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/40" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground/70">Start a conversation</p>
            </div>
          </div>
        ) : (
          <div className="contents">
            {isOtherTyping && (
              <div key="typing" className="flex items-start gap-2 sm:gap-2.5 mb-1.5 px-1.5 sm:px-2">
                <div className="w-6 sm:w-8 flex-shrink-0" />
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-sidebar border border-border/30 rounded-xl rounded-bl-md">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/70">typing...</span>
                </div>
              </div>
            )}

            {orderedMessages.map((message, index, arr) => {
              const messageDate = new Date(message.createdAt);
              const previousMessage = arr[index - 1];
              const previousDate = previousMessage ? new Date(previousMessage.createdAt) : null;
              const showDateSeparator = !previousDate || !isSameDay(previousDate, messageDate);

              const nextMessage = arr[index + 1];
              const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
              const isOwn = message.senderId === userId;
              const isReadByOther = isOwn && otherLastReadAt ? messageDate <= otherLastReadAt : false;
              const showSeen = isOwn && message.id === lastReadMsgId;

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center py-1.5 sm:py-2">
                      <span className="text-[10px] sm:text-xs rounded-full bg-muted/60 px-2.5 sm:px-3 py-0.5 sm:py-1 text-muted-foreground/70 font-semibold">
                        {format(messageDate, 'EEE, MMM d')}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    isReadByOther={isReadByOther}
                    showSeen={showSeen}
                    seenAt={otherLastReadAt}
                    otherUserAvatar={otherParticipant?.avatarUrl ?? null}
                    otherUserName={otherParticipant?.name ?? null}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MessageInput
        onSend={handleSend}
        onTyping={(isTyping) => otherParticipant?.id && sendTyping(otherParticipant.id, isTyping)}
        onRequestLocation={handleOpenLocationDialog}
        disabled={isSending}
        initialText={!isLoading && messages.length === 0 ? defaultText : undefined}
        resetKey={conversationId}
      />

      {/* Location Picker Dialog */}
      <LocationPickerDialog
        isOpen={isLocationDialogOpen}
        onClose={() => setIsLocationDialogOpen(false)}
        onConfirm={handleConfirmLocation}
      />
    </div>
  );
}
