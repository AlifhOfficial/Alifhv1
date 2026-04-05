'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { LocationPickerDialog } from './location-picker-dialog';
import {
  useMarkAsRead,
  useMessages,
  useSendLocationMessage,
  useSendMessage,
  type InitialMessagesData,
} from '@/hooks/messaging';
import { markConversationActive, markConversationInactive } from '@/hooks/messaging/active-conversations';
import { cn } from '@/utils/cn';
import type { LocationResult } from '@/hooks/use-location';
import {
  getNewestUnreadIncomingMessageId,
} from '@alifh/shared';

interface ChatThreadParticipant {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  lastReadAt?: Date | string | null;
  lastSeenAt?: Date | string | null;
}

interface ChatThreadListing {
  id: string;
  title: string;
  thumbnail: string | null;
}

interface ChatThreadProps {
  controller: ChatThreadController;
  defaultText?: string;
  compact?: boolean;
  className?: string;
}

export interface ChatThreadController {
  conversationId: string;
  userId: string;
  otherParticipant?: ChatThreadParticipant;
  listing?: ChatThreadListing;
  messages: ReturnType<typeof useMessages>['messages'];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  fetchMore: ReturnType<typeof useMessages>['fetchMore'];
  isOtherTyping: boolean;
  otherLastReadAt: ReturnType<typeof useMessages>['otherLastReadAt'];
  otherLastReadMessageId: ReturnType<typeof useMessages>['otherLastReadMessageId'];
  otherLastSeenAt: ReturnType<typeof useMessages>['otherLastSeenAt'];
  isOtherOnline: ReturnType<typeof useMessages>['isOtherOnline'];
  sendTyping: ReturnType<typeof useMessages>['sendTyping'];
  isSending: boolean;
  sendMessage: ReturnType<typeof useSendMessage>['sendMessage'];
  sendLocationMessage: ReturnType<typeof useSendLocationMessage>['sendLocationMessage'];
}

interface UseChatThreadControllerOptions {
  conversationId: string;
  userId: string;
  otherParticipant?: ChatThreadParticipant;
  listing?: ChatThreadListing;
  myLastReadAt?: Date | string | null;
  initialMessages?: InitialMessagesData;
  active?: boolean;
}

export function useChatThreadController({
  conversationId,
  userId,
  otherParticipant,
  listing,
  myLastReadAt,
  initialMessages,
  active = true,
}: UseChatThreadControllerOptions): ChatThreadController {
  const {
    messages,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchMore,
    isOtherTyping,
    otherLastReadAt,
    otherLastReadMessageId,
    otherLastSeenAt,
    isOtherOnline,
    sendTyping,
  } = useMessages(conversationId, userId, {
    initialLastReadAt: otherParticipant?.lastReadAt ?? null,
    initialLastSeenAt: otherParticipant?.lastSeenAt ?? null,
    otherUserId: otherParticipant?.id ?? null,
    initialData: initialMessages,
  });

  const { sendMessage, isSending } = useSendMessage();
  const { sendLocationMessage } = useSendLocationMessage();
  const { markAsRead } = useMarkAsRead();

  const lastMarkedMsgIdRef = useRef<string | null>(null);
  const myLastReadAtDate = useMemo(() => {
    if (!myLastReadAt) return null;
    const date = myLastReadAt instanceof Date ? myLastReadAt : new Date(String(myLastReadAt));
    return Number.isNaN(date.getTime()) ? null : date;
  }, [myLastReadAt]);

  useEffect(() => {
    lastMarkedMsgIdRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (!active) return;
    markConversationActive(conversationId);
    return () => markConversationInactive(conversationId);
  }, [conversationId, active]);

  const newestUnreadIncomingMessageId = useMemo(
    () => getNewestUnreadIncomingMessageId(messages, userId, myLastReadAtDate),
    [messages, userId, myLastReadAtDate]
  );

  useEffect(() => {
    if (!active || isLoading || !newestUnreadIncomingMessageId) return;
    if (lastMarkedMsgIdRef.current === newestUnreadIncomingMessageId) return;

    lastMarkedMsgIdRef.current = newestUnreadIncomingMessageId;
    markAsRead(conversationId, newestUnreadIncomingMessageId);
  }, [
    active,
    conversationId,
    isLoading,
    newestUnreadIncomingMessageId,
    markAsRead,
  ]);

  return {
    conversationId,
    userId,
    otherParticipant,
    listing,
    messages,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchMore,
    isOtherTyping,
    otherLastReadAt,
    otherLastReadMessageId,
    otherLastSeenAt,
    isOtherOnline,
    sendTyping,
    isSending,
    sendMessage,
    sendLocationMessage,
  };
}

