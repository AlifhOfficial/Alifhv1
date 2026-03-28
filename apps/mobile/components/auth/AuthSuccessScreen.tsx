/**
 * Auth Success Screen
 * OLED black themed success confirmation with confetti
 */

import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { HapticPressable, ConfettiBurst, type ConfettiBurstRef } from '@/components/ui';
import { Heading, Body, ButtonText, Supporting } from '@/components/ui';
import { onboardingStyles, ONBOARDING_LAYOUT } from './onboarding-styles';

interface AuthSuccessScreenProps {
  userName?: string;
  onContinue: () => void;
  autoRedirectDelay?: number;
}

// Animated checkmark icon
function SuccessIcon({ color, size = ONBOARDING_LAYOUT.successIconSize }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="100%" stopColor={`${color}CC`} />
        </LinearGradient>
      </Defs>
      <Circle cx="32" cy="32" r="30" fill="url(#successGradient)" opacity={0.15} />
      <Circle cx="32" cy="32" r="24" stroke={color} strokeWidth={2} opacity={0.3} />
      <Path
        d="M22 32L28 38L42 24"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AuthSuccessScreen({
  userName,
  onContinue,
  autoRedirectDelay,
}: AuthSuccessScreenProps) {
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<ConfettiBurstRef>(null);

  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(-10);

  useEffect(() => {
    // Trigger confetti and icon animation
    const timer = setTimeout(() => {
      confettiRef.current?.fire();
    }, 400);

    iconScale.value = withDelay(
      200,
      withSpring(1, {
        damping: 12,
        stiffness: 180,
      })
    );

    iconRotation.value = withDelay(
      200,
      withSequence(
        withTiming(5, { duration: 150 }),
        withSpring(0, { damping: 10 })
      )
    );

    // Auto redirect if specified
    if (autoRedirectDelay) {
      const redirectTimer = setTimeout(onContinue, autoRedirectDelay);
      return () => {
        clearTimeout(timer);
        clearTimeout(redirectTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [autoRedirectDelay, onContinue]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userName?.split(' ')[0];

  return (
    <View style={[onboardingStyles.container, { backgroundColor: colors.black }]}>
      {/* Confetti */}
      <ConfettiBurst ref={confettiRef} />

      <View
        style={[
          onboardingStyles.content,
          { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
      >
        {/* Center Content */}
        <View style={onboardingStyles.centerContent}>
          {/* Animated success icon */}
          <Animated.View style={[onboardingStyles.iconContainer, iconAnimatedStyle]}>
            <SuccessIcon color={colors.success} size={ONBOARDING_LAYOUT.successIconSize} />
          </Animated.View>

          {/* Greeting */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Supporting
              size="bodySm"
              style={{ color: colors.primary, textAlign: 'center', marginBottom: Spacing.sm }}
            >
              {getGreeting()}
            </Supporting>
          </Animated.View>

          {/* Welcome message */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Heading size="title" style={[onboardingStyles.welcomeTitle, { color: colors.white }]}>
              {firstName ? `Welcome back, ${firstName}!` : "You're in!"}
            </Heading>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Body
              size="bodySm"
              style={[onboardingStyles.welcomeSubtitle, { color: colors.text2 }]}
            >
              Ready to find your next ride?
            </Body>
          </Animated.View>
        </View>

        {/* Continue Button */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)} style={onboardingStyles.buttonSection}>
          <HapticPressable
            onPress={onContinue}
            style={({ pressed }) => [
              onboardingStyles.continueButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <ButtonText style={{ color: colors.primaryFg }}>Let's Go</ButtonText>
          </HapticPressable>
        </Animated.View>
      </View>
    </View>
  );
}
