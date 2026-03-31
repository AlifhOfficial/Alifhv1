/**
 * Seller Actions (CTA Section)
 * 
 * Chat, Book Viewing, and Phone actions in list style.
 * Follows profile/settings component patterns for consistency.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Calendar1, ChevronRight, MessageCircle, Phone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { SellerActionsProps } from './types';

interface ActionItemProps {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  isLast?: boolean;
}

function ActionItem({ icon: Icon, label, onPress, isLoading, isLast }: ActionItemProps) {
  const { colors } = useTheme();
  const bgOpacity = useSharedValue(0);

  const handlePressIn = () => {
    bgOpacity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    bgOpacity.value = withTiming(0, { duration: 200 });
  };

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(bgOpacity.value, [0, 1], ['transparent', colors.fill]),
  }));

  return (
    <HapticPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
    >
      <Animated.View
        style={[
          styles.item,
          animatedBgStyle,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.itemLeft}>
          <Icon size={Sizes.iconSm} color={colors.primary} strokeWidth={Stroke.icon} />
          <Text variant="subhead">{label}</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.labelTertiary} />
        ) : (
          <ChevronRight size={Sizes.iconSm} color={colors.labelTertiary} strokeWidth={Stroke.icon} />
        )}
      </Animated.View>
    </HapticPressable>
  );
}

export const SellerActions = memo(function SellerActions({
  seller,
  isChatLoading,
  onChat,
  onBookViewing,
  onShowPhone,
}: Omit<SellerActionsProps, 'colors'>) {
  const { colors } = useTheme();

  const handleChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChat();
  }, [onChat]);

  const handleBookViewing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookViewing();
  }, [onBookViewing]);

  const handleShowPhone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowPhone();
  }, [onShowPhone]);

  const actions = [
    { icon: MessageCircle, label: 'Send Message', onPress: handleChat, isLoading: isChatLoading },
    ...(seller.isDealer ? [{ icon: Calendar1, label: 'Book a Viewing', onPress: handleBookViewing }] : []),
    ...(seller.phone ? [{ icon: Phone, label: 'Call Seller', onPress: handleShowPhone }] : []),
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(350)}
    >
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        {actions.map((action, index) => (
          <ActionItem
            key={action.label}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
            isLoading={action.isLoading}
            isLast={index === actions.length - 1}
          />
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  content: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
