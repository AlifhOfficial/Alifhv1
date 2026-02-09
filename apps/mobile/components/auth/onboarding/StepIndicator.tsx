/**
 * Step Indicator Component
 * Minimal progress indicator for onboarding flow
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { OnboardingStep } from './types';

// Steps that show in the indicator (excluding intro and complete)
const INDICATOR_STEPS: OnboardingStep[] = ['name', 'email', 'password'];

interface StepIndicatorProps {
  currentStep: OnboardingStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const currentIndex = INDICATOR_STEPS.indexOf(currentStep);

  return (
    <View style={styles.container}>
      {INDICATOR_STEPS.map((step, index) => (
        <StepDot 
          key={step} 
          isActive={index <= currentIndex} 
          isCurrent={index === currentIndex}
          colors={colors}
        />
      ))}
    </View>
  );
}

interface StepDotProps {
  isActive: boolean;
  isCurrent: boolean;
  colors: typeof Colors.light;
}

function StepDot({ isActive, isCurrent, colors }: StepDotProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isCurrent ? 24 : 8, { damping: 15, stiffness: 200 }),
    backgroundColor: isActive ? colors.primary : colors.border,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
