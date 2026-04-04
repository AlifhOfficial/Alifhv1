/**
 * Offline Banner - Shows when network is unavailable
 * Slides down from top, shows reconnection state
 */

import { Text } from './text';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff, RefreshCw } from 'lucide-react-native';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useNetwork } from '@/context/network-context';

export function OfflineBanner() {
  // Dev-only UI preview toggle.
  const FORCE_SHOW_IN_DEV = false;

  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { isOnline, isReconnecting, retry, lastOnlineAt } = useNetwork();
  const [nowTs, setNowTs] = useState(() => Date.now());
  const shouldShowBanner = (__DEV__ && FORCE_SHOW_IN_DEV) || !isOnline;
  const hiddenTranslateY = -(insets.top + Sizes.actionButtonLg + Spacing['4xl']);

  const translateY = useSharedValue(hiddenTranslateY);
  const spinValue = useSharedValue(0);

  // Animate in/out based on online status
  useEffect(() => {
    if (shouldShowBanner) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    } else {
      translateY.value = withTiming(hiddenTranslateY, { duration: 300 });
    }
  }, [hiddenTranslateY, shouldShowBanner, translateY]);

  // Spin animation for reconnecting
  useEffect(() => {
    if (isReconnecting) {
      spinValue.value = withTiming(spinValue.value + 360, { duration: 1000 });
    }
  }, [isReconnecting, spinValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));

  useEffect(() => {
    if (!lastOnlineAt || !shouldShowBanner) return;
    const interval = setInterval(() => {
      setNowTs(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, [lastOnlineAt, shouldShowBanner]);

  // Format time since last online
  const getOfflineDuration = (currentTs: number) => {
    if (!lastOnlineAt) return null;
    const diff = currentTs - lastOnlineAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const offlineDuration = getOfflineDuration(nowTs);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.xs,
          backgroundColor: colors.surfaceSecondary,
          borderBottomColor: colors.outline,
        },
        animatedStyle,
      ]}
    >
      <WifiOff size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={2} />
      <Text variant="subhead" style={[styles.text, { color: colors.label }]}>
        {isReconnecting ? 'Reconnecting...' : 'No internet connection'}
      </Text>
      {offlineDuration && !isReconnecting && (
        <Text variant="subhead" style={[styles.duration, { color: colors.labelSecondary }]}>
          Last online {offlineDuration}
        </Text>
      )}
      <Pressable
        onPress={retry}
        style={styles.retryButton}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Retry internet connection"
      >
        <Animated.View style={spinStyle}>
          <RefreshCw size={Spacing.lg} color={colors.label} strokeWidth={2.2} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 9999,
  },
  text: {
    flexShrink: 1,
  },
  duration: {},
  retryButton: {
    marginLeft: 'auto',
    padding: Spacing.xs,
  },
});
