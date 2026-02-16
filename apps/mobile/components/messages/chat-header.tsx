/**
 * Chat Header - Mobile Native
 * Header for chat screen with back button, avatar, name, activity status
 * Matches home-header absolute positioning, glass styles, and horizontal scroll
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Circle } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Sizes, Layout } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Data } from '@/components/ui';

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  isTyping?: boolean;
  lastSeenAt?: Date | string | null;
  listingTitle?: string;
  onBack?: () => void;
}

export function ChatHeader({
  name,
  avatarUrl,
  isOnline = false,
  isTyping = false,
  lastSeenAt,
  listingTitle,
  onBack,
}: ChatHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Format last seen
  const getStatusText = () => {
    if (isTyping) return 'typing...';
    if (isOnline) return 'Active now';
    if (lastSeenAt) {
      const date = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
      if (!isNaN(date.getTime())) {
        return `Active ${formatDistanceToNow(date, { addSuffix: false })} ago`;
      }
    }
    return null;
  };

  const statusText = getStatusText();

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
        {/* Back Button - Glass bubble */}
        <View
          style={[
            styles.iconButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          <HapticPressable
            onPress={handleBack}
            style={styles.iconButtonInner}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.7 : 1 }}>
                <ArrowLeft size={Sizes.iconSm} color={colors.icon} strokeWidth={2} />
              </View>
            )}
          </HapticPressable>
        </View>

        {/* Avatar Bubble */}
        <View
          style={[
            styles.avatarBubble,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          <UserAvatar src={avatarUrl} name={name} size="sm" />
        </View>

        {/* Name Pill */}
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
          <Data size="small">{name}</Data>
        </View>

        {/* Status Pill */}
        {statusText && (
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
            <View style={styles.pillContent}>
              <Circle
                size={6}
                fill={isTyping ? colors.primary : (isOnline ? colors.success : colors.textTertiary)}
                color={isTyping ? colors.primary : (isOnline ? colors.success : colors.textTertiary)}
              />
              <Data
                size="small"
                style={{
                  color: isTyping ? colors.primary : (isOnline ? colors.success : colors.textTertiary),
                }}
              >
                {statusText}
              </Data>
            </View>
          </View>
        )}

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
  iconButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBubble: {
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
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
