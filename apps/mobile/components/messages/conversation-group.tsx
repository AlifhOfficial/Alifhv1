/**
 * Conversation Group - Native chat list row
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { HapticPressable } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/theme-context';
import { Colors, Layout, Spacing, Sizes, Radius, Timing } from '@/constants/theme';
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

const AVATAR_SIZE = Sizes.avatarMd;
const ROW_H_PAD = Layout.screenPadding;
const ROW_GAP = Spacing.md;
const INDENT = ROW_H_PAD + AVATAR_SIZE + ROW_GAP;

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
                <Heading
                  size="subheading"
                  tone={hasUnread ? 'default' : 'secondary'}
                  style={{ flex: 1 }}
                  numberOfLines={1}
                >
                  {name}
                </Heading>
                <Text variant="bodySm" tone="muted">
                  {formatTime(latest.lastMessageAt)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Supporting
                  size="bodySm"
                  tone={hasUnread ? 'secondary' : 'muted'}
                  style={{ flex: 1 }}
                  numberOfLines={1}
                >
                  {latest.lastMessagePreview || 'No messages'}
                </Supporting>
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
                      variant="bodySm"
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

      {/* Hairline separator indented past avatar */}
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          marginLeft: INDENT,
          backgroundColor: colors.border,
        }}
      />

      {/* Sub-items for multi-conversation groups */}
      {isMulti && isExpanded && (
        <Animated.View
          entering={FadeIn.duration(Timing.imageTransition)}
          exiting={FadeOut.duration(Timing.avatarTransition)}
          layout={LinearTransition}
          style={{
            marginLeft: INDENT,
            borderLeftWidth: StyleSheet.hairlineWidth,
            borderLeftColor: colors.border,
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
                  style={{ paddingLeft: Spacing.md, paddingRight: ROW_H_PAD }}
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
                        <Supporting
                          size="body"
                          tone={cUnread ? 'default' : 'secondary'}
                          style={{ flex: 1 }}
                          numberOfLines={1}
                        >
                          {c.listing?.title || 'General Inquiry'}
                        </Supporting>
                        <Text variant="bodySm" tone="muted">
                          {formatTime(c.lastMessageAt)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                        <Supporting
                          size="bodySm"
                          tone={cUnread ? 'secondary' : 'muted'}
                          style={{ flex: 1 }}
                          numberOfLines={1}
                        >
                          {c.lastMessagePreview || 'No messages'}
                        </Supporting>
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
                              variant="bodySm"
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
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        </Animated.View>
      )}
    </View>
  );
}
