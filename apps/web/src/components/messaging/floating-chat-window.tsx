/**
 * Floating Chat Window - Compact chat for global access
 * Appears at bottom-right of screen
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Minus, Maximize2, Moon, Cloud } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { MessageBubble } from '@/components/messaging/message-bubble';
import { MessageInput } from '@/components/messaging/message-input';
import { useMessages, useSendMessage, useMarkAsRead, type Conversation } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import { format, isSameDay } from 'date-fns';

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
    sendTyping,
  } = useMessages(conversation.id, userId, {
    initialLastReadAt: otherParticipant?.lastReadAt ?? null,
    otherUserId: otherParticipant?.id ?? null,
  });

  const { sendMessage, isSending } = useSendMessage();
  const { markAsRead } = useMarkAsRead();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Display info
  const displayName = partner?.name || otherParticipant?.name || 'User';
  const isPartnerBrand = !!partner;

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

  // Mark as read when opening or receiving new messages
  useEffect(() => {
    if (isLoading || messages.length === 0 || isMinimized) return;
    
    const newestMessage = messages[0];
    if (!newestMessage) return;
    
    const isFirstLoad = lastMessageIdRef.current === null;
    const isNewMessageFromOther = newestMessage.senderId !== userId && newestMessage.id !== lastMessageIdRef.current;
    
    if (isFirstLoad || isNewMessageFromOther) {
      lastMessageIdRef.current = newestMessage.id;
      markAsRead(conversation.id);
    }
  }, [conversation.id, isLoading, messages, userId, markAsRead, isMinimized]);

  // Reset on conversation switch
  useEffect(() => {
    lastMessageIdRef.current = null;
  }, [conversation.id]);

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
      className="fixed z-40 transition-all duration-200 ease-out"
      style={{ 
        right: rightOffset, 
        width: 320, 
        height: isMinimized ? 44 : 480,
        bottom: isMinimized ? 24 : 0
      }}
    >
      <div
        className={cn(
          'flex flex-col h-full bg-background border border-border shadow-2xl overflow-hidden',
          isMinimized ? 'rounded-xl' : 'rounded-t-xl'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 bg-sidebar cursor-pointer',
            !isMinimized && 'border-b border-sidebar-border'
          )}
          onClick={isMinimized ? onMaximize : undefined}
        >
          {/* Avatar - clickable to open in dashboard */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-dashboard/messaging?conversation=${conversation.id}`);
              onClose();
            }}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {isPartnerBrand ? (
              <BrandAvatar logoUrl={partner?.logo} brandName={partner?.name || 'Partner'} size="xs" className="w-7 h-7" />
            ) : (
              <UserAvatar src={otherParticipant?.avatarUrl} name={displayName} size="sm" className="w-7 h-7" />
            )}
          </button>

          {/* Name + Activity Status - clickable to open in dashboard */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-dashboard/messaging?conversation=${conversation.id}`);
              onClose();
            }}
            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-1.5">
              <h4 className="text-[13px] font-semibold truncate text-sidebar-foreground">
                {displayName}
              </h4>
              {/* Activity indicator - inline with name */}
              {isOtherOnline ? (
                <Moon className="w-2.5 h-2.5 text-rose-500 fill-rose-500 flex-shrink-0" />
              ) : (
                <Cloud className="w-2.5 h-2.5 text-slate-400 fill-slate-300 flex-shrink-0" />
              )}
            </div>
            {listing && (
              <p className="text-[11px] text-muted-foreground/70 truncate leading-tight">
                RE: {listing.title}
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
              className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
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
              className="flex-1 min-h-0 overflow-y-auto p-3 bg-background flex flex-col-reverse gap-1.5"
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
                  <p className="text-[13px] text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                <div className="contents">
                  {isOtherTyping && (
                    <div key="typing" className="flex items-start gap-2 mb-1 px-1">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-xl rounded-tl-sm">
                        <span className="text-[12px] text-muted-foreground italic">typing...</span>
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
                            <span className="text-[11px] text-muted-foreground/70 bg-muted px-2.5 py-1 rounded-full font-medium">
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
                          otherUserAvatar={otherParticipant?.avatarUrl || null}
                          otherUserName={otherParticipant?.name || null}
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
