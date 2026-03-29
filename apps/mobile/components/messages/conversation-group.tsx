/**
 * Conversation Group - Native chat list row
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/theme-context';
import { Colors, Layout, Spacing, Sizes, Radius, Timing } from '@/constants/theme';
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

const AVATAR_SIZE = Sizes.avatarMd;
const ROW_H_PAD = Layout.screenPadding;
const ROW_GAP = Spacing.md;
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

  const chevronRotation = useSharedValue(isExpanded ? 90 : 0);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  useEffect(() => {
    chevronRotation.value = withTiming(isExpanded ? 90 : 0, { duration: Timing.imageTransition });
  }, [isExpanded]);

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
        android_ripple={{ color: colors.surfaceSecondary }}
        style={{ paddingHorizontal: ROW_H_PAD }}
      >
        {({ pressed }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: Spacing.md,
              gap: ROW_GAP,
              opacity: pressed ? 0.7 : 1,
            }}
          >
            {/* Avatar with online dot */}
            <View style={{ position: 'relative' }}>
              <UserAvatar src={avatarUrl} name={name} size="md" />
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
            <View style={{ flex: 1, gap: Spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Text
                  variant="headline"
                  tone="default"
                  style={{ flex: 1 }}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text variant="subhead" tone="muted">
                  {formatTime(latest.lastMessageAt)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Text
                  variant="subhead"
                  tone={hasUnread ? 'secondary' : 'muted'}
                  style={{ flex: 1 }}
                  numberOfLines={1}
                >
                  {latest.lastMessagePreview || 'No messages'}
                </Text>
                {totalUnread > 0 ? (
                  <View
                    style={{
                      minWidth: Spacing.xl,
                      height: Spacing.xl,
                      borderRadius: Radius.md,
                      borderCurve: 'continuous',
                      paddingHorizontal: Spacing.xs,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary,
                    }}
                  >
                    <Text
                      variant="subhead"
                      style={{
                        color: colors.primaryForeground,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {totalUnread > 99 ? '99+' : String(totalUnread)}
                    </Text>
                  </View>
                ) : isMulti ? (
                  <Animated.View style={chevronStyle}>
                    <IconSymbol
                      name="chevron.right"
                      size={Sizes.iconXs}
                      color={colors.labelTertiary}
                    />
                  </Animated.View>
                ) : null}
              </View>
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
                        paddingVertical: Spacing.sm,
                        gap: Spacing.xs,
                        opacity: pressed ? 0.7 : 1,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                        <Text
                          variant="body"
                          tone={cUnread ? 'default' : 'secondary'}
                          style={{ flex: 1 }}
                          numberOfLines={1}
                        >
                          {c.listing?.title || 'General Inquiry'}
                        </Text>
                        <Text variant="subhead" tone="muted">
                          {formatTime(c.lastMessageAt)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                        <Text
                          variant="subhead"
                          tone={cUnread ? 'secondary' : 'muted'}
                          style={{ flex: 1 }}
                          numberOfLines={1}
                        >
                          {c.lastMessagePreview || 'No messages'}
                        </Text>
                        {c.unreadCount > 0 && (
                          <View
                            style={{
                              minWidth: Spacing.xl,
                              height: Spacing.xl,
                              borderRadius: Radius.md,
                              borderCurve: 'continuous',
                              paddingHorizontal: Spacing.xs,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: colors.primary,
                            }}
                          >
                            <Text
                              variant="subhead"
                              style={{
                                color: colors.primaryForeground,
                                fontVariant: ['tabular-nums'],
                              }}
                            >
                              {c.unreadCount > 99 ? '99+' : String(c.unreadCount)}
                            </Text>
                          </View>
                        )}
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
