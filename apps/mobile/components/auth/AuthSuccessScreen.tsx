/**
 * Auth Success Screen
 * Clean, minimal success confirmation with confetti using design system tokens
 */

import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { Heading, Body, ButtonText } from '@/components/ui';
import { authStyles } from './auth-styles';
import { ArrowRightIcon } from './icons';

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
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [showConfetti, setShowConfetti] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const iconScale = useSharedValue(0);
  const buttonScale = useSharedValue(0.95);

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
    setTimeout(() => {
      onContinue();
    }, 800);
  };

  const firstName = userName?.split(' ')[0];

  return (
    <View style={[authStyles.container, { backgroundColor: colors.background }]}>
      {/* Confetti Layer */}
      {showConfetti && <ConfettiExplosion />}
      
      <View style={[
        authStyles.content, 
        { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }
      ]}>
        {/* Centered Content */}
        <View style={authStyles.centerSection}>
          {/* Success Check */}
          <Animated.View entering={FadeIn.duration(300)} style={authStyles.iconSection}>
            <Animated.View style={iconAnimatedStyle}>
              <CheckCircle2 size={80} color={colors.success} strokeWidth={1.5} />
            </Animated.View>
          </Animated.View>

          {/* Title */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(400)} 
            style={[authStyles.titleSection, { alignItems: 'center' }]}
          >
            <Heading size="large" style={{ textAlign: 'center' }}>
              {firstName ? `Welcome, ${firstName}` : "You're in"}
            </Heading>
            <Body size="large" tone="secondary" style={authStyles.subtitle}>
              {"Let's find your next car"}
            </Body>
          </Animated.View>
        </View>

        {/* Continue Button - Bottom Right */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={authStyles.buttonSection}>
          <Animated.View style={buttonAnimatedStyle}>
            <HapticPressable
              onPress={handleContinue}
              disabled={isExiting}
              style={({ pressed }) => [
                authStyles.continueButton,
                { backgroundColor: colors.primary, opacity: isExiting ? 0.7 : pressed ? 0.9 : 1 }
              ]}
            >
              <ButtonText style={{ color: colors.primaryForeground }}>Time to Revv</ButtonText>
              <ArrowRightIcon color={colors.primaryForeground} />
            </HapticPressable>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

function ConfettiExplosion() {
  return (
    <View style={authStyles.confettiContainer} pointerEvents="none">
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
        authStyles.confettiPiece,
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
