/**
 * Chat Window - Revvup Design System
 * Clean, lean chat interface
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, ArrowLeft, MessageCircle, X } from 'lucide-react';
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
  const { markAsRead } = useMarkAsRead();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isNearBottomRef = useRef(true);

  // Messages are newest-first from API, flex-col-reverse displays them correctly

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
  }, [conversationId]);

  // Smart mark-as-read: only call API when necessary
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    
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
  }, [conversationId, isLoading, messages, userId, markAsRead, myLastReadAtDate]);

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
    <div className={cn('flex flex-col h-full w-full min-h-0 bg-background overflow-hidden', className)}>
      {/* Header - fixed at top, never scrolls */}
      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/40 bg-background z-10">
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

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-[15px] font-bold tracking-tight truncate text-foreground">{displayName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
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

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 bg-background flex flex-col-reverse gap-1.5 sm:gap-2">
        {isFetchingMore && (
          <div className="flex justify-center py-3 sm:py-4">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
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
        disabled={isSending}
        initialText={!isLoading && messages.length === 0 ? defaultText : undefined}
        resetKey={conversationId}
      />
    </div>
  );
}
