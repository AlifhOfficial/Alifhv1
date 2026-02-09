/**
 * Chat Window - Mobile Native
 * Full conversation view with messages list, input, and real-time updates
 */

import React, { useMemo, useRef, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { ChatHeader } from './chat-header';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { useMessages } from './hooks/useMessages';
import type { Message, Conversation } from '@/lib/messaging-api';

const PANEL_WIDTH = 80;

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
  const timestampListRef = useRef<FlatList<Message>>(null);

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

  // Animated styles for panel
  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panelTranslateX.value }],
  }));

  const messagesAnimatedStyle = useAnimatedStyle(() => ({
    marginRight: PANEL_WIDTH - panelTranslateX.value,
  }));

  const {
    messages,
    isLoading,
    isSending,
    isFetchingMore,
    hasMore,
    otherLastReadAt,
    error,
    sendMessage,
    fetchMore,
    refresh,
  } = useMessages({
    conversationId,
    userId,
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
  const isOnline = conversation?.otherParticipant?.isOnline ?? false;
  const lastSeenAt = conversation?.otherParticipant?.lastSeenAt;
  const listingTitle = conversation?.listing?.title;
  const otherUserAvatar = avatarUrl;
  const otherUserName = displayName;

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

  // Sync scroll between messages and timestamps
  const handleScroll = useCallback((event: any) => {
    if (timestampListRef.current) {
      timestampListRef.current.scrollToOffset({
        offset: event.nativeEvent.contentOffset.y,
        animated: false,
      });
    }
  }, []);

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

      return (
        <>
          <MessageBubble
            message={item}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showSeen={showSeen}
            otherUserAvatar={otherUserAvatar}
            otherUserName={otherUserName}
            listing={showListing && conversation?.listing ? conversation.listing : undefined}
          />
          {showDateSeparator && (
            <View style={styles.dateSeparator}>
              <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>
                {formatDateLabel(messageDate)}
              </Text>
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

  // Render timestamp row (for the panel)
  const renderTimestamp = useCallback(
    ({ item }: { item: Message }) => {
      const timestamp = format(new Date(item.createdAt), 'h:mm a');
      return (
        <View style={styles.timestampRow}>
          <Text style={[styles.timestampText, { color: colors.textTertiary }]}>
            {timestamp}
          </Text>
        </View>
      );
    },
    [colors.textTertiary]
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
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No messages yet. Say hi! 👋
        </Text>
      </View>
    );
  }, [isLoading, colors]);

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
              ListFooterComponent={ListFooterComponent}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="none"
              keyboardShouldPersistTaps="always"
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          </Animated.View>

          {/* Timestamp Panel - slides in from right */}
          <Animated.View 
            style={[
              styles.timestampPanel, 
              { backgroundColor: colors.background },
              panelAnimatedStyle
            ]}
          >
            <FlatList
              ref={timestampListRef}
              data={messages}
              renderItem={renderTimestamp}
              keyExtractor={(item) => `ts-${item.id}`}
              inverted
              contentContainerStyle={styles.timestampContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
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
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingBottom: Spacing.md,
    paddingTop: 12,
  },
  timestampPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
  },
  timestampContent: {
    paddingBottom: Spacing.md,
    paddingTop: 12,
  },
  timestampRow: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    paddingHorizontal: Spacing.xs,
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dateLabel: {
    fontSize: Typography.helper.fontSize,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyText: {
    ...Typography.body,
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
