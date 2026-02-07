/**
 * Conversation Group - Always dropdown style
 * Avatar + Name + Dropdown -> Reveals chats
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
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
        style={({ pressed }) => [
          styles.header,
          { backgroundColor: pressed ? colors.surface : 'transparent' },
        ]}
      >
        <View style={styles.headerRow}>
          <UserAvatar src={avatarUrl} name={name} size="md" />
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          {isOnline && (
            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
          )}
          {totalUnread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{totalUnread}</Text>
            </View>
          )}
          <ChevronIcon size={18} color={colors.textTertiary} strokeWidth={2} />
        </View>
      </Pressable>

      {/* Dropdown: Nested conversations */}
      {isExpanded && (
        <View style={[styles.chatList, { borderLeftColor: colors.border }]}>
          {conversations.map((c, index) => {
            const hasUnread = c.unreadCount > 0;
            const isActive = c.id === activeConversationId;
            const isLast = index === conversations.length - 1;
            return (
              <Pressable
                key={c.id}
                onPress={() => onSelect(c)}
                style={({ pressed }) => [
                  styles.chatItem,
                  !isLast && [styles.chatItemBorder, { borderBottomColor: colors.separator }],
                  { backgroundColor: pressed || isActive ? colors.surface : 'transparent' },
                ]}
              >
                {/* Title + Time */}
                <View style={styles.chatRow}>
                  <Text
                    style={[
                      styles.chatTitle,
                      {
                        color: hasUnread ? colors.text : colors.textSecondary,
                        fontWeight: hasUnread ? '600' : '500',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {c.listing?.title || 'General Inquiry'}
                  </Text>
                  <Text style={[styles.chatTime, { color: colors.textTertiary }]}>
                    {formatTime(c.lastMessageAt)}
                  </Text>
                </View>
                {/* Preview + Unread */}
                <View style={styles.chatRow}>
                  <Text
                    style={[
                      styles.chatPreview,
                      {
                        color: hasUnread ? colors.textSecondary : colors.textTertiary,
                        fontWeight: hasUnread ? '500' : '400',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {c.lastMessagePreview || 'No messages'}
                  </Text>
                  {hasUnread && (
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  name: {
    flex: 1,
    fontSize: Typography.callout.fontSize,
    lineHeight: Typography.callout.lineHeight,
    fontWeight: '600',
    letterSpacing: Typography.callout.letterSpacing,
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
    paddingHorizontal: Spacing.xs,
  },
  unreadText: {
    fontSize: Typography.caption2.fontSize,
    lineHeight: Typography.caption2.lineHeight,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatList: {
    marginLeft: 52,
    marginRight: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    borderLeftWidth: 2,
    paddingLeft: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.lg,
  },
  chatItem: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  chatItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTitle: {
    flex: 1,
    fontSize: Typography.subhead.fontSize,
    lineHeight: Typography.subhead.lineHeight,
    letterSpacing: Typography.subhead.letterSpacing,
  },
  chatTime: {
    fontSize: Typography.caption1.fontSize,
    lineHeight: Typography.caption1.lineHeight,
    fontWeight: '400',
    marginLeft: Spacing.sm,
  },
  chatPreview: {
    flex: 1,
    fontSize: Typography.footnote.fontSize,
    lineHeight: Typography.footnote.lineHeight,
    letterSpacing: Typography.footnote.letterSpacing,
    marginTop: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
});
