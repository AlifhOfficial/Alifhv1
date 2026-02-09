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
        style={styles.header}
        android_ripple={{ color: colors.surfacePressed }}
      >
        {({ pressed }) => (
          <View style={[styles.headerRow, pressed && { opacity: 0.7 }]}>
            <UserAvatar src={avatarUrl} name={name} size="md" />
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            {isOnline && (
              <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
            )}
            {totalUnread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                <Text style={[styles.unreadText, { color: '#FFFFFF' }]}>{totalUnread}</Text>
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
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.value,
    flex: 1,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  unreadBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  chatList: {
    marginLeft: Spacing.lg + 40 + Spacing.sm,
    marginRight: Spacing.lg,
    borderLeftWidth: 1,
    paddingLeft: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  chatItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTitle: {
    flex: 1,
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
  },
  chatTime: {
    ...Typography.helper,
    marginLeft: Spacing.sm,
  },
  chatPreview: {
    flex: 1,
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
});
