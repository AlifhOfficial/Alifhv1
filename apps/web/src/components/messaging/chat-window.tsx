/**
 * Chat Window - Alifh Design System
 * Clean, lean chat interface
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, ArrowLeft, Moon, Cloud, MessageCircle } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import { format, formatDistanceToNow, isSameDay } from 'date-fns';

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
  const { markAsRead } = useMarkAsRead();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const [showListingPreview, setShowListingPreview] = useState(true);
  const isNearBottomRef = useRef(true);

  // Messages are newest-first from API, flex-col-reverse displays them correctly
  // No sort needed - newest at bottom naturally

  // Hide listing preview once first message is sent
  useEffect(() => {
    if (messages.length > 0 && showListingPreview) {
      setShowListingPreview(false);
    }
  }, [messages.length, showListingPreview]);

  // Track if user is near bottom (for auto-scroll on new messages)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop } = container;
      // In flex-col-reverse, scrollTop of 0 is at the bottom
      // Negative scrollTop means scrolling up into older messages
      const distanceFromBottom = Math.abs(scrollTop);
      isNearBottomRef.current = distanceFromBottom < 100;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to bottom when sending message or receiving new message while at bottom
  useEffect(() => {
    if (messages.length === 0 || isLoading) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Auto-scroll if user is near bottom
    if (isNearBottomRef.current) {
      // Use smooth scroll for better UX
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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

  // No auto-scroll needed - flex-col-reverse naturally shows newest at bottom

  // Mark as read when opening conversation or receiving messages from other user
  useEffect(() => {
    if (isLoading || messages.length === 0 || unreadCount === 0) return;
    
    // Get the newest message
    const newestMessage = messages[0];
    if (!newestMessage) return;
    
    // Mark as read if:
    // 1. First load of this conversation (lastMessageIdRef is null)
    // 2. New message from other user that we haven't processed
    const isFirstLoad = lastMessageIdRef.current === null;
    const isNewMessageFromOther = newestMessage.senderId !== userId && newestMessage.id !== lastMessageIdRef.current;
    
    if (isFirstLoad || isNewMessageFromOther) {
      lastMessageIdRef.current = newestMessage.id;
      markAsRead(conversationId);
    }
  }, [conversationId, isLoading, messages, userId, unreadCount, markAsRead]);

  // Reset on conversation switch
  useEffect(() => {
    lastMessageIdRef.current = null;
  }, [conversationId]);

  // Infinite scroll
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || isFetchingMore || !hasMore) return;
    if (el.scrollTop <= 40) fetchMore();
  };

  const handleSend = async (text: string) => {
    await sendMessage({ conversationId, senderId: userId, text });
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
    ? `Hi, is this still available?`
    : undefined;

  return (
    <div className={cn('flex flex-col h-full w-full min-h-0 bg-background', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-background">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-secondary/50 rounded-xl transition-colors lg:hidden" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative flex-shrink-0">
          {isPartnerBrand ? (
            <BrandAvatar logoUrl={partner?.logo} brandName={partner?.name || 'Partner'} size="sm" className="w-11 h-11" />
          ) : (
            <UserAvatar src={otherParticipant?.avatarUrl} name={displayName} size="md" className="w-11 h-11" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight truncate text-foreground">{displayName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isOtherOnline && (
              <div className="flex items-center gap-1.5">
                <Moon className="w-3 h-3 text-rose-500 fill-rose-500" />
                <small className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Active now</small>
              </div>
            )}
            {!isOtherOnline && lastActiveAt && (
              <div className="flex items-center gap-1.5">
                <Moon className="w-3 h-3 text-purple-500 fill-purple-500" />
                <small className="text-xs text-muted-foreground/70 font-medium">Last seen {getLastSeenText(lastActiveAt)}</small>
              </div>
            )}
            {!isOtherOnline && !lastActiveAt && (
              <div className="flex items-center gap-1.5">
                <Cloud className="w-3 h-3 text-slate-500 fill-slate-400" />
                <small className="text-xs text-muted-foreground/70 font-medium">Away</small>
              </div>
            )}
          </div>
        </div>

        {onBack && (
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors hidden lg:flex" 
            aria-label="Close"
            title="Close"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto p-4 bg-background flex flex-col-reverse gap-2">
        {isFetchingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 stroke-[1.5]" />
              <p className="text-[15px] text-muted-foreground">No messages yet</p>
            </div>
          </div>
        ) : (
          <div className="contents">
            {isOtherTyping && (
              <div key="typing" className="flex items-start gap-2.5 mb-1.5 px-2">
                <div className="w-8 flex-shrink-0" />
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl rounded-tl-sm">
                  <small className="text-xs text-muted-foreground italic">typing...</small>
                </div>
              </div>
            )}

            {messages.map((message, index, arr) => {
              const messageDate = new Date(message.createdAt);
              // With flex-col-reverse, next in array is prev visually
              const nextMessage = arr[index + 1];
              const nextDate = nextMessage ? new Date(nextMessage.createdAt) : null;
              const showDateSeparator = !nextDate || !isSameDay(nextDate, messageDate);

              const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
              const isOwn = message.senderId === userId;
              const isReadByOther = isOwn && otherLastReadAt ? messageDate <= otherLastReadAt : false;
              const showSeen = isOwn && message.id === lastReadMsgId;

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center py-3">
                      <small className="text-xs inline-flex items-center rounded-full bg-muted px-3 py-1 text-muted-foreground/70">
                        {format(messageDate, 'EEE, MMM d')}
                      </small>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    isReadByOther={isReadByOther}
                    showSeen={showSeen}
                    seenAt={otherLastReadAt}
                    otherUserAvatar={otherParticipant?.avatarUrl || null}
                    otherUserName={otherParticipant?.name || null}
                    listing={index === arr.length - 1 && listing ? listing : undefined}
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
        disabled={isSending}
        initialText={!isLoading && messages.length === 0 ? defaultText : undefined}
        resetKey={conversationId}
        listingPreview={!isLoading && messages.length === 0 && showListingPreview ? listing : undefined}
        onDismissListing={() => setShowListingPreview(false)}
      />
    </div>
  );
}
