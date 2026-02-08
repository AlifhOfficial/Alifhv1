/**
 * ActiveSearchChips - Floating chips bar above tab bar
 * Shows active search filters as dismissible pills
 * Transparent container with horizontally scrollable chips
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

import { useSearch, type SearchChip, type SearchParams } from '@/context/search-context';
import { Colors, Spacing } from '@/constants/theme';

const AnimatedView = Animated.View;

// Height of the chips bar
const CHIPS_BAR_HEIGHT = 48;

interface ActiveSearchChipsProps {
  /** Whether the chips bar should be visible (on browse tab) */
  visible: boolean;
}

export function ActiveSearchChips({ visible }: ActiveSearchChipsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { searchParams, getSearchChips, removeSearchParam, clearSearch, resetSort, sortBy } = useSearch();

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
    // Pass the index for array-based params
    removeSearchParam(chip.key as keyof SearchParams, chip.index);
  }, [removeSearchParam, resetSort]);

  const handleClearAll = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    clearSearch();
    // Also reset sort when clearing all
    if (sortBy !== 'relevance') {
      resetSort();
    }
  }, [clearSearch, resetSort, sortBy]);

  // Container animation
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(shouldShow ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withSpring(shouldShow ? 0 : 20, { damping: 20, stiffness: 300 }) },
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
            entering={FadeIn.duration(200).delay(index * 50)}
            exiting={FadeOut.duration(150)}
            layout={Layout.springify().damping(20).stiffness(200)}
          >
            <Pressable
              onPress={() => handleRemoveChip(chip)}
              style={[
                styles.pill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              {({ pressed }) => (
                <View style={[styles.pillInner, { opacity: pressed ? 0.7 : 1 }]}>
                  <Text 
                    style={[styles.pillText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {chip.label}
                  </Text>
                  <X 
                    size={12} 
                    color={colors.textTertiary} 
                    strokeWidth={2.5} 
                  />
                </View>
              )}
            </Pressable>
          </AnimatedView>
        ))}

        {/* Clear all button */}
        {chips.length > 1 && (
          <AnimatedView
            entering={FadeIn.duration(200).delay(chips.length * 50)}
            exiting={FadeOut.duration(150)}
          >
            <Pressable
              onPress={handleClearAll}
              style={[
                styles.clearPill,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              {({ pressed }) => (
                <Text style={[styles.clearText, { opacity: pressed ? 0.7 : 1 }]}>
                  Clear all
                </Text>
              )}
            </Pressable>
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
    zIndex: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    height: CHIPS_BAR_HEIGHT,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    maxWidth: 140,
  },
  clearPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
