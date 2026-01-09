/**
 * Floating Chat Window - Compact chat for global access
 * Appears at bottom-right of screen
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Minus, Maximize2 } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { MessageBubble } from '@/components/messaging/message-bubble';
import { MessageInput } from '@/components/messaging/message-input';
import { useMessages, useSendMessage, useMarkAsRead, type Conversation } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import { format, isSameDay } from 'date-fns';

// Simple time ago formatter (1m, 5m, 1h, 12h, 1d, etc)
function formatTimeAgo(date: Date | string | null): string | null {
  if (!date) return null;
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface FloatingChatWindowProps {
  conversation: Conversation;
  userId: string;
  position: number; // 0-indexed position from right
  isMinimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export function FloatingChatWindow({
  conversation,
  userId,
  position,
  isMinimized,
  onMinimize,
  onMaximize,
  onClose,
}: FloatingChatWindowProps) {
  const router = useRouter();
  const { otherParticipant, partner, listing } = conversation;
  
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
  } = useMessages(conversation.id, userId, {
    initialLastReadAt: otherParticipant?.lastReadAt ?? null,
    initialLastSeenAt: otherParticipant?.lastSeenAt ?? null,
    otherUserId: otherParticipant?.id ?? null,
  });

  const { sendMessage, isSending } = useSendMessage();
  const { markAsRead } = useMarkAsRead();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Display info
  const displayName = partner?.name || otherParticipant?.name || 'User';
  const isPartnerBrand = !!partner;
  
  // Sync with chat-window: Use lastSeenAt first, fallback to lastReadAt, then to initial values
  const lastActiveAt = otherLastSeenAt ?? otherLastReadAt ?? 
    (otherParticipant?.lastSeenAt ? new Date(String(otherParticipant.lastSeenAt)) : null) ?? 
    (otherParticipant?.lastReadAt ? new Date(String(otherParticipant.lastReadAt)) : null);

  // Find last read message for "seen" indicator
  const lastReadMsgId = useMemo(() => {
    if (!otherLastReadAt) return null;
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
    const v = conversation.myLastReadAt;
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }, [conversation.myLastReadAt]);
  
  // Reset tracking on conversation switch
  useEffect(() => {
    lastMessageIdRef.current = null;
    lastMarkedMsgIdRef.current = null;
  }, [conversation.id]);

  // Smart mark-as-read: only call API when necessary
  useEffect(() => {
    if (isLoading || messages.length === 0 || isMinimized) return;
    
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
    if (newestIsFromOther && !alreadyRead) {
      lastMarkedMsgIdRef.current = newestMessage.id;
      markAsRead(conversation.id);
    }
  }, [conversation.id, isLoading, messages, userId, markAsRead, isMinimized, myLastReadAtDate]);

  // Infinite scroll
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || isFetchingMore || !hasMore) return;
    if (el.scrollTop <= 40) fetchMore();
  };

  const handleSend = async (text: string) => {
    await sendMessage({ conversationId: conversation.id, senderId: userId, text });
  };

  // Calculate position from right edge
  const rightOffset = 24 + position * 340; // 340px per window + 24px initial margin

  return (
    <div
      className="fixed z-40 transition-all duration-200 ease-out overflow-hidden"
      style={{ 
        right: rightOffset, 
        width: 320, 
        height: isMinimized ? 52 : 480,
        bottom: isMinimized ? 24 : 0
      }}
    >
      <div
        className={cn(
          'flex flex-col h-full bg-background border border-border shadow-2xl overflow-hidden',
          isMinimized ? 'rounded-2xl' : 'rounded-t-xl'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 bg-sidebar cursor-pointer',
            isMinimized ? 'h-full' : 'py-3 border-b border-sidebar-border'
          )}
          onClick={isMinimized ? onMaximize : undefined}
        >
          {/* Avatar - clickable to open in dashboard */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-dashboard/messaging?conversationId=${conversation.id}`);
              onClose();
            }}
            className="flex-shrink-0 hover:opacity-80 transition-opacity flex items-center"
          >
            {isPartnerBrand ? (
              <BrandAvatar logoUrl={partner?.logo} brandName={partner?.name || 'Partner'} size="sm" className="w-9 h-9" />
            ) : (
              <UserAvatar src={otherParticipant?.avatarUrl} name={displayName} size="md" className="w-9 h-9" />
            )}
          </button>

          {/* Name + Activity Status - clickable to open in dashboard */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-dashboard/messaging?conversationId=${conversation.id}`);
              onClose();
            }}
            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight truncate text-sidebar-foreground">
                {displayName}
              </h4>
              {/* Activity indicator */}
              {isOtherOnline ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-green-500">now</span>
                </div>
              ) : lastActiveAt ? (
                <span className="text-xs font-medium text-muted-foreground/70 flex-shrink-0">
                  {formatTimeAgo(lastActiveAt)}
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground/50 flex-shrink-0">away</span>
              )}
            </div>
            {!isMinimized && listing && (
              <p className="text-xs font-medium text-muted-foreground/70 truncate mt-0.5">
                {listing.title}
              </p>
            )}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isMinimized) {
                  onMaximize();
                } else {
                  onMinimize();
                }
              }}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors flex items-center justify-center"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Chat Content - Hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div
              ref={containerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 bg-background flex flex-col-reverse gap-1.5"
            >
              {isFetchingMore && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[13px] font-medium text-muted-foreground/70">No messages yet</p>
                </div>
              ) : (
                <div className="contents">
                  {isOtherTyping && (
                    <div key="typing" className="flex items-start gap-2 mb-1 px-1">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sidebar border border-border/30 rounded-lg rounded-bl-sm">
                        <span className="text-xs font-medium text-muted-foreground/70">typing...</span>
                      </div>
                    </div>
                  )}

                  {messages.map((message, index, arr) => {
                    const messageDate = new Date(message.createdAt);
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
                          <div className="flex justify-center py-2">
                            <span className="text-[11px] text-muted-foreground/70 bg-muted/60 px-2.5 py-0.5 rounded-full font-semibold">
                              {format(messageDate, 'MMM d')}
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
                          compact
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input */}
            <MessageInput
              onSend={handleSend}
              onTyping={(isTyping) => otherParticipant?.id && sendTyping(otherParticipant.id, isTyping)}
              disabled={isSending}
              resetKey={conversation.id}
              compact
            />
          </>
        )}
      </div>
    </div>
  );
}