export function ChatThread({
  controller,
  defaultText,
  compact = false,
  className,
}: ChatThreadProps) {
  const {
    conversationId,
    userId,
    otherParticipant,
    messages,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchMore,
    isOtherTyping,
    otherLastReadAt,
    otherLastReadMessageId,
    sendTyping,
    isSending,
    sendMessage,
    sendLocationMessage,
  } = controller;

  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const paginationSnapshotRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const lastNewestMessageIdRef = useRef<string | null>(null);
  const hasAutoScrolledInitiallyRef = useRef(false);
  const forceScrollToBottomRef = useRef(true);
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.clientHeight - container.scrollTop;
    isNearBottomRef.current = distanceFromBottom < 100;
  }, []);

  useEffect(() => {
    paginationSnapshotRef.current = null;
    lastNewestMessageIdRef.current = null;
    hasAutoScrolledInitiallyRef.current = false;
    forceScrollToBottomRef.current = true;
  }, [conversationId]);

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

  useLayoutEffect(() => {
    if (orderedMessages.length === 0 || isLoading) return;

    const container = containerRef.current;
    if (!container) return;

    const newestMessageId = messages[0]?.id ?? null;

    if (forceScrollToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      forceScrollToBottomRef.current = false;
      hasAutoScrolledInitiallyRef.current = true;
      lastNewestMessageIdRef.current = newestMessageId;
      updateScrollState();
      return;
    }

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

  const lastReadMsgId = useMemo(() => {
    if (otherLastReadMessageId) {
      const matched = messages.find(
        (m) => m.id === otherLastReadMessageId && m.senderId === userId && !m.id.startsWith('temp-')
      );
      if (matched) return matched.id;
    }

    if (!otherLastReadAt) return null;

    const readCutoff = otherLastReadAt instanceof Date
      ? otherLastReadAt.getTime()
      : new Date(otherLastReadAt).getTime();

    if (Number.isNaN(readCutoff)) return null;

    let candidate: { id: string; createdAt: number } | null = null;

    // Order-independent: always pick the latest own message that is at or before read cutoff.
    for (const message of messages) {
      if (message.senderId !== userId || message.id.startsWith('temp-')) continue;

      const createdAt = new Date(message.createdAt).getTime();
      if (Number.isNaN(createdAt) || createdAt > readCutoff) continue;

      if (!candidate || createdAt >= candidate.createdAt) {
        candidate = { id: message.id, createdAt };
      }
    }

    return candidate?.id ?? null;
  }, [messages, userId, otherLastReadAt, otherLastReadMessageId]);

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

  const handleConfirmLocation = async (location: LocationResult) => {
    await sendLocationMessage({ conversationId, senderId: userId, location });
  };

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          'relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-background flex flex-col',
          compact ? 'p-3 pb-12 gap-1.5' : 'p-3 sm:p-4 pb-20 sm:pb-24 gap-1.5 sm:gap-2',
          className,
        )}
      >
        {isFetchingMore && (
          <div className="sticky top-0 z-10 -mt-1 flex justify-center py-2 pointer-events-none">
            <div className={cn('rounded-full bg-background/90 backdrop-blur-sm', compact ? 'px-2.5 py-1' : 'px-3 py-1')}>
              <Skeleton className={cn('rounded-full', compact ? 'h-4 w-4' : 'h-5 w-5')} />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className={cn('flex flex-col', compact ? 'gap-2 py-2' : 'gap-2 sm:gap-3 py-4')}>
            <Skeleton className={cn('self-end', compact ? 'h-7 w-28 rounded-xl rounded-br-sm' : 'h-9 w-36 rounded-2xl rounded-br-md')} />
            <Skeleton className={cn('self-start', compact ? 'h-9 w-36 rounded-xl rounded-bl-sm' : 'h-12 w-44 rounded-2xl rounded-bl-md')} />
            <Skeleton className={cn('self-end', compact ? 'h-6 w-24 rounded-xl rounded-br-sm' : 'h-8 w-28 rounded-2xl rounded-br-md')} />
            {!compact && <Skeleton className="h-10 w-40 rounded-2xl rounded-bl-md self-start" />}
          </div>
        ) : messages.length === 0 ? (
          compact ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-footnote font-medium text-muted-foreground/70">No messages yet</p>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center space-y-2.5 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-sidebar flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/40" />
                </div>
                <p className="text-subhead font-medium text-muted-foreground/70">Start a conversation</p>
              </div>
            </div>
          )
        ) : (
          <div className="contents">
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
                    <div className={cn('flex justify-center', compact ? 'py-2' : 'py-1.5 sm:py-2')}>
                      <span
                        className={cn(
                          'rounded-full bg-muted/60 text-muted-foreground/70 font-semibold',
                          compact ? 'text-caption2 px-2.5 py-0.5' : 'text-caption2 px-2.5 sm:px-3 py-0.5 sm:py-1',
                        )}
                      >
                        {format(messageDate, compact ? 'MMM d' : 'EEE, MMM d')}
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
                    compact={compact}
                  />
                </div>
              );
            })}

            {isOtherTyping && (
              <div
                key="typing"
                className={cn(
                  'self-start min-w-0',
                  compact ? 'mt-1 ml-[30px]' : 'mt-1.5 ml-8 sm:ml-10',
                )}
              >
                <span className={cn('font-medium text-muted-foreground/70 whitespace-nowrap', compact ? 'text-footnote leading-snug' : 'text-subhead leading-relaxed')}>
                  typing...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <MessageInput
        onSend={handleSend}
        onTyping={(isTyping) => otherParticipant?.id && sendTyping(otherParticipant.id, isTyping)}
        onRequestLocation={() => setIsLocationDialogOpen(true)}
        disabled={isSending}
        initialText={!isLoading && messages.length === 0 ? defaultText : undefined}
        resetKey={conversationId}
        compact={compact}
      />

      <LocationPickerDialog
        isOpen={isLocationDialogOpen}
        onClose={() => setIsLocationDialogOpen(false)}
        onConfirm={handleConfirmLocation}
      />
    </>
  );
}
