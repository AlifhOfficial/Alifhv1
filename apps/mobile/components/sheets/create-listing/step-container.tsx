/**
 * StepContainer — Shared scrollable wrapper for step content
 *
 * Provides consistent scroll behavior across all create-listing steps.
 * Handles keyboard avoidance, safe area insets, and proper scroll constraints.
 *
 * @module components/sheets/create-listing/step-container
 */

import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, SheetChrome } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

interface StepContainerProps {
  children: React.ReactNode;
  /** Extra bottom padding (default: Spacing['3xl']) */
  bottomPadding?: number;
  /** Disable horizontal padding (default: false) */
  noPadding?: boolean;
  /** Allow child gesture surfaces to temporarily own scrolling */
  scrollEnabled?: boolean;
}

/**
 * Consistent scrollable container for step content.
 * Use this instead of wrapping content in ScrollView directly.
 */
export function StepContainer({
  children,
  bottomPadding = SheetChrome.bottomSafeAreaSpacing,
  noPadding = false,
  scrollEnabled = true,
}: StepContainerProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[
        styles.scrollView,
        {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        !noPadding && styles.withPadding,
        { paddingBottom: insets.bottom + bottomPadding },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces
      scrollEnabled={scrollEnabled}
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: SheetChrome.contentPaddingTop,
    gap: SheetChrome.rowGap,
  },
  withPadding: {
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
  },
});

export default StepContainer;
