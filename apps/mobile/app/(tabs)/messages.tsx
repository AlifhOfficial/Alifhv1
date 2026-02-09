/**
 * Messages Tab Screen - Revvup Mobile
 * 
 * Matches web app structure:
 * - Groups conversations by partner (dealerships) or user
 * - Single conversations render flat
 * - Multiple conversations with same partner/user render as collapsible groups
 */

import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';

import {
  MessagesHeader,
  ConversationGroup,
  useConversations,
} from '@/components/messages';
import { Colors, Layout, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import type { Conversation } from '@/lib/messaging-api';

// ── List Item Type - Always grouped ─────────────────────────────
type ListItem = {
  key: string;
  name: string;
  avatarUrl: string | null;
  isOnline: boolean;
  conversations: Conversation[];
};

export default function MessagesScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, openAuthFlow } = useAuth();

  const {
    conversations,
    totalUnread,
    isLoading,
    isRefreshing,
    error,
    refresh,
    markAsRead,
  } = useConversations({
    isAuthenticated,
    scope: 'personal',
  });

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

    // Process partner groups
    for (const [partnerId, { partner, conversations: convs }] of partnerMap) {
      convs.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      items.push({
        key: `partner-${partnerId}`,
        name: partner.name,
        avatarUrl: partner.logo,
        isOnline: false,
        conversations: convs,
      });
    }

    // Process user groups
    for (const [userId, { user, conversations: convs }] of userMap) {
      convs.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      items.push({
        key: `user-${userId}`,
        name: user.name || 'User',
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline || false,
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
      router.push(`/chat/${conversation.id}`);
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
        conversations={item.conversations}
        onSelect={handleSelect}
      />
    ),
    [handleSelect]
  );

  // ── Not authenticated ─────────────────────────
  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <MessagesHeader />
        <View style={styles.emptyState}>
          <View style={[styles.iconCircle, { backgroundColor: colors.fillSecondary }]}>
            <MessageCircle size={32} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Sign In to Message
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
            Connect with buyers and sellers on Revvup
          </Text>
          <Text
            style={[styles.actionLink, { color: colors.primary }]}
            onPress={openAuthFlow}
          >
            Sign In
          </Text>
        </View>
      </View>
    );
  }

  // ── Loading ───────────────────────────────────
  if (isLoading && conversations.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <MessagesHeader />
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  // ── Error ─────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <MessagesHeader />
        <View style={styles.emptyState}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      </View>
    );
  }

  // ── Empty ─────────────────────────────────────
  if (listItems.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <MessagesHeader />
        <View style={styles.emptyState}>
          <View style={[styles.iconCircle, { backgroundColor: colors.fillSecondary }]}>
            <MessageCircle size={32} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Messages Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
            Your conversations will appear here
          </Text>
        </View>
      </View>
    );
  }

  // ── Conversation list ─────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <MessagesHeader />
      <FlatList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Layout.tabBarHeight,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['5xl'],
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.headingLarge,
  },
  emptySubtitle: {
    ...Typography.supportingSmall,
    textAlign: 'center',
  },
  actionLink: {
    ...Typography.buttonMedium,
    marginTop: Spacing.sm,
  },
  errorText: {
    ...Typography.supportingSmall,
    textAlign: 'center',
  },
});
