/**
 * Support Section Component
 * Help and feedback links - matches Profile styling
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { HelpCircle, MessageCircle, ChevronRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/constants/theme';
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

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0,0,0,${bgOpacity.value * 0.03})`,
  }));

  return (
    <Pressable
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
          <Icon size={18} color={colors.textSecondary} strokeWidth={1.5} />
          <View style={styles.itemContent}>
            <Text style={[styles.label, { color: colors.textTertiary }]}>Navigate</Text>
            <Text style={[styles.value, { color: colors.text }]}>{label}</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
      </Animated.View>
    </Pressable>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemContent: {
    gap: 2,
  },
  label: {
    fontSize: Typography.caption1.fontSize,
    lineHeight: Typography.caption1.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    letterSpacing: Typography.caption1.letterSpacing,
  },
  value: {
    fontSize: Typography.callout.fontSize,
    lineHeight: Typography.callout.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.callout.fontWeight as any,
    letterSpacing: Typography.callout.letterSpacing,
  },
});
