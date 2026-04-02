/**
 * Favorite Actions - Unified Like/Superlike Components
 * 
 * Handles all interaction logic in one place:
 * - Toggle favorite/superlike state
 * - Confetti burst effects
 * - Sound chimes
 * - Superlike quota modal
 * - Auth flow when needed
 * 
 * Usage:
 *   <FavoriteButton listingId={id} />
 *   <SuperlikeButton listingId={id} />
 *   
 *   // Or use the hook for custom UI:
 *   const { isFavorite, isSuperliked, toggleFavorite, toggleSuperlike } = useFavoriteActions(id);
 */

import React, { useCallback, memo, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Heart, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useTheme } from '@/context/theme-context';
import { useListingFavorite } from '@/context/favorites-context';
import { useAuth } from '@/context/auth-context';
import { Colors } from '@/constants/theme';
import { HapticPressable } from './haptic-pressable';
import {
  ConfettiBurst,
  useConfettiBurst,
  FAVORITE_COLORS,
  SUPERLIKE_COLORS,
} from './confetti-burst';

// ============================================================================
// TYPES
// ============================================================================

export interface UseFavoriteActionsOptions {
  /** Override callback for favorite toggle */
  onFavoritePress?: (id: string) => void;
  /** Override callback for superlike toggle */
  onSuperlikePress?: (id: string) => void;
  /** Override favorite state (for controlled mode) */
  isFavorite?: boolean;
  /** Override superlike state (for controlled mode) */
  isSuperliked?: boolean;
  /** Skip haptic feedback */
  skipHaptics?: boolean;
}

export interface FavoriteButtonProps {
  listingId: string;
  /** Icon size (default: 20) */
  size?: number;
  /** Stroke width (default: 1.75) */
  strokeWidth?: number;
  /** Override callback */
  onPress?: (id: string) => void;
  /** Override state */
  isFavorite?: boolean;
  /** Custom icon color when not active */
  inactiveColor?: string;
  /** For BLK listings styling */
  isBlkListing?: boolean;
  /** Hit slop for touch target */
  hitSlop?: number;
}

