/**
 * Floating Listing Actions - Like, Superlike, Share
 * Positioned at bottom of screen like bubbles (inspired by global-tab-bar)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { HapticPressable, ConfettiBurst, useConfettiBurst, FAVORITE_COLORS, SUPERLIKE_COLORS } from '@/components/ui';
import { Heart, Sparkles, Share2 } from 'lucide-react-native';
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
import { useListingFavorite } from '@/context/favorites-context';
import { Colors, Spacing } from '@/constants/theme';
import { playFavChime, playSuperlikeChime } from '@/lib/chime';

const AnimatedView = Animated.View;

interface FloatingListingActionsProps {
  id: string;
  isFavorite?: boolean;
  isSuperliked?: boolean;
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
}

const BUBBLE_SIZE = 52;
const GAP = 8;

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

  // Confetti effects
  const favConfetti = useConfettiBurst();
  const superConfetti = useConfettiBurst();
  
  // Use context for favorites state (with prop overrides)
  const favoriteState = useListingFavorite(id);
  const isFavorite = isFavoriteProp ?? favoriteState.isFavorite;
  const isSuperliked = isSuperlikedProp ?? favoriteState.isSuperliked;

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

  const handleFavoritePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onFavoritePress) {
      onFavoritePress(id);
    } else {
      favoriteState.toggleFavorite().catch(() => {});
    }
    // Fire confetti + chime when toggling ON
    if (!isFavorite) {
      favConfetti.fire({ colors: FAVORITE_COLORS, count: 10 });
      playFavChime();
    }
  }, [id, onFavoritePress, favoriteState, isFavorite, favConfetti]);

  const handleSuperlikePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onSuperlikePress) {
      onSuperlikePress(id);
      if (!isSuperliked) {
        superConfetti.fire({ colors: SUPERLIKE_COLORS, count: 14 });
        playSuperlikeChime();
      }
      return;
    }
    
    // If already superliked, just toggle off
    if (isSuperliked) {
      favoriteState.toggleSuperlike().catch(() => {});
      return;
    }
    
    // Check quota before showing confirmation
    const quota = favoriteState.quota;
    const remaining = quota?.remaining ?? 0;
    const total = (quota?.maxSuperlikesPerMonth ?? 0) + (quota?.premiumSuperlikesBonus ?? 0);
    
    if (remaining <= 0) {
      const resetDate = quota?.periodEndDate 
        ? new Date(quota.periodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null;
      Alert.alert(
        'No Superlikes Left',
        `You've used all your superlikes for this month.${resetDate ? ` They'll reset on ${resetDate}.` : ''}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Show confirmation
    Alert.alert(
      'Superlike this listing?',
      `You have ${remaining}/${total} superlikes remaining this month.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            superConfetti.fire({ colors: SUPERLIKE_COLORS, count: 14 });
            playSuperlikeChime();
            favoriteState.toggleSuperlike().catch((err) => {
              if (err?.message === 'QUOTA_EXCEEDED') {
                Alert.alert('No Superlikes Left', 'You\'ve used all your superlikes for this month.');
              }
            });
          }
        },
      ]
    );
  }, [id, onSuperlikePress, favoriteState, isSuperliked, superConfetti]);

  const handleSharePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSharePress?.(id);
  }, [id, onSharePress]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.actionGroup}>
        {/* Like Bubble */}
        <Animated.View style={[favoriteBubbleStyle, styles.bubbleWrapper]}>
          <HapticPressable
            onPress={handleFavoritePress}
            style={[
              styles.bubble,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Heart
              size={22}
              color={isFavorite ? colors.favorite : colors.text}
              fill={isFavorite ? colors.favorite : 'none'}
              strokeWidth={isFavorite ? 2.25 : 1.75}
            />
          </HapticPressable>
          <ConfettiBurst ref={favConfetti.ref} />
        </Animated.View>

        {/* Superlike Bubble */}
        <Animated.View style={[superlikeBubbleStyle, styles.bubbleWrapper]}>
          <HapticPressable
            onPress={handleSuperlikePress}
            style={[
              styles.bubble,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Sparkles
              size={22}
              color={isSuperliked ? colors.warning : colors.text}
              fill={isSuperliked ? colors.warning : 'none'}
              strokeWidth={1.75}
            />
          </HapticPressable>
          <ConfettiBurst ref={superConfetti.ref} />
        </Animated.View>

        {/* Share Bubble */}
        <Animated.View style={[shareBubbleStyle]}>
          <HapticPressable
            onPress={handleSharePress}
            style={[
              styles.bubble,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Share2
              size={22}
              color={colors.text}
              strokeWidth={2}
            />
          </HapticPressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});
