/**
 * StepContainer — Shared scrollable wrapper for step content
 *
 * Provides consistent scroll behavior across all create-listing steps.
 * Handles keyboard avoidance, safe area insets, and proper scroll constraints.
 *
 * @module components/sheets/create-listing/step-container
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface StepContainerProps {
  children: React.ReactNode;
  /** Extra bottom padding (default: Spacing['3xl']) */
  bottomPadding?: number;
  /** Disable horizontal padding (default: false) */
  noPadding?: boolean;
}

/**
 * Consistent scrollable container for step content.
 * Use this instead of wrapping content in BottomSheetScrollView directly.
 */
export function StepContainer({
  children,
  bottomPadding = Spacing['3xl'],
  noPadding = false,
}: StepContainerProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetScrollView
      style={[styles.scrollView, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
      contentContainerStyle={[
        styles.content,
        !noPadding && styles.withPadding,
        { paddingBottom: insets.bottom + bottomPadding },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {children}
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: Spacing.lg,
  },
  withPadding: {
    paddingHorizontal: Spacing.lg,
  },
});

export default StepContainer;