export interface SuperlikeButtonProps {
  listingId: string;
  /** Icon size (default: 20) */
  size?: number;
  /** Stroke width (default: 1.75) */
  strokeWidth?: number;
  /** Override callback */
  onPress?: (id: string) => void;
  /** Override state */
  isSuperliked?: boolean;
  /** Custom icon color when not active */
  inactiveColor?: string;
  /** For BLK listings styling */
  isBlkListing?: boolean;
  /** Hit slop for touch target */
  hitSlop?: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useFavoriteActions(
  listingId: string,
  options: UseFavoriteActionsOptions = {}
) {
  const { showAuthSheet, isAuthenticated } = useAuth();
  const favoriteState = useListingFavorite(listingId);
  
  // Sheet visibility state
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [showExhaustedSheet, setShowExhaustedSheet] = useState(false);
  
  // Confetti effects
  const favConfetti = useConfettiBurst();
  const superConfetti = useConfettiBurst();

  // Determine current state (props override context)
  const isFavorite = options.isFavorite ?? favoriteState.isFavorite;
  const isSuperliked = options.isSuperliked ?? favoriteState.isSuperliked;
  const quota = favoriteState.quota;

  const triggerHaptic = useCallback(() => {
    if (options.skipHaptics) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [options.skipHaptics]);

  const toggleFavorite = useCallback(() => {
    triggerHaptic();

    // Use custom callback if provided
    if (options.onFavoritePress) {
      options.onFavoritePress(listingId);
      // Still fire effects when toggling ON
      if (!isFavorite) {
        favConfetti.fire({ colors: [...FAVORITE_COLORS], count: 10 });
      }
      return;
    }

    // Check auth
    if (!isAuthenticated) {
      showAuthSheet('saved');
      return;
    }

    // Fire effects before toggle (for turning ON)
    if (!isFavorite) {
      favConfetti.fire({ colors: [...FAVORITE_COLORS], count: 10 });
    }

    favoriteState.toggleFavorite().catch((err) => {
      if (err?.message === 'AUTH_REQUIRED') {
        showAuthSheet('saved');
      }
    });
  }, [
    listingId,
    options.onFavoritePress,
    favoriteState,
    isAuthenticated,
    showAuthSheet,
    isFavorite,
    favConfetti,
    triggerHaptic,
  ]);

  const toggleSuperlike = useCallback(() => {
    triggerHaptic();

    // Use custom callback if provided
    if (options.onSuperlikePress) {
      options.onSuperlikePress(listingId);
      if (!isSuperliked) {
        superConfetti.fire({ colors: [...SUPERLIKE_COLORS], count: 14 });
      }
      return;
    }

    // Check auth
    if (!isAuthenticated) {
      showAuthSheet('saved');
      return;
    }

    // If already superliked, just toggle off
    if (isSuperliked) {
      favoriteState.toggleSuperlike().catch((err) => {
        if (err?.message === 'AUTH_REQUIRED') {
          showAuthSheet('saved');
        }
      });
      return;
    }

    // Check quota before showing confirmation
    const remaining = quota?.remaining ?? 0;

    if (remaining <= 0) {
      setShowExhaustedSheet(true);
      return;
    }

    // Show confirmation sheet
    setShowConfirmSheet(true);
  }, [
    listingId,
    options.onSuperlikePress,
    favoriteState,
    isAuthenticated,
    showAuthSheet,
    isSuperliked,
    quota,
    superConfetti,
    triggerHaptic,
  ]);

  const handleConfirmSuperlike = useCallback(() => {
    setShowConfirmSheet(false);
    superConfetti.fire({ colors: [...SUPERLIKE_COLORS], count: 14 });
    favoriteState.toggleSuperlike().catch((err) => {
      if (err?.message === 'AUTH_REQUIRED') {
        showAuthSheet('saved');
      } else if (err?.message === 'QUOTA_EXCEEDED') {
        setShowExhaustedSheet(true);
      }
    });
  }, [favoriteState, showAuthSheet, superConfetti]);

  return {
    isFavorite,
    isSuperliked,
    quota,
    toggleFavorite,
    toggleSuperlike,
    favConfettiRef: favConfetti.ref,
    superConfettiRef: superConfetti.ref,
    // Sheet state and handlers
    showConfirmSheet,
    showExhaustedSheet,
    setShowConfirmSheet,
    setShowExhaustedSheet,
    handleConfirmSuperlike,
  };
}

// ============================================================================
// FAVORITE BUTTON
// ============================================================================

export const FavoriteButton = memo(function FavoriteButton({
  listingId,
  size = 20,
  strokeWidth = 1.75,
  onPress,
  isFavorite: isFavoriteProp,
  inactiveColor,
  isBlkListing = false,
  hitSlop = 8,
}: FavoriteButtonProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const { isFavorite, toggleFavorite, favConfettiRef } = useFavoriteActions(listingId, {
    onFavoritePress: onPress,
    isFavorite: isFavoriteProp,
  });

  const iconColor = isFavorite
    ? colors.favorite
    : inactiveColor ?? (isBlkListing ? colors.labelSecondary : colors.label);

  return (
    <View style={styles.wrapper}>
      <HapticPressable onPress={toggleFavorite} hitSlop={hitSlop}>
        <Heart
          size={size}
          color={iconColor}
          fill={isFavorite ? colors.favorite : 'none'}
          strokeWidth={isFavorite ? strokeWidth + 0.5 : strokeWidth}
        />
      </HapticPressable>
      <ConfettiBurst ref={favConfettiRef} />
    </View>
  );
});

// ============================================================================
// SUPERLIKE BUTTON
// ============================================================================

export const SuperlikeButton = memo(function SuperlikeButton({
  listingId,
  size = 20,
  strokeWidth = 1.75,
  onPress,
  isSuperliked: isSuperlikedProp,
  inactiveColor,
  isBlkListing = false,
  hitSlop = 8,
}: SuperlikeButtonProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const {
    isSuperliked,
    toggleSuperlike,
    superConfettiRef,
    showConfirmSheet,
    showExhaustedSheet,
    setShowConfirmSheet,
    setShowExhaustedSheet,
  } = useFavoriteActions(listingId, {
    onSuperlikePress: onPress,
    isSuperliked: isSuperlikedProp,
  });

  useEffect(() => {
    if (!showConfirmSheet) return;
    router.push({ pathname: '/superlike-confirmation', params: { listingId } });
    setShowConfirmSheet(false);
  }, [listingId, setShowConfirmSheet, showConfirmSheet]);

  useEffect(() => {
    if (!showExhaustedSheet) return;
    router.push({ pathname: '/superlike-exhausted', params: { listingId } });
    setShowExhaustedSheet(false);
  }, [listingId, setShowExhaustedSheet, showExhaustedSheet]);

  const iconColor = isSuperliked
    ? colors.warning
    : inactiveColor ?? (isBlkListing ? colors.labelSecondary : colors.label);

  return (
    <View style={styles.wrapper}>
      <HapticPressable onPress={toggleSuperlike} hitSlop={hitSlop}>
        <Zap
          size={size}
          color={iconColor}
          fill={isSuperliked ? colors.warning : 'none'}
          strokeWidth={isSuperliked ? strokeWidth + 0.5 : strokeWidth}
        />
      </HapticPressable>
      <ConfettiBurst ref={superConfettiRef} />
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
