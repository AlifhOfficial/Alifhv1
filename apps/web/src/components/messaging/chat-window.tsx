/**
 * Chat Window - Alifh Design System
 * Clean, lean chat interface
 */

'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Loader2, ArrowLeft, MoreVertical, Moon, Cloud } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import Link from 'next/link';
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
  };
  partner?: { id: string; name: string; logo: string | null };
  listing?: { id: string; title: string; thumbnail: string | null };
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
    otherUserId: otherParticipant?.id ?? null,
  });

  const { sendMessage, isSending } = useSendMessage();
  const { markAsRead } = useMarkAsRead();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Messages are newest-first from API, flex-col-reverse displays them correctly
  // No sort needed - newest at bottom naturally

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
    if (isLoading || messages.length === 0) return;
    
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
  }, [conversationId, isLoading, messages, userId, markAsRead]);

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
  const lastActiveAt = otherLastSeenAt ?? otherLastReadAt;

  const formatLastSeen = (date: Date) => {
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const defaultText = inbox === 'personal' && listing && messages.length === 0
    ? `Hi, I'd like to inquire about "${listing.title}". Is it still available?`
    : undefined;

  return (
    <div className={cn('flex flex-col h-full w-full min-h-0 bg-background', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-sm">
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
          <h3 className="font-semibold text-base truncate text-foreground">{displayName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isOtherTyping ? (
              <span className="text-xs text-muted-foreground italic">typing...</span>
            ) : isOtherOnline ? (
              <>
                <Moon className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Active now</span>
              </>
            ) : lastActiveAt ? (
              <>
                <Moon className="w-3 h-3 text-purple-500 fill-purple-500" />
                <span className="text-xs text-muted-foreground font-medium">Last seen {formatLastSeen(lastActiveAt)}</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-slate-500 fill-slate-400" />
                <span className="text-xs text-muted-foreground font-medium">Away</span>
              </>
            )}
          </div>
        </div>

        <button className="p-2 hover:bg-secondary/50 rounded-xl transition-colors" aria-label="More">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Listing Context */}
      {listing && (
        <div className="border-b border-border bg-muted/20 backdrop-blur-sm">
          <Link href={`/listings/${listing.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
            {listing.thumbnail ? (
              <img src={listing.thumbnail} alt={listing.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">Re: Listing</div>
              <div className="font-medium text-sm truncate">{listing.title}</div>
            </div>
            <div className="text-xs text-blue-500 hover:text-blue-600 flex-shrink-0">View →</div>
          </Link>
        </div>
      )}

      {/* Messages */}
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
              <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          </div>
        ) : (
          <>
            {messages.flatMap((message, index, arr) => {
              const elements: ReactNode[] = [];
              const messageDate = new Date(message.createdAt);
              // With flex-col-reverse, next in array is prev visually
              const nextMessage = arr[index + 1];
              const nextDate = nextMessage ? new Date(nextMessage.createdAt) : null;

              // Date separator before older messages (visually above)
              if (!nextDate || !isSameDay(nextDate, messageDate)) {
                elements.push(
                  <div key={`date-${message.id}`} className="flex justify-center py-3">
                    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {format(messageDate, 'EEE, MMM d')}
                    </span>
                  </div>
                );
              }

              const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
              const isOwn = message.senderId === userId;
              const isReadByOther = isOwn && otherLastReadAt ? messageDate <= otherLastReadAt : false;
              const showSeen = isOwn && message.id === lastReadMsgId;

              elements.push(
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  isReadByOther={isReadByOther}
                  showSeen={showSeen}
                  seenAt={otherLastReadAt}
                  otherUserAvatar={otherParticipant?.avatarUrl || null}
                />
              );

              return elements;
            })}

            {isOtherTyping && (
              <div className="flex items-center gap-2 px-2 py-1">
                <span className="text-xs text-muted-foreground italic">typing...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
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
