/**
 * Auth Success Screen
 * Clean, minimal success confirmation with confetti
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/context/theme-context';
import { Colors, Typography } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = ['#0066FF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE', '#5856D6'];

interface AuthSuccessScreenProps {
  userName?: string;
  onContinue: () => void;
  autoRedirectDelay?: number;
}

export function AuthSuccessScreen({
  userName,
  onContinue,
  autoRedirectDelay,
}: AuthSuccessScreenProps) {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [showConfetti, setShowConfetti] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const iconScale = useSharedValue(0);
  const buttonScale = useSharedValue(0.95);

  const themeColors = Colors[colorScheme];
  const colors = {
    bg: themeColors.background,
    text: themeColors.text,
    textSecondary: themeColors.textSecondary,
    primary: themeColors.primary,
    success: themeColors.success,
  };

  useEffect(() => {
    iconScale.value = withDelay(150, withSpring(1, { damping: 12, stiffness: 180 }));
    buttonScale.value = withDelay(500, withSpring(1, { damping: 14, stiffness: 150 }));

    if (autoRedirectDelay) {
      const timer = setTimeout(handleContinue, autoRedirectDelay);
      return () => clearTimeout(timer);
    }
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    setShowConfetti(true);
    setIsExiting(true);
    
    // Wait for confetti to start, then exit
    // Don't fade out the screen to avoid showing white background
    setTimeout(() => {
      onContinue();
    }, 800);
  };

  const firstName = userName?.split(' ')[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Confetti Layer */}
      {showConfetti && <ConfettiExplosion />}
      
      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        {/* Centered Content */}
        <View style={styles.centerSection}>
          {/* Success Check */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.iconSection}>
            <Animated.View style={iconAnimatedStyle}>
              <CheckCircle2 size={80} color={colors.success} strokeWidth={1.5} />
            </Animated.View>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              {firstName ? `Welcome, ${firstName}` : "You're in"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {"Let's find your next car"}
            </Text>
          </Animated.View>
        </View>

        {/* Continue Button - Bottom Right */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.buttonSection}>
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleContinue}
              disabled={isExiting}
              style={({ pressed }) => [
                styles.continueButton,
                { backgroundColor: colors.primary, opacity: isExiting ? 0.7 : pressed ? 0.9 : 1 }
              ]}
            >
              <Text style={styles.continueButtonText}>Time to Revv</Text>
              <ArrowRightIcon />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

function ConfettiExplosion() {
  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }).map((_, index) => (
        <ConfettiPiece key={index} index={index} />
      ))}
    </View>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = SCREEN_WIDTH * 0.8; // Start from button area (bottom right)
  const startY = SCREEN_HEIGHT * 0.75;
  
  // Random end positions
  const endX = Math.random() * SCREEN_WIDTH;
  const endY = -100 - Math.random() * 200;
  const rotation = Math.random() * 720 - 360;
  const delay = Math.random() * 150;
  const duration = 800 + Math.random() * 400;
  
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
    translateX.value = withDelay(delay, withTiming(endX, { duration, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(endY, { duration, easing: Easing.out(Easing.quad) }));
    rotate.value = withDelay(delay, withTiming(rotation, { duration, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(delay + duration * 0.6, withTiming(0, { duration: duration * 0.4 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const size = 8 + Math.random() * 6;
  const isCircle = index % 3 === 0;

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          width: size,
          height: isCircle ? size : size * 1.5,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  confettiPiece: {
    position: 'absolute',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSection: {
    marginBottom: 32,
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    fontFamily: 'Inter_700Bold',
    letterSpacing: Typography.h2.letterSpacing,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonSection: {
    alignItems: 'flex-end',
    paddingBottom: 40,
  },
  continueButton: {
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.body.fontSize,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: Typography.body.letterSpacing,
  },
});
