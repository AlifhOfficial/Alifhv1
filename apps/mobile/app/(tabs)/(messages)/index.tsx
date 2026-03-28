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
import { MessageCircle } from 'lucide-react-native';

import {
  ConversationGroup,
  useConversations,
} from '@/components/messages';
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

// Header height calculation removed — native Stack header handles this

export default function MessagesScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

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

  // ── Empty / loading / error component for FlatList ──────────
  const renderEmpty = useCallback(() => {
    if (!isAuthenticated) {
      return (
        <AuthRequiredEmptyState
          title="Sign in to message"
          subtitle="Connect with buyers and sellers on Revvup"
        />
      );
    }

    if ((isLoading || isRefreshing) && conversations.length === 0) {
      return (
        <View style={styles.skeletonList}>
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

    if (error && conversations.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Data size="body" style={{ textAlign: 'center', color: colors.text2 }}>{error}</Data>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={[styles.iconCircle, { backgroundColor: colors.fill2 }]}>
          <MessageCircle size={Sizes.avatarSm} color={colors.text3} strokeWidth={1.5} />
        </View>
        <Heading size="heading">No Messages Yet</Heading>
        <Body size="body" tone="secondary" style={{ textAlign: 'center' }}>
          Your conversations will appear here
        </Body>
      </View>
    );
  }, [isAuthenticated, isLoading, isRefreshing, conversations.length, error, colors]);

  return (
    <FlatList
      data={listItems}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      contentContainerStyle={[
        styles.listContent,
        listItems.length === 0 && { flexGrow: 1 },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={renderEmpty}
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
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: Layout.tabBarHeight + Spacing['3xl'],
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
