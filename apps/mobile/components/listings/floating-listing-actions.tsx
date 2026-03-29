/**
 * Floating Listing Actions - Like, Superlike, Share
 * Positioned at bottom of screen as floating bubbles
 */

import { HapticPressable, ConfettiBurst, useFavoriteActions } from '@/components/ui';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Heart, Zap, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { Colors, Layout, Sizes, Spacing, ZIndex} from '@/constants/theme';
import { SuperlikeConfirmationSheet, SuperlikeQuotaExhaustedSheet } from '@/components/sheets';

const AnimatedView = Animated.View;

interface FloatingListingActionsProps {
  id: string;
  isFavorite?: boolean;
  isSuperliked?: boolean;
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
}

const BUBBLE_SIZE = Sizes.bubbleMd;
const GAP = Spacing.sm;

export function FloatingListingActions({
  id,
  isFavorite: isFavoriteProp,
  isSuperliked: isSuperlikedProp,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: FloatingListingActionsProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(true);

  // Use the unified favorite actions hook
  const {
    isFavorite,
    isSuperliked,
    toggleFavorite,
    toggleSuperlike,
    favConfettiRef,
    superConfettiRef,
    quota,
    showConfirmSheet,
    showExhaustedSheet,
    setShowConfirmSheet,
    setShowExhaustedSheet,
    handleConfirmSuperlike,
  } = useFavoriteActions(id, {
    onFavoritePress: onFavoritePress,
    onSuperlikePress: onSuperlikePress,
    isFavorite: isFavoriteProp,
    isSuperliked: isSuperlikedProp,
  });

  // Animation values for each bubble
  const favoriteProgress = useSharedValue(1);
  const superlikeProgress = useSharedValue(1);
  const shareProgress = useSharedValue(1);

  // Handle animations
  useEffect(() => {
    favoriteProgress.value = withTiming(isVisible ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    superlikeProgress.value = withTiming(isVisible ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    shareProgress.value = withTiming(isVisible ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isVisible]);

  const favoriteBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: favoriteProgress.value,
      transform: [
        {
          scale: interpolate(favoriteProgress.value, [0, 1], [0.8, 1]),
        },
      ],
      width: interpolate(favoriteProgress.value, [0, 1], [0, BUBBLE_SIZE]),
      marginRight: interpolate(favoriteProgress.value, [0, 1], [0, GAP]),
    };
  });

  const superlikeBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: superlikeProgress.value,
      transform: [
        {
          scale: interpolate(superlikeProgress.value, [0, 1], [0.8, 1]),
        },
      ],
      width: interpolate(superlikeProgress.value, [0, 1], [0, BUBBLE_SIZE]),
      marginRight: interpolate(superlikeProgress.value, [0, 1], [0, GAP]),
    };
  });

  const shareBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: shareProgress.value,
      transform: [
        {
          scale: interpolate(shareProgress.value, [0, 1], [0.8, 1]),
        },
      ],
      width: interpolate(shareProgress.value, [0, 1], [0, BUBBLE_SIZE]),
      marginLeft: interpolate(shareProgress.value, [0, 1], [0, GAP]),
    };
  });

  const handleSharePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSharePress?.(id);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
    <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.md }]}>
      <View style={styles.actionGroup}>
        {/* Like Bubble */}
        <Animated.View style={[favoriteBubbleStyle, styles.bubbleWrapper]}>
          <HapticPressable
            onPress={toggleFavorite}
            style={[
              styles.bubble,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Heart
              size={Sizes.iconMd}
              color={isFavorite ? colors.favorite : colors.label}
              fill={isFavorite ? colors.favorite : 'none'}
              strokeWidth={isFavorite ? 2.25 : 1.75}
            />
          </HapticPressable>
          <ConfettiBurst ref={favConfettiRef} />
        </Animated.View>

        {/* Superlike Bubble */}
        <Animated.View style={[superlikeBubbleStyle, styles.bubbleWrapper]}>
          <HapticPressable
            onPress={toggleSuperlike}
            style={[
              styles.bubble,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Zap
              size={Sizes.iconMd}
              color={isSuperliked ? colors.warning : colors.label}
              fill={isSuperliked ? colors.warning : 'none'}
              strokeWidth={1.75}
            />
          </HapticPressable>
          <ConfettiBurst ref={superConfettiRef} />
        </Animated.View>

        {/* Share Bubble */}
        <Animated.View style={[shareBubbleStyle]}>
          <HapticPressable
            onPress={handleSharePress}
            style={[
              styles.bubble,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Share2
              size={Sizes.iconMd}
              color={colors.label}
              strokeWidth={2}
            />
          </HapticPressable>
        </Animated.View>
      </View>
    </View>
    <SuperlikeConfirmationSheet
      visible={showConfirmSheet}
      onClose={() => setShowConfirmSheet(false)}
      onConfirm={handleConfirmSuperlike}
      quota={quota}
    />
    <SuperlikeQuotaExhaustedSheet
      visible={showExhaustedSheet}
      onClose={() => setShowExhaustedSheet(false)}
      quota={quota}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.raised,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Layout.screenPadding,
    pointerEvents: 'box-none',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },
  bubbleWrapper: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
