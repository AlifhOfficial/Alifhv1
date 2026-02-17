/**
 * Chat Header - Mobile Native
 * Header for chat screen with back button, avatar, name, activity status
 * Matches home-header absolute positioning, glass styles, and horizontal scroll
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Sizes, Layout, Radius } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Data } from '@/components/ui';
import { Moon } from 'lucide-react-native';

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  isTyping?: boolean;
  lastSeenAt?: Date | string | null;
  listingTitle?: string;
  isLoading?: boolean;
}

export function ChatHeader({
  name,
  avatarUrl,
  isOnline = false,
  isTyping = false,
  lastSeenAt,
  listingTitle,
  isLoading = false,
}: ChatHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // Format activity timestamp
  const getActivityText = () => {
    if (isTyping) return 'typing...';
    if (isOnline) return 'now';
    if (lastSeenAt) {
      const date = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
      if (!isNaN(date.getTime())) {
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    }
    return 'offline';
  };

  const activityText = getActivityText();
  const isActive = isOnline || isTyping || activityText === 'now';

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Layout.headerPadding },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Avatar Bubble */}
        <View
          style={[
            styles.bubble,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          {isLoading ? (
            <Skeleton circle width={Sizes.avatarSm} height={Sizes.avatarSm} />
          ) : (
            <UserAvatar src={avatarUrl} name={name} size="sm" />
          )}
        </View>

        {/* Name Pill */}
        <View
          style={[
            styles.pillButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
              minWidth: isLoading ? Spacing['5xl'] * 2 : undefined,
            },
          ]}
        >
          {isLoading ? (
            <Skeleton width={Spacing['4xl'] * 2} height={Sizes.iconSm} borderRadius={Radius.sm} />
          ) : (
            <Data size="small">{name}</Data>
          )}
        </View>

        {/* Activity Pill - Moon icon + timestamp */}
        <View
          style={[
            styles.activityPill,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          {isLoading ? (
            <Skeleton width={Spacing['3xl']} height={Sizes.iconSm} borderRadius={Radius.sm} />
          ) : (
            <>
              <Moon
                size={12}
                color={isActive ? colors.activityActive : colors.activityInactive}
                fill={isActive ? colors.activityActive : colors.activityInactive}
                strokeWidth={1.5}
              />
              <Data size="mini" style={{ color: colors.textSecondary }}>
                {activityText}
              </Data>
            </>
          )}
        </View>

        {/* Listing Title Pill */}
        {listingTitle && (
          <View
            style={[
              styles.pillButton,
              styles.glass,
              {
                borderColor: colors.glassBorder,
                backgroundColor: colors.glassBackground,
              },
            ]}
          >
            <Data size="small" style={{ color: colors.textSecondary }}>
              Re: {listingTitle}
            </Data>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
  },
  glass: {
    borderWidth: 1,
  },
  bubble: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButton: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Sizes.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityPill: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.sm,
    borderRadius: Sizes.pillRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
});
