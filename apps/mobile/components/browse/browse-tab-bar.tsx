/**
 * BrowseTabBar - Tab bar for browse screen
 * Shows: back + search + sort + filters
 */

import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import * as Haptics from 'expo-haptics';
import { Search, ArrowUpDown, Package2 } from 'lucide-react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { router } from 'expo-router';
import { Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { BorderWidths, Colors, Layout, Sizes, Spacing, Timing, ZIndex } from '@/constants/theme';
import type { FilterPillType, BrowseViewMode as ViewMode } from '@/context/search-context';

interface BrowseTabBarProps {
  bottomOffset?: number;
  visible?: boolean;
  pills?: { type: FilterPillType; label: string; activeCount: number }[];
  onPillPress?: (type: FilterPillType) => void;
  onSettingsPress?: () => void;
  settingsCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

const AnimatedView = Animated.View;

export function BrowseTabBar({
  bottomOffset = 0,
  visible = true,
  pills = [],
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
}: BrowseTabBarProps) {
  const { colorScheme } = useTheme();
  const { getActiveFilterCount, sortBy } = useSearch();
  const colors = Colors[colorScheme];
  const visibilityProgress = useSharedValue(visible ? 1 : 0);
  const bubbleBackgroundColor = colorScheme === 'dark' ? colors.surfaceSecondary : colors.background;

  const activeFilterCount = getActiveFilterCount();
  const isSortActive = sortBy !== 'relevance';
  const nonSortFilterCount = Math.max(0, activeFilterCount - (isSortActive ? 1 : 0));
  const hasFilters = nonSortFilterCount > 0;

  const handleSearchPress = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/(browse)/search');
  }, []);

  const handleSortPress = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/(browse)/sort');
  }, []);

  const handleFiltersPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/(browse)/active-filters');
  }, []);

  const handleDrawerPress = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/(tabs)/(browse)/menu', params: { viewMode } });
  }, [viewMode]);

  useEffect(() => {
    visibilityProgress.value = withSpring(visible ? 1 : 0, {
      damping: 18,
      stiffness: 180,
      mass: 0.9,
      overshootClamping: false,
      energyThreshold: 0.01,
    });
  }, [visible, visibilityProgress]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const progress = visibilityProgress.value;

    return {
      opacity: progress,
      transform: [
        { translateY: interpolate(progress, [0, 1], [Spacing['2xl'], 0]) },
        { scale: 0.96 + progress * 0.04 },
      ],
    };
  });

  return (
    <>
      <AnimatedView
        style={[styles.container, { bottom: bottomOffset }, containerAnimatedStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={styles.content}>
          <View style={styles.centerGroup}>
            <MotiPressable
              onPress={handleDrawerPress}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed ? 0.92 : 1,
                };
              }}
              transition={{
                type: 'timing',
                duration: Timing.imageTransition,
              }}
              style={[
                styles.bubble,
                {
                  borderColor: colors.border,
                  backgroundColor: bubbleBackgroundColor,
                },
              ]}
            >
              <Package2
                size={Sizes.iconMd}
                color={colors.label}
                strokeWidth={2.5}
              />
            </MotiPressable>

            <MotiPressable
              onPress={handleSearchPress}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed ? 0.92 : 1,
                };
              }}
              transition={{
                type: 'timing',
                duration: Timing.imageTransition,
              }}
              style={[
                styles.bubble,
                {
                  borderColor: colors.border,
                  backgroundColor: bubbleBackgroundColor,
                },
              ]}
            >
              <Search size={Sizes.iconMd} color={colors.label} strokeWidth={2.5} />
            </MotiPressable>

            <MotiPressable
              onPress={handleSortPress}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed ? 0.92 : 1,
                };
              }}
              transition={{
                type: 'timing',
                duration: Timing.imageTransition,
              }}
              style={[
                styles.bubble,
                {
                  borderColor: colors.border,
                  backgroundColor: bubbleBackgroundColor,
                },
              ]}
            >
              <ArrowUpDown
                size={Sizes.iconMd}
                color={colors.label}
                strokeWidth={2.5}
              />
            </MotiPressable>

            {hasFilters ? (
              <MotiPressable
                onPress={handleFiltersPress}
                animate={({ pressed }) => {
                  'worklet';
                  return {
                    scale: pressed ? 0.92 : 1,
                  };
                }}
                transition={{
                  type: 'timing',
                  duration: Timing.imageTransition,
                }}
                style={[
                  styles.bubble,
                  {
                    borderColor: colors.border,
                    backgroundColor: bubbleBackgroundColor,
                  },
                ]}
              >
                <Text variant="subheadEmphasized" tone="default" style={{ fontVariant: ['tabular-nums'] }}>
                  {nonSortFilterCount > 9 ? '9+' : nonSortFilterCount}
                </Text>
              </MotiPressable>
            ) : null}
          </View>
        </View>
      </AnimatedView>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Layout.headerPadding + Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  centerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bubble: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidths.thin,
  },
});
