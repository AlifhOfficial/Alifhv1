/**
 * Chat Window - Mobile Native
 * Full conversation view with messages list, input, and real-time updates
 */

import { Text, Skeleton } from '@/components/ui';
import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Stack, useRouter } from 'expo-router';
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
import { useSearch } from '@/context/search-context';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { useMessages } from './hooks/useMessages';
import { useMarkAsRead } from '@/hooks/use-messaging-query';
import { markConversationActive, markConversationInactive } from './hooks/active-conversations';
import { UserAvatar } from '@/components/ui/user-avatar';
import { type Message, type Conversation } from '@/lib/messaging-api';
import {
  getLastReadOwnMessageId,
  getNewestUnreadIncomingMessageId,
} from '@alifh/shared';

const PANEL_WIDTH = Spacing['5xl'] + Spacing['3xl']; // ~80
const SCREEN_WIDTH = Dimensions.get('window').width;

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  conversation?: Conversation;
  isAuthenticated: boolean;
  locationRefreshToken?: string;
  onBack?: () => void;
}

export function ChatWindow({
  conversationId,
  userId,
  conversation,
  isAuthenticated,
  locationRefreshToken,
  onBack,
}: ChatWindowProps) {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);
  const hasUserScrolledForPaginationRef = useRef(false);

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
    isFetchingMore,
    hasMore,
    otherLastReadAt,
    isOtherTyping,
    isOtherOnline,
    otherLastSeenAt,
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
  // Presence is websocket-only to avoid cache flicker.
  const isOnline = isOtherOnline === true;
  const lastSeenAt = otherLastSeenAt;
  const listingTitle = conversation?.listing?.title;
  const otherUserAvatar = avatarUrl;
  const otherUserName = displayName;
  const myLastReadAt = conversation?.myLastReadAt;
  const myLastReadAtDate = useMemo(
    () => (myLastReadAt ? new Date(myLastReadAt) : null),
    [myLastReadAt]
  );
  const { markAsRead } = useMarkAsRead(userId);
  
  // Track last marked message to prevent duplicate API calls
  const lastMarkedMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    markConversationActive(conversationId);
    return () => markConversationInactive(conversationId);
  }, [conversationId]);

  useEffect(() => {
    lastMarkedMsgIdRef.current = null;
  }, [conversationId]);

  // Find the newest message that was read by other user (for "seen" indicator)
  const lastReadMsgId = useMemo(
    () => getLastReadOwnMessageId(messages, userId, otherLastReadAt),
    [messages, otherLastReadAt, userId]
  );

  const newestUnreadIncomingMessageId = useMemo(
    () => getNewestUnreadIncomingMessageId(messages, userId, myLastReadAtDate),
    [messages, userId, myLastReadAtDate]
  );

  // Mark conversation as read when viewing messages from other user
  useEffect(() => {
    if (isLoading || !newestUnreadIncomingMessageId) return;
    if (lastMarkedMsgIdRef.current === newestUnreadIncomingMessageId) return;
    // Mark immediately; message-id dedupe in this screen + hook prevents write spam.
    lastMarkedMsgIdRef.current = newestUnreadIncomingMessageId;
    markAsRead(conversationId, newestUnreadIncomingMessageId);
  }, [conversationId, isLoading, newestUnreadIncomingMessageId, markAsRead]);

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

  const handleOpenLocationSheet = useCallback(() => {
    router.push({
      pathname: '/chat/share-location',
      params: { conversationId },
    });
  }, [conversationId, router]);

  useEffect(() => {
    if (!locationRefreshToken) {
      return;
    }

    void refresh();
    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
  }, [locationRefreshToken, refresh]);

  // Handle infinite scroll
  const handleEndReached = useCallback(() => {
    // Prevent auto-pagination churn on mount/rerenders in inverted lists.
    if (!hasUserScrolledForPaginationRef.current) return;
    if (!isFetchingMore && hasMore) {
      fetchMore();
    }
  }, [isFetchingMore, hasMore, fetchMore]);

  const handleScrollBeginDrag = useCallback(() => {
    hasUserScrolledForPaginationRef.current = true;
  }, []);

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
      // Check next message (newer, visually below in inverted list) to show avatar at bottom of group
      const nextMessage = messages[index - 1];
      const showAvatar =
        !isOwn &&
        (!nextMessage ||
          nextMessage.senderId !== item.senderId ||
          nextMessage.isSystemMessage);
      const isGroupBreak =
        !nextMessage ||
        nextMessage.senderId !== item.senderId ||
        nextMessage.isSystemMessage ||
        item.isSystemMessage;
      const showSeen = item.id === lastReadMsgId;

      // Check if we need to show a date separator (compare with older message above in inverted list)
      const messageDate = new Date(item.createdAt);
      const prevMessage = messages[index + 1];
      const showDateSeparator = !prevMessage || !isSameDay(messageDate, new Date(prevMessage.createdAt));

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
                isGroupBreak={isGroupBreak}
                showAvatar={showAvatar}
                showSeen={showSeen}
                otherUserAvatar={otherUserAvatar}
                otherUserName={otherUserName}
              />
            </View>
            <View style={styles.timestampSide}>
              {timestamp && (
                <Text variant="caption2" tone="secondary">
                  {timestamp}
                </Text>
              )}
            </View>
          </View>
          {showDateSeparator && (
            <View style={styles.dateSeparator}>
              <Text variant="caption2Emphasized" tone="secondary">
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
      otherUserAvatar,
      otherUserName,
      formatDateLabel,
    ]
  );

  // List header (bottom of messages - newest)
  const ListFooterComponent = useMemo(() => {
    // Only show spinner when fetching more (not initial load)
    if (isFetchingMore && messages.length > 0) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.labelTertiary} />
        </View>
      );
    }
    return null;
  }, [isFetchingMore, messages.length, colors.labelTertiary]);

  // Empty state
  const ListEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyTextBlock}>
          <Text variant="headline" style={{ color: colors.label }}>
            No messages yet.
          </Text>
          <Text variant="subhead" tone="secondary" style={styles.emptySubtitle}>
            Say hi and start the conversation!
          </Text>
        </View>
      </View>
    );
  }, [colors.label]);

  // Typing indicator
  const ListHeaderComponent = useMemo(() => {
    if (!isOtherTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <Text variant="footnote" tone="secondary">
          typing...
        </Text>
      </View>
    );
  }, [isOtherTyping]);

  // Offline time text — null when online (green dot handles it)
  const offlineTimeText = useMemo((): string | null => {
    if (isOnline) return null;
    if (lastSeenAt) {
      const date = new Date(lastSeenAt);
      if (!isNaN(date.getTime())) {
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return null;
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    }
    return null;
  }, [isOnline, lastSeenAt]);

  const { applySearch, clearSearch, clearFilterParams } = useSearch();

  // Avatar + name + status as a single title node
  const titleNode = useMemo(() => {
    if (!conversation) {
      return (
        <View style={styles.headerTitleCol}>
          <Skeleton width={120} height={16} borderRadius={Radius.sm} />
          <Skeleton width={80} height={12} borderRadius={Radius.sm} />
        </View>
      );
    }
    return (
      <View style={styles.headerTitleCol}>
        <Text variant="headline" numberOfLines={1}>{displayName}</Text>
        {listingTitle && (
          <Text variant="subhead" tone="secondary" numberOfLines={1}>{listingTitle}</Text>
        )}
      </View>
    );
  }, [conversation, displayName, listingTitle]);

  // Avatar in right slot with online dot
  const avatarRight = useMemo(() => {
    const partnerId = conversation?.partner?.id ?? conversation?.partnerId ?? null;
    const partnerName = conversation?.partner?.name ?? null;
    const avatarEl = (
      <View style={styles.headerAvatarOuter}>
        <View style={styles.headerAvatarWrap}>
          {!conversation ? (
            <Skeleton circle width={Sizes.avatarMd} height={Sizes.avatarMd} />
          ) : (
            <UserAvatar src={avatarUrl} name={displayName} size="md" />
          )}
          {isOnline && conversation && (
            <View style={[styles.headerOnlineDot, { backgroundColor: colors.success, borderColor: colors.background }]} />
          )}
        </View>
        {offlineTimeText && conversation && (
          <Text variant="caption2" tone="secondary" numberOfLines={1}>{offlineTimeText}</Text>
        )}
      </View>
    );
    if (partnerId && partnerName) {
      return (
        <Pressable
          onPress={() => {
            clearSearch();
            clearFilterParams();
            applySearch({ partnerId, partnerName });
            router.push('/browse' as any);
          }}
        >
          {avatarEl}
        </Pressable>
      );
    }
    return avatarEl;
  }, [conversation, avatarUrl, displayName, isOnline, offlineTimeText, colors, router, applySearch, clearSearch, clearFilterParams]);

  const nativeHeaderOptions = {
    headerShown: false,
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...nativeHeaderOptions,
        }}
      />
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
    <MobileHeader
      title={titleNode}
      showBackButton
      onBackPress={onBack}
      right={avatarRight}
      fadeHeight={insets.top + Sizes.actionButtonLg + Spacing['5xl'] + Spacing['4xl']}
      fadeIntensity={0.35}
    />
      {/* Messages List with horizontal swipe for timestamps */}
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.messagesArea}>
          {isLoading ? (
            <View style={styles.skeletonContainer}>
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
                onScrollBeginDrag={handleScrollBeginDrag}
                contentContainerStyle={[
                  styles.messagesContent,
                  messages.length > 0
                    ? {
                        // In an inverted list, visual top spacing maps to paddingBottom.
                        paddingBottom: getMobileHeaderContentInset(insets.top),
                        paddingTop: Spacing.md,
                      }
                    : {
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingTop: Spacing['5xl'],
                        paddingBottom: Spacing['5xl'],
                      },
                ]}
                ListEmptyComponent={ListEmptyComponent}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.1}
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical
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
        initialText={
          !isLoading && messages.length === 0 && conversation?.listing
            ? `Hi ${displayName}, is the ${listingTitle || 'listing'} still available?`
            : undefined
        }
      />
    </KeyboardAvoidingView>
  </>
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyTextBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  skeletonContainer: {
    flex: 1,
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
  headerAvatarOuter: {
    alignItems: 'center',
    gap: 2,
  },
  headerAvatarWrap: {
    position: 'relative',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Spacing.md / 2,
    borderWidth: 2,
  },
  headerTitleCol: {
    alignItems: 'center',
    gap: 2,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerNameText: {
    flexShrink: 1,
  },
  headerNameBlock: {
    gap: 2,
  },
});
