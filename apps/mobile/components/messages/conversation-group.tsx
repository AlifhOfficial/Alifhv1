/**
 * Conversation Group - Always dropdown style
 * Avatar + Name + Dropdown -> Reveals chats
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ChevronDown, ChevronUp, Moon } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Sizes, Fonts } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Data, Supporting } from '@/components/ui';
import type { Conversation } from '@/lib/messaging-api';

interface ConversationGroupProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
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
  lastSeenAt,
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
    <View style={styles.container}>
      {/* Header Row: [Avatar] [Name] [Badge?] [Chevron] */}
      <HapticPressable
        onPress={toggleExpanded}
        style={styles.header}
        android_ripple={{ color: colors.surfacePressed }}
      >
        {({ pressed }) => (
          <View style={[styles.headerRow, pressed && { opacity: 0.7 }]}>
            <View style={[styles.avatarBubble, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
              <UserAvatar src={avatarUrl} name={name} size="md" />
              {totalUnread > 0 && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary, borderColor: colors.background }]} />
              )}
            </View>
            <Data size="large" style={{ flex: 1, color: colors.text }} numberOfLines={1}>
              {name}
            </Data>
            {/* Activity Pill - Moon + timestamp (glass style) */}
            {(() => {
              const activityText = isOnline ? 'now' : lastSeenAt ? formatTime(lastSeenAt) : 'offline';
              const isActive = isOnline || activityText === 'now';
              return (
                <View style={[styles.activityPill, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
                  <Moon
                    size={12}
                    color={isActive ? colors.activityActive : colors.activityInactive}
                    fill={isActive ? colors.activityActive : colors.activityInactive}
                    strokeWidth={1.5}
                  />
                  <Data size="mini" style={{ color: colors.textSecondary }}>
                    {activityText}
                  </Data>
                </View>
              );
            })()}
            <View style={[styles.bubble, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
              <ChevronIcon size={Sizes.iconXs} color={colors.textSecondary} strokeWidth={2.5} />
            </View>
          </View>
        )}
      </HapticPressable>

      {/* Dropdown: Nested conversations */}
      {isExpanded && (
        <View style={[styles.chatList, { borderLeftColor: colors.glassBorder }]}>
          {conversations.map((c) => {
            const hasUnread = c.unreadCount > 0;
            const isActive = c.id === activeConversationId;
            return (
              <HapticPressable
                key={c.id}
                onPress={() => onSelect(c)}
                style={[
                  styles.chatItem,
                  isActive && { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder },
                ]}
              >
                {/* Title + Time */}
                <View style={styles.chatRow}>
                  <Data 
                    size="medium" 
                    style={{ 
                      flex: 1, 
                      color: hasUnread ? colors.text : colors.textSecondary,
                      fontFamily: hasUnread ? Fonts.semiBold : Fonts.medium,
                    }}
                    numberOfLines={1}
                  >
                    {c.listing?.title || 'General Inquiry'}
                  </Data>
                  <Data size="mini" style={{ color: colors.textTertiary, marginLeft: Spacing.sm }}>
                    {formatTime(c.lastMessageAt)}
                  </Data>
                </View>
                {/* Preview + Unread */}
                <View style={styles.chatRow}>
                  <Supporting 
                    size="small"
                    style={{ 
                      flex: 1, 
                      marginTop: Spacing.xs,
                      color: hasUnread ? colors.textSecondary : colors.textTertiary,
                    }}
                    numberOfLines={1}
                  >
                    {c.lastMessagePreview || 'No messages'}
                  </Supporting>
                  {hasUnread && (
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </HapticPressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  header: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarBubble: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  bubble: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityPill: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.sm,
    borderRadius: Sizes.pillRadius,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  chatList: {
    marginLeft: Spacing.lg + Sizes.avatarMd + Spacing.md,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
});
