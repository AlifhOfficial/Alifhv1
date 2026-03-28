/**
 * Offline Banner - Shows when network is unavailable
 * Slides down from top, shows reconnection state
 */

import React, { useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff, RefreshCw } from 'lucide-react-native';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useNetwork } from '@/context/network-context';
import { Body, Supporting } from '@/components/ui/text';

export function OfflineBanner() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { isOnline, isReconnecting, retry, lastOnlineAt } = useNetwork();

  const translateY = useSharedValue(-100);
  const spinValue = useSharedValue(0);

  // Animate in/out based on online status
  useEffect(() => {
    if (!isOnline) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
    }
  }, [isOnline, translateY]);

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

  // Format time since last online
  const getOfflineDuration = () => {
    if (!lastOnlineAt) return null;
    const diff = Date.now() - lastOnlineAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const offlineDuration = getOfflineDuration();

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: colors.error,
          paddingTop: insets.top + Spacing.xs,
        },
        animatedStyle,
      ]}
    >
      <WifiOff size={Sizes.iconSm} color="#fff" strokeWidth={2} />
      <Body size="bodySm" style={styles.text}>
        {isReconnecting ? 'Reconnecting...' : 'No internet connection'}
      </Body>
      {offlineDuration && !isReconnecting && (
        <Supporting size="bodySm" style={styles.duration}>
          Last online {offlineDuration}
        </Supporting>
      )}
      <Pressable onPress={retry} style={styles.retryButton} hitSlop={12}>
        <Animated.View style={spinStyle}>
          <RefreshCw size={Spacing.lg} color="#fff" strokeWidth={2.5} />
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
    zIndex: 9999,
  },
  text: {
    color: '#fff',
  },
  duration: {
    color: 'rgba(255,255,255,0.75)',
  },
  retryButton: {
    marginLeft: 'auto',
    padding: Spacing.xs,
  },
});
