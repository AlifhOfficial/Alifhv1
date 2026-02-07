/**
 * Screen Container Component
 * Global display area with proper safe area handling
 * Ensures content renders properly with consistent padding for tab bar
 */

import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

// Tab bar height + extra padding for comfortable scrolling
const TAB_BAR_OFFSET = 100;

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Custom header component rendered above scroll content */
  header?: React.ReactNode;
  /** Enable scroll view (default: true) */
  scrollable?: boolean;
  /** Enable keyboard avoiding behavior (default: true on iOS) */
  keyboardAvoiding?: boolean;
  /** Enable pull-to-refresh */
  refreshing?: boolean;
  /** Pull-to-refresh callback */
  onRefresh?: () => void;
  /** Horizontal padding (default: 20) */
  horizontalPadding?: number;
  /** Additional bottom padding beyond tab bar offset */
  extraBottomPadding?: number;
  /** Show scroll indicator (default: false) */
  showScrollIndicator?: boolean;
}

export function ScreenContainer({
  children,
  header,
  scrollable = true,
  keyboardAvoiding = true,
  refreshing,
  onRefresh,
  horizontalPadding = 20,
  extraBottomPadding = 0,
  showScrollIndicator = false,
}: ScreenContainerProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const contentPaddingBottom = insets.bottom + TAB_BAR_OFFSET + extraBottomPadding;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: horizontalPadding,
          paddingBottom: contentPaddingBottom,
        },
      ]}
      showsVerticalScrollIndicator={showScrollIndicator}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.staticContent,
        {
          paddingHorizontal: horizontalPadding,
          paddingBottom: contentPaddingBottom,
        },
      ]}
    >
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {header}
      {wrappedContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});
