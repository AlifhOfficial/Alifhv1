/**
 * Chat Window - Mobile Native
 * Full conversation view with messages list, input, and real-time updates
 */

import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { format, isToday, isYesterday, isThisWeek, isSameDay } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { ChatHeader } from './chat-header';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { useMessages } from './hooks/useMessages';
import { Body, Data, Supporting } from '@/components/ui';
import { markConversationAsRead, type Message, type Conversation } from '@/lib/messaging-api';

const PANEL_WIDTH = 80;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  conversation?: Conversation;
  isAuthenticated: boolean;
  onBack?: () => void;
}

export function ChatWindow({
  conversationId,
  userId,
  conversation,
  isAuthenticated,
  onBack,
}: ChatWindowProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);

  // Timestamp panel state
  const panelTranslateX = useSharedValue(PANEL_WIDTH);

  // Close panel
  const closePanel = useCallback(() => {
    panelTranslateX.value = withTiming(PANEL_WIDTH, { duration: 150 });
  }, [panelTranslateX]);

  // Horizontal swipe gesture - opens while swiping, closes on release
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      // Only respond to left swipe (negative translation)
      if (event.translationX < 0) {
        // Map swipe distance to panel position
        const progress = Math.min(Math.abs(event.translationX) / PANEL_WIDTH, 1);
        panelTranslateX.value = PANEL_WIDTH * (1 - progress);
      }
    })
    .onEnd(() => {
      // Always close on release
      runOnJS(closePanel)();
    });

  // Slide the wider-than-screen list left to reveal timestamps
  const messagesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(PANEL_WIDTH - panelTranslateX.value) }],
  }));

  const {
    messages,
    isLoading,
    isSending,
    isFetchingMore,
    hasMore,
    otherLastReadAt,
    isOtherTyping,
    isOtherOnline,
    otherLastSeenAt: liveLastSeenAt,
    error,
    sendMessage,
    fetchMore,
    refresh,
    sendTyping,
  } = useMessages({
    conversationId,
    userId,
    otherUserId: conversation?.otherParticipant?.id,
    isAuthenticated,
    enabled: true,
  });

  // Extract display info from conversation
  const displayName = conversation?.partner
    ? conversation.partner.name
    : conversation?.otherParticipant?.name || 'User';
  const avatarUrl = conversation?.partner
    ? conversation.partner.logo
    : conversation?.otherParticipant?.avatarUrl;
  // Use live presence from useMessages (real-time via WS), fallback to conversation snapshot
  const isOnline = isOtherOnline ?? conversation?.otherParticipant?.isOnline ?? false;
  const lastSeenAt = liveLastSeenAt ?? conversation?.otherParticipant?.lastSeenAt;
  const listingTitle = conversation?.listing?.title;
  const otherUserAvatar = avatarUrl;
  const otherUserName = displayName;
  const myLastReadAt = conversation?.myLastReadAt;
  const myLastReadAtDate = myLastReadAt ? new Date(myLastReadAt) : null;
  
  // Track last marked message to prevent duplicate API calls
  const lastMarkedMsgIdRef = useRef<string | null>(null);

  // Find the newest message that was read by other user (for "seen" indicator)
  const lastReadMsgId = useMemo(() => {
    if (!otherLastReadAt) return null;
    for (const m of messages) {
      if (
        m.senderId === userId &&
        new Date(m.createdAt) <= new Date(otherLastReadAt)
      ) {
        return m.id;
      }
    }
    return null;
  }, [messages, otherLastReadAt, userId]);

  // Mark conversation as read when viewing messages from other user
  useEffect(() => {
    if (isLoading || messages.length === 0) return;

    // Find newest message from OTHER user
    const newestFromOther = messages.find(m => m.senderId !== userId);
    if (!newestFromOther) return;

    // Already marked this message?
    if (lastMarkedMsgIdRef.current === newestFromOther.id) return;

    // Check if we already read this message
    const messageTime = new Date(newestFromOther.createdAt).getTime();
    const alreadyRead = myLastReadAtDate && messageTime <= myLastReadAtDate.getTime();
    
    if (!alreadyRead) {
      lastMarkedMsgIdRef.current = newestFromOther.id;
      markConversationAsRead(conversationId).catch(() => {
        // Silent fail - mark as read is non-critical
      });
    }
  }, [isLoading, messages, userId, conversationId, myLastReadAtDate]);

  // Handle sending message
  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage(text);
      // Scroll to bottom after sending - use scrollToIndex to avoid keyboard issues
      setTimeout(() => {
        if (messages.length > 0) {
          listRef.current?.scrollToOffset({ offset: 0, animated: false });
        }
      }, 50);
    },
    [sendMessage, messages.length]
  );



  // Handle infinite scroll
  const handleEndReached = useCallback(() => {
    if (!isFetchingMore && hasMore) {
      fetchMore();
    }
  }, [isFetchingMore, hasMore, fetchMore]);

  // Format date label for separators
  const formatDateLabel = useCallback((date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Monday, Tuesday, etc.
    return format(date, 'MMM d, yyyy'); // Jan 5, 2026
  }, []);

  // Render message
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwn = item.senderId === userId;
      const prevMessage = messages[index + 1];
      const showAvatar =
        !isOwn &&
        (!prevMessage ||
          prevMessage.senderId !== item.senderId ||
          prevMessage.isSystemMessage);
      const showSeen = item.id === lastReadMsgId;

      // Show listing only on the first message
      const showListing =
        index === messages.length - 1 && conversation?.listing;

      // Check if we need to show a date separator (compare with NEXT message since list is inverted)
      const messageDate = new Date(item.createdAt);
      const nextMessage = messages[index + 1];
      const showDateSeparator = !nextMessage || !isSameDay(messageDate, new Date(nextMessage.createdAt));

      // Determine if this bubble gets a timestamp
      const hasTextBubble = !!item.text && !item.isSystemMessage;
      const showTimestamp = hasTextBubble && !(showSeen && isOwn);
      const timestamp = showTimestamp ? format(new Date(item.createdAt), 'h:mm a') : null;

      return (
        <>
          <View style={styles.messageRow}>
            <View style={styles.messageSide}>
              <MessageBubble
                message={item}
                isOwn={isOwn}
                showAvatar={showAvatar}
                showSeen={showSeen}
                otherUserAvatar={otherUserAvatar}
                otherUserName={otherUserName}
                listing={showListing && conversation?.listing ? conversation.listing : undefined}
              />
            </View>
            <View style={styles.timestampSide}>
              {timestamp && (
                <Supporting size="mini" style={{ color: colors.textTertiary, opacity: 0.5 }}>
                  {timestamp}
                </Supporting>
              )}
            </View>
          </View>
          {showDateSeparator && (
            <View style={styles.dateSeparator}>
              <Data size="mini" style={{ color: colors.textTertiary }}>
                {formatDateLabel(messageDate)}
              </Data>
            </View>
          )}
        </>
      );
    },
    [
      userId,
      messages,
      lastReadMsgId,
      conversation?.listing,
      otherUserAvatar,
      otherUserName,
      colors.border,
      colors.textTertiary,
      formatDateLabel,
    ]
  );



  // List header (bottom of messages - newest)
  const ListFooterComponent = useMemo(() => {
    if (isFetchingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.textTertiary} />
        </View>
      );
    }
    return null;
  }, [isFetchingMore, colors.textTertiary]);

  // Empty state
  const ListEmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Data size="medium" style={{ color: colors.textTertiary }}>No messages yet. Say hi! 👋</Data>
      </View>
    );
  }, [isLoading, colors]);

  // Typing indicator (Instagram-style bubble at bottom of messages)
  const ListHeaderComponent = useMemo(() => {
    if (!isOtherTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <View style={[styles.typingBubble, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, { backgroundColor: colors.textTertiary }]} />
            <Animated.View style={[styles.typingDot, { backgroundColor: colors.textTertiary, opacity: 0.7 }]} />
            <Animated.View style={[styles.typingDot, { backgroundColor: colors.textTertiary, opacity: 0.4 }]} />
          </View>
        </View>
      </View>
    );
  }, [isOtherTyping, colors.surfaceSecondary, colors.textTertiary]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <ChatHeader
        name={displayName}
        avatarUrl={avatarUrl}
        isOnline={isOnline}
        isTyping={isOtherTyping}
        lastSeenAt={lastSeenAt}
        listingTitle={listingTitle}
        onBack={onBack}
      />

      {/* Messages List with horizontal swipe for timestamps */}
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.messagesArea}>
          <Animated.View style={[styles.messagesWrapper, messagesAnimatedStyle]}>
            <FlatList
              ref={listRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              inverted
              contentContainerStyle={styles.messagesContent}
              ListEmptyComponent={ListEmptyComponent}
              ListHeaderComponent={ListHeaderComponent}
              ListFooterComponent={ListFooterComponent}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={sendTyping}
        disabled={false}
        resetKey={conversationId}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesArea: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  messagesWrapper: {
    width: SCREEN_WIDTH + PANEL_WIDTH,
  },
  messagesContent: {
    flexGrow: 1,
    paddingBottom: Spacing.md,
    paddingTop: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageSide: {
    width: SCREEN_WIDTH,
  },
  timestampSide: {
    width: PANEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  typingContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'flex-start',
  },
  typingBubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
