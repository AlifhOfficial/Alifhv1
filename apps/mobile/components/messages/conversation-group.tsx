/**
 * Conversation Group - Always dropdown style
 * Avatar + Name + Dropdown -> Reveals chats
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Data, Supporting, Label } from '@/components/ui';
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
      <HapticPressable
        onPress={toggleExpanded}
        style={styles.header}
        android_ripple={{ color: colors.surfacePressed }}
      >
        {({ pressed }) => (
          <View style={[styles.headerRow, pressed && { opacity: 0.7 }]}>
            <View>
              <UserAvatar src={avatarUrl} name={name} size="md" />
              {isOnline && (
                <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.background }]} />
              )}
            </View>
            <Data size="large" style={{ flex: 1, color: colors.text, fontWeight: '600' }} numberOfLines={1}>
              {name}
            </Data>
            {totalUnread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Label size="badge" uppercase={false} style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  {totalUnread}
                </Label>
              </View>
            )}
            <ChevronIcon size={16} color={colors.textTertiary} strokeWidth={2} />
          </View>
        )}
      </HapticPressable>

      {/* Dropdown: Nested conversations */}
      {isExpanded && (
        <View style={[styles.chatList, { borderLeftColor: colors.border }]}>
          {conversations.map((c) => {
            const hasUnread = c.unreadCount > 0;
            const isActive = c.id === activeConversationId;
            return (
              <HapticPressable
                key={c.id}
                onPress={() => onSelect(c)}
                style={[
                  styles.chatItem,
                  { backgroundColor: isActive ? colors.surface : 'transparent' },
                ]}
              >
                {/* Title + Time */}
                <View style={styles.chatRow}>
                  <Data 
                    size="medium" 
                    style={{ 
                      flex: 1, 
                      color: hasUnread ? colors.text : colors.textSecondary,
                      fontWeight: hasUnread ? '600' : '400',
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
                      marginTop: 2,
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
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
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
