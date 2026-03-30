/**
 * Seller Location Section
 * 
 * Location display with map, directions, and website actions.
 * Follows profile/settings card pattern for consistency.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MapPin, ExternalLink, Navigation, Globe, ChevronRight } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import type { SellerLocationProps } from './types';

interface LocationItemProps {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  colors: SellerLocationProps['colors'];
  isLast?: boolean;
}

function LocationItem({ icon: Icon, label, onPress, colors, isLast }: LocationItemProps) {
  const bgOpacity = useSharedValue(0);

  const handlePressIn = () => { bgOpacity.value = withTiming(1, { duration: 100 }); };
  const handlePressOut = () => { bgOpacity.value = withTiming(0, { duration: 200 }); };

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(bgOpacity.value, [0, 1], ['transparent', colors.fill]),
  }));

  return (
    <HapticPressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.item,
          animatedBgStyle,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.itemLeft}>
          <Icon size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
          <Text variant="subhead">{label}</Text>
        </View>
        <ChevronRight size={Sizes.iconSm} color={colors.labelTertiary} strokeWidth={Stroke.icon} />
      </Animated.View>
    </HapticPressable>
  );
}

export const SellerLocation = memo(function SellerLocation({
  seller,
  onViewMap,
  onGetDirections,
  onWebsite,
  colors,
}: SellerLocationProps) {
  if (!seller.location && !seller.website) return null;

  const items = [
    ...(seller.location ? [
      { icon: ExternalLink, label: 'View on Map', onPress: onViewMap },
      { icon: Navigation, label: 'Get Directions', onPress: onGetDirections },
    ] : []),
    ...(seller.website ? [
      { icon: Globe, label: 'Visit Website', onPress: onWebsite },
    ] : []),
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(350)}
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {seller.location && (
          <>
            <View style={styles.addressRow}>
              <MapPin size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
              <Text variant="subhead" tone="secondary" style={styles.addressText}>
                {seller.location}
              </Text>
            </View>
            <View style={[styles.fullDivider, { backgroundColor: colors.border }]} />
          </>
        )}

        {items.map((item, index) => (
          <LocationItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
            colors={colors}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  addressText: {
    flex: 1,
  },
  fullDivider: {
    height: StyleSheet.hairlineWidth,
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
