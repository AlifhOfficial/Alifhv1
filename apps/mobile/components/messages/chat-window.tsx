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
  Dimensions,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
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
import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { ChatHeader } from './chat-header';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { LocationPickerSheet } from './location-picker-sheet';
import { useMessages } from './hooks/useMessages';
import { Body, Data, Supporting, Skeleton } from '@/components/ui';
import { TopSafeAreaGradient } from '@/components/layout';
import { markConversationAsRead, sendLocationMessage, type Message, type Conversation } from '@/lib/messaging-api';
import type { LocationResult } from '@/hooks/use-location';

const PANEL_WIDTH = Spacing['5xl'] + Spacing['3xl']; // ~80
const SCREEN_WIDTH = Dimensions.get('window').width;

// Header height calculation: headerPadding + pill height + bottom padding
const HEADER_HEIGHT = Layout.headerPadding + Sizes.pillHeight + Spacing.md;

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
    otherLastSeenAt,
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
    initialLastSeenAt: conversation?.otherParticipant?.lastSeenAt,
  });

  // Extract display info from conversation
  const displayName = conversation?.partner
    ? conversation.partner.name
    : conversation?.otherParticipant?.name || 'User';
  const avatarUrl = conversation?.partner
    ? conversation.partner.logo
    : conversation?.otherParticipant?.avatarUrl;
  // Use live presence from useMessages (real-time via WS, initialized from DB)
  const isOnline = isOtherOnline ?? conversation?.otherParticipant?.isOnline ?? false;
  // otherLastSeenAt is now initialized from DB in useMessages, WS updates override
  const lastSeenAt = otherLastSeenAt;
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

  // Location sharing with confirmation sheet
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const handleOpenLocationSheet = useCallback(() => {
    setIsLocationSheetOpen(true);
  }, []);

  const handleConfirmLocation = useCallback(async (location: LocationResult) => {
    try {
      await sendLocationMessage(conversationId, location);
      // Use refresh to get the new message from server
      refresh();
      // Scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 50);
    } catch (err) {
      console.error('[ChatWindow] Failed to send location:', err);
      throw err; // Re-throw so sheet knows it failed
    }
  }, [conversationId, refresh]);

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
    // Only show spinner when fetching more (not initial load)
    if (isFetchingMore && messages.length > 0) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.textTertiary} />
        </View>
      );
    }
    return null;
  }, [isFetchingMore, messages.length, colors.textTertiary]);

  // Empty state
  const ListEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyContainer}>
        <Data size="medium" style={{ color: colors.textTertiary }}>No messages yet. Say hi! 👋</Data>
      </View>
    );
  }, [colors]);

  // Typing indicator
  const ListHeaderComponent = useMemo(() => {
    if (!isOtherTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <Supporting size="small" style={{ color: colors.textTertiary }}>
          typing...
        </Supporting>
      </View>
    );
  }, [isOtherTyping, colors.textTertiary]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Top safe area gradient */}
      <TopSafeAreaGradient />

      {/* Header */}
      <ChatHeader
        name={displayName}
        avatarUrl={avatarUrl}
        isOnline={isOnline}
        isTyping={isOtherTyping}
        lastSeenAt={lastSeenAt}
        listingTitle={listingTitle}
        isLoading={!conversation}
      />

      {/* Messages List with horizontal swipe for timestamps */}
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.messagesArea}>
          {isLoading ? (
            <View style={[styles.skeletonContainer, { paddingTop: insets.top + HEADER_HEIGHT }]}>
              {/* Simulate a chat thread with alternating left/right skeleton bubbles */}
              {[...Array(12)].map((_, i) => {
                const isRight = i % 3 !== 0;
                // Vary widths using token combinations
                const widths = [
                  Spacing['5xl'] * 3,      // 144
                  Spacing['5xl'] * 4,      // 192
                  Spacing['4xl'] * 3,      // 120
                  Spacing['5xl'] * 4.5,    // 216
                  Spacing['4xl'] * 4,      // 160
                  Spacing['3xl'] * 3,      // 96
                  Spacing['5xl'] * 3.5,    // 168
                  Spacing['4xl'] * 3.5,    // 140
                ];
                const bubbleWidth = widths[i % widths.length];
                return (
                  <View
                    key={i}
                    style={[
                      styles.skeletonRow,
                      isRight ? styles.skeletonRowRight : styles.skeletonRowLeft,
                    ]}
                  >
                    {!isRight && (
                      <Skeleton circle width={Sizes.iconXl} height={Sizes.iconXl} style={{ marginRight: Spacing.sm }} />
                    )}
                    <Skeleton
                      width={bubbleWidth}
                      height={Sizes.bubble}
                      borderRadius={Radius.xl}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <Animated.View style={[styles.messagesWrapper, messagesAnimatedStyle]}>
              <FlatList
                ref={listRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                inverted
                contentContainerStyle={[
                  styles.messagesContent,
                  { 
                    paddingBottom: insets.top + HEADER_HEIGHT,
                    paddingTop: Spacing.md,
                  },
                ]}
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
          )}
        </View>
      </GestureDetector>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={sendTyping}
        onRequestLocation={handleOpenLocationSheet}
        disabled={false}
        resetKey={conversationId}
      />

      {/* Location Picker Sheet */}
      <LocationPickerSheet
        visible={isLocationSheetOpen}
        onClose={() => setIsLocationSheetOpen(false)}
        onConfirm={handleConfirmLocation}
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
    paddingTop: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageSide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: Layout.screenPadding,
  },
  timestampSide: {
    width: PANEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSeparator: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  skeletonContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  skeletonRowLeft: {
    justifyContent: 'flex-start',
  },
  skeletonRowRight: {
    justifyContent: 'flex-end',
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  typingContainer: {
    paddingHorizontal: Layout.screenPadding + Sizes.iconXl + Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
