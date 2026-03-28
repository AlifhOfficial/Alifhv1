/**
 * Conversation Group - Clean native chat list row
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Sizes, Radius} from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Heading, Supporting, Text } from '@/components/ui';
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
  conversations,
  activeConversationId,
  onSelect,
  defaultExpanded = false,
}: ConversationGroupProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const isMulti = conversations.length > 1;
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || conversations.some((c) => c.id === activeConversationId)
  );
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const hasUnread = totalUnread > 0;
  const latest = conversations[0];

  const toggleExpanded = useCallback(() => setIsExpanded((p) => !p), []);

  const handlePress = useCallback(() => {
    if (isMulti) {
      toggleExpanded();
    } else {
      onSelect(conversations[0]);
    }
  }, [isMulti, toggleExpanded, onSelect, conversations]);

  return (
    <View>
      {/* Main row */}
      <HapticPressable
        onPress={handlePress}
        android_ripple={{ color: colors.surface2 }}
        style={styles.row}
      >
        {({ pressed }) => (
          <View style={[styles.rowInner, pressed && { opacity: 0.7 }]}>
            {/* Avatar with online dot */}
            <View style={styles.avatarWrap}>
              <UserAvatar src={avatarUrl} name={name} size="md" />
              {isOnline && (
                <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.bg }]} />
              )}
            </View>

            {/* Text content */}
            <View style={styles.content}>
              <View style={styles.topRow}>
                {/* Name: default tone = full weight; secondary = read/dimmer */}
                <Heading
                  size="subheading"
                  tone={hasUnread ? 'default' : 'secondary'}
                  style={styles.flex1}
                  numberOfLines={1}
                >
                  {name}
                </Heading>
                <Text variant="bodySm" tone="muted">
                  {formatTime(latest.lastMessageAt)}
                </Text>
              </View>
              <View style={styles.bottomRow}>
                <Supporting
                  size="bodySm"
                  tone={hasUnread ? 'secondary' : 'muted'}
                  style={styles.flex1}
                  numberOfLines={1}
                >
                  {latest.lastMessagePreview || 'No messages'}
                </Supporting>
                {totalUnread > 0 ? (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text variant="bodySm" style={{ color: colors.primaryFg }}>
                      {totalUnread > 99 ? '99+' : String(totalUnread)}
                    </Text>
                  </View>
                ) : isMulti ? (
                  <ChevronRight
                    size={Sizes.iconXs}
                    color={colors.text3}
                    strokeWidth={2}
                    style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                  />
                ) : null}
              </View>
            </View>
          </View>
        )}
      </HapticPressable>

      {/* Hairline separator indented past avatar */}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* Sub-items for multi-conversation groups */}
      {isMulti && isExpanded && (
        <View style={[styles.subList, { borderLeftColor: colors.border }]}>
          {conversations.map((c) => {
            const cUnread = c.unreadCount > 0;
            return (
              <HapticPressable
                key={c.id}
                onPress={() => onSelect(c)}
                android_ripple={{ color: colors.surface2 }}
                style={styles.subRow}
              >
                {({ pressed }) => (
                  <View style={[styles.subRowInner, pressed && { opacity: 0.7 }]}>
                    <View style={styles.topRow}>
                      <Supporting
                        size="body"
                        tone={cUnread ? 'default' : 'secondary'}
                        style={styles.flex1}
                        numberOfLines={1}
                      >
                        {c.listing?.title || 'General Inquiry'}
                      </Supporting>
                      <Text variant="bodySm" tone="muted">
                        {formatTime(c.lastMessageAt)}
                      </Text>
                    </View>
                    <View style={styles.bottomRow}>
                      <Supporting
                        size="bodySm"
                        tone={cUnread ? 'secondary' : 'muted'}
                        style={styles.flex1}
                        numberOfLines={1}
                      >
                        {c.lastMessagePreview || 'No messages'}
                      </Supporting>
                      {c.unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                          <Text variant="bodySm" style={{ color: colors.primaryFg }}>
                            {c.unreadCount > 99 ? '99+' : String(c.unreadCount)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </HapticPressable>
            );
          })}
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        </View>
      )}
    </View>
  );
}

const AVATAR_SIZE = Sizes.avatarMd; // 40
const ROW_H_PAD = Spacing.lg;       // 16
const ROW_GAP = Spacing.md;         // 12

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: ROW_H_PAD,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: ROW_GAP,
  },
  avatarWrap: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Spacing.md / 2,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  badge: {
    minWidth: Spacing.xl,
    height: Spacing.xl,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ROW_H_PAD + AVATAR_SIZE + ROW_GAP,
  },
  subList: {
    marginLeft: ROW_H_PAD + AVATAR_SIZE + ROW_GAP,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  subRow: {
    paddingLeft: Spacing.md,
    paddingRight: ROW_H_PAD,
  },
  subRowInner: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
});
