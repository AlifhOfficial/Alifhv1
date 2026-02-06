/**
 * Revvup Loader Component
 * Animated loading screen with logo pulse and fade effects
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO_SIZE = 120;

interface LoaderProps {
  /** Optional loading text */
  message?: string;
  /** Whether to show the loading dots */
  showDots?: boolean;
  /** Full screen or inline loader */
  fullScreen?: boolean;
}

export function Loader({ 
  message = 'Loading', 
  showDots = true,
  fullScreen = true 
}: LoaderProps) {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Animation values
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0.7);
  const glowOpacity = useSharedValue(0.3);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    // Logo pulse animation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    logoOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Animated dots
    const dotDuration = 400;
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: dotDuration }),
        withTiming(0.3, { duration: dotDuration * 2 })
      ),
      -1,
      false
    );

    dot2Opacity.value = withDelay(
      dotDuration,
      withRepeat(
        withSequence(
          withTiming(1, { duration: dotDuration }),
          withTiming(0.3, { duration: dotDuration * 2 })
        ),
        -1,
        false
      )
    );

    dot3Opacity.value = withDelay(
      dotDuration * 2,
      withRepeat(
        withSequence(
          withTiming(1, { duration: dotDuration }),
          withTiming(0.3, { duration: dotDuration * 2 })
        ),
        -1,
        false
      )
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  const containerStyle = fullScreen 
    ? [styles.fullScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]
    : styles.inline;

  return (
    <View style={[containerStyle, { backgroundColor: colors.background }]}>
      {/* Background gradient for full screen */}
      {fullScreen && (
        <LinearGradient
          colors={isDark 
            ? ['#0D0D0D', '#0D0D0D', '#0a1628'] 
            : ['#FAFAFA', '#FAFAFA', '#E6F0FF']
          }
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      )}

      {/* Glow effect behind logo */}
      <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
        <View style={[styles.glow, { backgroundColor: colors.primary }]} />
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image
          source={isDark 
            ? require('@/assets/logo/favicon-light.png')
            : require('@/assets/logo/favicon-dark.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Loading text with dots */}
      {message && (
        <View style={styles.textContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {message}
          </Text>
          {showDots && (
            <View style={styles.dotsContainer}>
              <Animated.Text style={[styles.dot, { color: colors.primary }, dot1Style]}>
                •
              </Animated.Text>
              <Animated.Text style={[styles.dot, { color: colors.primary }, dot2Style]}>
                •
              </Animated.Text>
              <Animated.Text style={[styles.dot, { color: colors.primary }, dot3Style]}>
                •
              </Animated.Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Simple spinner loader for inline use
 */
export function SpinnerLoader({ size = 40, color }: { size?: number; color?: string }) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const spinnerColor = color || colors.primary;

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinner, { width: size, height: size }, animatedStyle]}>
      <View style={[styles.spinnerArc, { 
        borderColor: spinnerColor,
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size / 10,
      }]} />
    </Animated.View>
  );
}

/**
 * Logo-only loader (smaller, for inline use)
 */
export function LogoLoader({ size = 60 }: { size?: number }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={isDark 
          ? require('@/assets/logo/favicon-light.png')
          : require('@/assets/logo/favicon-dark.png')
        }
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  glowContainer: {
    position: 'absolute',
    width: LOGO_SIZE * 2,
    height: LOGO_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: LOGO_SIZE * 1.5,
    height: LOGO_SIZE * 1.5,
    borderRadius: LOGO_SIZE,
    opacity: 0.15,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerArc: {
    borderStyle: 'solid',
  },
});
