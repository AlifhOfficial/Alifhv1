/**
 * ActiveSearchChips - Floating chips bar above tab bar
 * Shows active search filters as dismissible pills
 * Transparent container with horizontally scrollable chips
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

import { useSearch, type SearchChip, type SearchParams, type RemovableFilterKey } from '@/context/search-context';
import { Colors, Shadows, Spacing, Typography, Sizes, Radius, ZIndex } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

const AnimatedView = Animated.View;

// Height of the chips bar
const CHIPS_BAR_HEIGHT = Sizes.pillHeight;

interface ActiveSearchChipsProps {
  /** Whether the chips bar should be visible (on browse tab) */
  visible: boolean;
}

export function ActiveSearchChips({ visible }: ActiveSearchChipsProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { getSearchChips, removeSearchParam, clearSearch, resetSort, sortBy, removeFilterParam, clearFilterParams } = useSearch();

  const chips = getSearchChips();
  const hasChips = chips.length > 0;

  // Only show if visible AND has chips
  const shouldShow = visible && hasChips;

  const handleRemoveChip = useCallback((chip: SearchChip) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Handle sort chip specially
    if (chip.key === 'sort') {
      resetSort();
      return;
    }
    // Handle search params (make, model, trim, q, partnerId, sellerId, tags, extras)
    if (['make', 'model', 'trim', 'q', 'partnerId', 'sellerId', 'tags', 'extras'].includes(chip.key)) {
      removeSearchParam(chip.key as keyof SearchParams, chip.index);
      return;
    }
    // Handle filter params (includes compound keys like 'price', 'year', 'mileage')
    removeFilterParam(chip.key as RemovableFilterKey, chip.index);
  }, [removeSearchParam, resetSort, removeFilterParam]);

  const handleClearAll = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    clearSearch();
    clearFilterParams();
    // Also reset sort when clearing all
    if (sortBy !== 'relevance') {
      resetSort();
    }
  }, [clearSearch, clearFilterParams, resetSort, sortBy]);

  // Container animation - simple fade
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(shouldShow ? 1 : 0, { duration: 150 }),
      transform: [
        { translateY: withTiming(shouldShow ? 0 : 8, { duration: 150 }) },
      ],
    };
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <AnimatedView 
      style={[
        styles.container,
        containerStyle,
      ]}
      pointerEvents={shouldShow ? 'auto' : 'none'}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Active filter chips */}
        {chips.map((chip, index) => (
          <AnimatedView
            key={`${chip.key}-${chip.value}-${chip.index ?? index}`}
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            layout={Layout.duration(150)}
          >
            <HapticPressable
              onPress={() => handleRemoveChip(chip)}
              style={[
                styles.pill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              hitSlop={{ top: Spacing.sm, bottom: Spacing.sm, left: Spacing.xs, right: Spacing.xs }}
            >
              {({ pressed }) => (
                <>
                  <View style={[styles.pillInner, { opacity: pressed ? 0.7 : 1 }]}>
                    <Text 
                      variant="subhead"
                      tone="secondary"
                      style={styles.pillText}
                      numberOfLines={1}
                    >
                      {chip.label}
                    </Text>
                    <X 
                      size={Spacing.md} 
                      color={colors.labelTertiary} 
                      strokeWidth={2.5} 
                    />
                  </View>
                </>
              )}
            </HapticPressable>
          </AnimatedView>
        ))}

        {/* Clear all button */}
        {chips.length > 1 && (
          <AnimatedView
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
          >
            <HapticPressable
              onPress={handleClearAll}
              style={[
                styles.clearPill,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              hitSlop={{ top: Spacing.sm, bottom: Spacing.sm, left: Spacing.xs, right: Spacing.xs }}
            >
              {({ pressed }) => (
                <>
                  <Text variant="subhead" style={[styles.clearText, { color: colors.primaryForeground, opacity: pressed ? 0.7 : 1 }]}>
                    Clear all
                  </Text>
                </>
              )}
            </HapticPressable>
          </AnimatedView>
        )}
      </ScrollView>
    </AnimatedView>
  );
}

// Export height for other components to use
export const ACTIVE_CHIPS_HEIGHT = CHIPS_BAR_HEIGHT;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CHIPS_BAR_HEIGHT,
    zIndex: ZIndex.overlay,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    height: CHIPS_BAR_HEIGHT,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'visible',
    ...Shadows.md,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pillText: {
    ...Typography.subhead,
    maxWidth: Spacing["5xl"],
  },
  clearPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    overflow: 'visible',
    ...Shadows.md,
  },
  clearText: {
    ...Typography.caption1Emphasized,
  },
});
