/**
 * Revvup Loader Component
 * Clean, minimal loaders using branded typography
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { Colors, Typography } from '@/constants/theme';

// Main Loader component - uses branded typography
export function Loader({ message, fullScreen = false }: { message?: string; fullScreen?: boolean }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (fullScreen) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#E8E8E8' }]}>
        <View style={styles.brandContainer}>
          <Animated.Text 
            style={[
              styles.brandName, 
              { color: isDark ? '#6B6B6B' : '#6B6B6B' },
              animatedStyle
            ]}
          >
            Revvup
          </Animated.Text>
        </View>
        {message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <Animated.Text 
        style={[
          styles.brandNameSmall, 
          { color: colors.textSecondary },
          animatedStyle
        ]}
      >
        Revvup
      </Animated.Text>
      {message && (
        <Text style={[styles.inlineMessage, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

/**
 * Simple spinner loader for inline use
 */
export function SpinnerLoader({ size = 40, color }: { size?: number; color?: string }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const spinnerColor = color || colors.primary;

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const borderWidth = Math.max(2, size / 10);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: borderWidth,
          borderColor: `${spinnerColor}30`,
          borderTopColor: spinnerColor,
          borderRightColor: spinnerColor,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Logo-only loader (smaller, for inline use) - Typography based
 */
export function LogoLoader({ size = 32 }: { size?: number }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text 
      style={[
        { 
          fontSize: size, 
          fontFamily: 'Inter_800ExtraBold', 
          letterSpacing: -1,
          color: colors.textSecondary,
        }, 
        animatedStyle
      ]}
    >
      Revvup
    </Animated.Text>
  );
}

/**
 * Refresh indicator (for pull-to-refresh) - Typography based
 */
export function RefreshLoader({ size = 24, isRefreshing = false }: { size?: number; isRefreshing?: boolean }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (isRefreshing) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [isRefreshing]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.refreshContainer}>
      <Animated.Text 
        style={[
          { 
            fontSize: size, 
            fontFamily: 'Inter_800ExtraBold', 
            letterSpacing: -0.5,
            color: colors.textSecondary,
          }, 
          animatedStyle
        ]}
      >
        Revvup
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 64,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -3,
  },
  brandNameSmall: {
    fontSize: 48,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -2,
  },
  message: {
    marginTop: 16,
    ...Typography.labelSmall,
    textTransform: 'uppercase',
  },
  inlineMessage: {
    marginTop: 12,
    ...Typography.helper,
  },
  refreshContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
