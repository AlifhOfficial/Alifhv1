/**
 * Conversation Group - Always dropdown style
 * Avatar + Name + Dropdown -> Reveals chats
 */

import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Heading, Data, Body, Supporting, Label } from '@/components/ui';
import type { Conversation } from '@/lib/messaging-api';

interface ConversationGroupProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversation: Conversation) => void;
  defaultExpanded?: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ConversationGroup({
  name,
  avatarUrl,
  isOnline = false,
  conversations,
  activeConversationId,
  onSelect,
  defaultExpanded = false,
}: ConversationGroupProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || conversations.some((c) => c.id === activeConversationId)
  );
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const toggleExpanded = useCallback(() => setIsExpanded((p) => !p), []);
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <View>
      {/* Header Row: [Avatar] [Name] [Badge?] [Chevron] */}
      <Pressable
        onPress={toggleExpanded}
        style={styles.header}
        android_ripple={{ color: colors.surfacePressed }}
      >
        {({ pressed }) => (
          <View style={[styles.headerRow, pressed && { opacity: 0.7 }]}>
            <UserAvatar src={avatarUrl} name={name} size="md" />
            <Heading size="small" style={{ flex: 1 }} numberOfLines={1}>{name}</Heading>
            {isOnline && (
              <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
            )}
            {totalUnread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                <Label size="small" uppercase={false} style={{ color: '#FFFFFF' }}>
                  {totalUnread}
                </Label>
              </View>
            )}
            <ChevronIcon size={18} color={colors.textTertiary} strokeWidth={2} />
          </View>
        )}
      </Pressable>

      {/* Dropdown: Nested conversations */}
      {isExpanded && (
        <View style={[styles.chatList, { borderLeftColor: colors.border }]}>
          {conversations.map((c) => {
            const hasUnread = c.unreadCount > 0;
            const isActive = c.id === activeConversationId;
            return (
              <Pressable
                key={c.id}
                onPress={() => onSelect(c)}
                style={({ pressed }) => [
                  styles.chatItem,
                  { backgroundColor: pressed || isActive ? colors.surface : 'transparent' },
                ]}
              >
                {/* Title + Time */}
                <View style={styles.chatRow}>
                  <Data 
                    size="large" 
                    tone={hasUnread ? 'default' : 'secondary'}
                    style={{ flex: 1 }}
                    numberOfLines={1}
                  >
                    {c.listing?.title || 'General Inquiry'}
                  </Data>
                  <Supporting size="medium" tone="muted" style={{ marginLeft: Spacing.sm }}>
                    {formatTime(c.lastMessageAt)}
                  </Supporting>
                </View>
                {/* Preview + Unread */}
                <View style={styles.chatRow}>
                  <Body 
                    size="small" 
                    tone={hasUnread ? 'secondary' : 'muted'}
                    style={{ flex: 1, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {c.lastMessagePreview || 'No messages'}
                  </Body>
                  {hasUnread && (
                    <View style={[styles.dot, { backgroundColor: colors.error }]} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  chatList: {
    marginLeft: Spacing.lg + 40 + Spacing.md,
    marginRight: Spacing.lg,
    borderLeftWidth: 1,
    paddingLeft: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  chatItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
});
