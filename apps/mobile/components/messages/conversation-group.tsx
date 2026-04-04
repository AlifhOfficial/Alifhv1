/**
 * Conversation Group - Native chat list row
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useTheme } from '@/context/theme-context';
import { Layout, Spacing, Sizes, Radius, Timing, Stroke } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
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

const AVATAR_SIZE = Sizes.avatarLg;
const ROW_H_PAD = Layout.screenPadding;
const ROW_GAP = Spacing.md;
const ROW_V_PAD = Spacing.md;
const SUB_ROW_V_PAD = Spacing.sm;
const UNREAD_BADGE_SIZE = Sizes.bubbleXs;
const META_MIN_WIDTH = Sizes.bubbleMd;

export function ConversationGroup({
  name,
  avatarUrl,
  isOnline = false,
  conversations,
  activeConversationId,
  onSelect,
  defaultExpanded = false,
}: ConversationGroupProps) {
  const { colors } = useTheme();

  const isMulti = conversations.length > 1;
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || conversations.some((c) => c.id === activeConversationId)
  );
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const hasUnread = totalUnread > 0;
  const latest = conversations[0];

  const handlePress = useCallback(() => {
    // Always select the most recent conversation
    onSelect(latest);
    
    // Also expand the group if it's multi-conversation
    if (isMulti && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isMulti, isExpanded, onSelect, latest]);

  return (
    <View>
      {/* Main row */}
      <HapticPressable
        onPress={handlePress}
        android_ripple={{ color: colors.surfaceSecondary }}
        style={{ paddingHorizontal: ROW_H_PAD }}
      >
        {({ pressed }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: ROW_V_PAD,
              gap: ROW_GAP,
              opacity: pressed ? 0.7 : 1,
            }}
          >
            {/* Avatar with online dot */}
            <View style={{ position: 'relative' }}>
              <UserAvatar src={avatarUrl} name={name} size="lg" />
              {totalUnread > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -Spacing.xs / 2,
                    right: -Spacing.xs / 2,
                    width: UNREAD_BADGE_SIZE,
                    height: UNREAD_BADGE_SIZE,
                    borderRadius: Radius.full,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.favorite,
                    borderWidth: 2,
                    borderColor: colors.background,
                  }}
                >
                  <Text
                    variant="caption2Emphasized"
                    style={{
                      color: colors.primaryForeground,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {totalUnread > 99 ? '99' : String(totalUnread)}
                  </Text>
                </View>
              )}
              {isOnline && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 1,
                    right: 1,
                    width: Spacing.md,
                    height: Spacing.md,
                    borderRadius: Spacing.md / 2,
                    borderWidth: 2,
                    backgroundColor: colors.success,
                    borderColor: colors.background,
                  }}
                />
              )}
            </View>

            {/* Text content */}
            <View style={{ flex: 1, gap: Spacing.xs, minWidth: 0 }}>
              <Text
                variant="subheadEmphasized"
                tone="default"
                numberOfLines={1}
              >
                {name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minWidth: 0 }}>
                <Text
                  variant="subhead"
                  tone={hasUnread ? 'secondary' : 'muted'}
                  style={{ flex: 1 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {latest.lastMessagePreview || 'No messages'}
                </Text>
              </View>
            </View>

            <View
              style={{
                minWidth: META_MIN_WIDTH,
                paddingLeft: Spacing.xs,
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: Spacing.xs,
                flexShrink: 0,
              }}
            >
              {isMulti ? (
                <View
                  style={{
                    width: UNREAD_BADGE_SIZE,
                    height: UNREAD_BADGE_SIZE,
                    borderRadius: Radius.full,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Plus
                    size={Sizes.iconXs}
                    color={colors.labelTertiary}
                    strokeWidth={Stroke.icon}
                  />
                </View>
              ) : null}
              <Text variant="footnote" tone="secondary">
                {formatTime(latest.lastMessageAt)}
              </Text>
            </View>
          </View>
        )}
      </HapticPressable>
      {/* Sub-items for multi-conversation groups */}
      {isMulti && isExpanded && (
        <Animated.View
          entering={FadeIn.duration(Timing.imageTransition)}
          exiting={FadeOut.duration(Timing.avatarTransition)}
          layout={LinearTransition}
          style={{
            marginLeft: ROW_H_PAD + AVATAR_SIZE / 2,
            borderLeftWidth: 1,
            borderLeftColor: colors.separator,
          }}
        >
          {conversations.map((c, i) => {
            const cUnread = c.unreadCount > 0;
            return (
              <Animated.View
                key={c.id}
                entering={FadeIn.duration(Timing.imageTransition).delay(i * 40)}
                layout={LinearTransition}
              >
                <HapticPressable
                  onPress={() => onSelect(c)}
                  android_ripple={{ color: colors.surfaceSecondary }}
                  style={{ paddingLeft: AVATAR_SIZE / 2 + ROW_GAP, paddingRight: ROW_H_PAD }}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        paddingVertical: SUB_ROW_V_PAD,
                        gap: Spacing.xs,
                        opacity: pressed ? 0.7 : 1,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                        <View style={{ flex: 1, gap: Spacing.xs, minWidth: 0 }}>
                          <Text
                            variant="subheadEmphasized"
                            tone={cUnread ? 'default' : 'secondary'}
                            numberOfLines={1}
                          >
                            {c.listing?.title || 'General Inquiry'}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minWidth: 0 }}>
                            {c.unreadCount > 0 && (
                              <View
                                style={{
                                  width: UNREAD_BADGE_SIZE,
                                  height: UNREAD_BADGE_SIZE,
                                  borderRadius: Radius.full,
                                  borderCurve: 'continuous',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: colors.favorite,
                                }}
                              >
                                <Text
                                  variant="caption2Emphasized"
                                  style={{
                                    color: colors.primaryForeground,
                                    fontVariant: ['tabular-nums'],
                                  }}
                                >
                                  {c.unreadCount > 99 ? '99' : String(c.unreadCount)}
                                </Text>
                              </View>
                            )}
                            <Text
                              variant="subhead"
                              tone={cUnread ? 'secondary' : 'muted'}
                              style={{ flex: 1 }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {c.lastMessagePreview || 'No messages'}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            minWidth: META_MIN_WIDTH,
                            paddingLeft: Spacing.xs,
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            gap: Spacing.xs,
                            flexShrink: 0,
                          }}
                        >
                          <Text variant="footnote" tone="secondary">
                            {formatTime(c.lastMessageAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </HapticPressable>
              </Animated.View>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}
