/**
 * Messages Tab Screen - Revvup Mobile
 * 
 * Matches web app structure:
 * - Groups conversations by partner (dealerships) or user
 * - Single conversations render flat
 * - Multiple conversations with same partner/user render as collapsible groups
 */

import React, { useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';

import {
  MessagesHeader,
  ConversationGroup,
  useConversations,
} from '@/components/messages';
import { TopSafeAreaGradient } from '@/components/layout';
import { Colors, Layout, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Heading, Body, Data, Skeleton, SkeletonCircle, AuthRequiredEmptyState } from '@/components/ui';
import type { Conversation } from '@/lib/messaging-api';

// ── List Item Type - Always grouped ─────────────────────────────
type ListItem = {
  key: string;
  name: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
  conversations: Conversation[];
};

// Header height calculation: headerPadding + pill height + bottom padding
const HEADER_HEIGHT = Layout.headerPadding + Sizes.pillHeight + Spacing.md;

export default function MessagesScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Dynamic top padding based on safe area + header
  const contentTopPadding = insets.top + HEADER_HEIGHT + Spacing.md;

  const {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refresh,
    pullToRefresh,
    markAsRead,
  } = useConversations({
    isAuthenticated,
    userId: user?.id,
    scope: 'personal',
  });

  // Re-fetch conversations when this tab regains focus (not initial mount)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return; // Skip — initial useEffect in hook already loads
      }
      if (isAuthenticated) {
        refresh();
      }
    }, [isAuthenticated, refresh])
  );

  // ── Build grouped list (matching web app logic) ─────────
  const listItems = useMemo<ListItem[]>(() => {
    // Filter out empty conversations
    const validConversations = conversations.filter((c) => c.messageCount > 0);

    // Group by partner
    const partnerMap = new Map<
      string,
      { partner: NonNullable<Conversation['partner']>; conversations: Conversation[] }
    >();
    // Group by user (for non-partner convos)
    const userMap = new Map<
      string,
      { user: NonNullable<Conversation['otherParticipant']>; conversations: Conversation[] }
    >();

    for (const conv of validConversations) {
      if (conv.partnerId && conv.partner) {
        // Partner conversation
        const existing = partnerMap.get(conv.partnerId);
        if (existing) {
          existing.conversations.push(conv);
        } else {
          partnerMap.set(conv.partnerId, {
            partner: conv.partner,
            conversations: [conv],
          });
        }
      } else if (conv.otherParticipant) {
        // User conversation
        const userId = conv.otherParticipant.id;
        const existing = userMap.get(userId);
        if (existing) {
          existing.conversations.push(conv);
        } else {
          userMap.set(userId, {
            user: conv.otherParticipant,
            conversations: [conv],
          });
        }
      }
    }

    // Build list items - always as groups
    const items: ListItem[] = [];

    // Derive live presence from conversations — WS updates flow into otherParticipant
    const derivePresence = (convs: Conversation[]) => {
      // Any conversation's otherParticipant being online means this person is online
      let isOnline = false;
      let latestSeenAt: string | null = null;
      for (const c of convs) {
        if (c.otherParticipant?.isOnline) isOnline = true;
        const seen = c.otherParticipant?.lastSeenAt;
        if (seen && (!latestSeenAt || seen > latestSeenAt)) latestSeenAt = seen;
      }
      return { isOnline, lastSeenAt: latestSeenAt };
    };

    // Process partner groups
    for (const [partnerId, { partner, conversations: convs }] of partnerMap) {
      convs.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      const presence = derivePresence(convs);
      items.push({
        key: `partner-${partnerId}`,
        name: partner.name,
        avatarUrl: partner.logo,
        isOnline: presence.isOnline,
        lastSeenAt: presence.lastSeenAt,
        conversations: convs,
      });
    }

    // Process user groups
    for (const [userId, { user, conversations: convs }] of userMap) {
      convs.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      const presence = derivePresence(convs);
      items.push({
        key: `user-${userId}`,
        name: user.name || 'User',
        avatarUrl: user.avatarUrl,
        isOnline: presence.isOnline,
        lastSeenAt: presence.lastSeenAt,
        conversations: convs,
      });
    }

    // Sort by most recent
    items.sort((a, b) => {
      const getLatest = (item: ListItem) =>
        Math.max(...item.conversations.map((c) => new Date(c.lastMessageAt).getTime()));
      return getLatest(b) - getLatest(a);
    });

    return items;
  }, [conversations]);

  // ── Select conversation ─────────────────────────
  const handleSelect = useCallback(
    async (conversation: Conversation) => {
      // Pass conversation data via params to avoid re-fetching
      router.push({
        pathname: '/chat/[conversationId]',
        params: { 
          conversationId: conversation.id,
          conversationData: JSON.stringify(conversation),
        },
      });
      if (conversation.unreadCount > 0) {
        await markAsRead(conversation.id);
      }
    },
    [router, markAsRead]
  );

  // ── Render list item ─────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => (
      <ConversationGroup
        name={item.name}
        avatarUrl={item.avatarUrl}
        isOnline={item.isOnline}
        lastSeenAt={item.lastSeenAt}
        conversations={item.conversations}
        onSelect={handleSelect}
      />
    ),
    [handleSelect]
  );

  // ── Single layout — header is always mounted once ──────────
  const renderContent = () => {
    // Not authenticated
    if (!isAuthenticated) {
      return (
        <AuthRequiredEmptyState
          title="Sign in to message"
          subtitle="Connect with buyers and sellers on Revvup"
        />
      );
    }

    // Still loading for the first time (no data yet, not a refresh)
    if ((isLoading || isRefreshing) && conversations.length === 0) {
      return (
        <View style={[styles.skeletonList, { paddingTop: contentTopPadding }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <SkeletonCircle size={Sizes.avatarLg} />
              <View style={styles.skeletonRowContent}>
                <View style={styles.skeletonRowTop}>
                  <Skeleton width={120} height={14} />
                  <Skeleton width={40} height={12} />
                </View>
                <Skeleton width={200} height={12} />
              </View>
            </View>
          ))}
        </View>
      );
    }

    // Error (only if we have nothing to show)
    if (error && conversations.length === 0) {
      return (
        <View style={[styles.emptyState, { paddingTop: contentTopPadding }]}>
          <Data size="medium" style={{ textAlign: 'center', color: colors.text2 }}>{error}</Data>
        </View>
      );
    }

    // Always render the FlatList — it handles empty + populated states.
    // This avoids swapping between FlatList and empty-state Views which
    // causes the layout flash. ListEmptyComponent fills the gap when there
    // are no conversations yet.
    return (
      <FlatList
        style={{ flex: 1 }}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          {
            paddingTop: contentTopPadding,
            paddingHorizontal: Spacing.sm,
            paddingBottom: insets.bottom + Layout.tabBarHeight,
          },
          // When list is empty, fill the screen so the empty component centres
          listItems.length === 0 && { flexGrow: 1 },
        ]}
        ListEmptyComponent={
          !isLoading && !isRefreshing ? (
            <View style={styles.emptyState}>
              <View style={[styles.iconCircle, { backgroundColor: colors.fill2 }]}>
                <MessageCircle size={Sizes.avatarSm} color={colors.text3} strokeWidth={1.5} />
              </View>
              <Heading size="medium">No Messages Yet</Heading>
              <Body size="medium" tone="secondary" style={{ textAlign: 'center' }}>
                Your conversations will appear here
              </Body>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={pullToRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <TopSafeAreaGradient />
      <MessagesHeader />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonList: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skeletonRowContent: {
    flex: 1,
    gap: Spacing.sm - 2,
  },
  skeletonRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['5xl'],
    gap: Spacing.sm,
  },
  iconCircle: {
    width: Sizes.avatarLg + Spacing.lg,
    height: Sizes.avatarLg + Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
});
