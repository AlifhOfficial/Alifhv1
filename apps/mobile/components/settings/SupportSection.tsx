/**
 * Support Section Component
 * Help and feedback links - matches Profile styling
 */

import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HelpCircle, MessageCircle, ChevronRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Sizes, Spacing } from '@/constants/theme';
import { Section } from './Section';
import type { ThemeColors } from './types';

interface SupportSectionProps {
  colors: ThemeColors;
  onHelpPress: () => void;
  onFeedbackPress: () => void;
  delay?: number;
}

function SupportItem({
  icon: Icon,
  label,
  onPress,
  colors,
  isLast,
}: {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  isLast?: boolean;
}) {
  const bgOpacity = useSharedValue(0);

  const handlePressIn = () => {
    bgOpacity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    bgOpacity.value = withTiming(0, { duration: 200 });
  };

  const animatedBgStyle = useAnimatedStyle(() => {
    // Prevent tiny floats from serializing into scientific notation causing Reanimated crashes
    const alpha = Math.max(0, bgOpacity.value * 0.03).toFixed(4);
    return {
      backgroundColor: `rgba(0,0,0,${alpha})`,
    };
  });

  return (
    <HapticPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.item,
          animatedBgStyle,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.itemLeft}>
          <Icon size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={1.5} />
          <View style={styles.itemContent}>
            <Text variant="bodySm" tone="muted">Navigate</Text>
            <Text variant="body">{label}</Text>
          </View>
        </View>
        <ChevronRight size={Sizes.iconSm} color={colors.labelTertiary} strokeWidth={2} />
      </Animated.View>
    </HapticPressable>
  );
}

export function SupportSection({
  colors,
  onHelpPress,
  onFeedbackPress,
  delay = 250,
}: SupportSectionProps) {
  return (
    <Section title="Support" colors={colors} delay={delay}>
      <SupportItem
        icon={HelpCircle}
        label="Help & Support"
        onPress={onHelpPress}
        colors={colors}
      />
      <SupportItem
        icon={MessageCircle}
        label="Send Feedback"
        onPress={onFeedbackPress}
        colors={colors}
        isLast
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  itemContent: {
    gap: Spacing.xs,
  },
});
