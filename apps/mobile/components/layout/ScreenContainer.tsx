/**
 * Screen Container Component
 * Unified content area for all screens with safe area handling
 * Handles scrolling, keyboard avoiding, pull-to-refresh, and infinite scroll
 */

import React, { forwardRef, ReactNode } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Layout } from '@/constants/theme';

interface ScreenContainerProps {
  children: ReactNode;
  /** Custom header component rendered above scroll content */
  header?: ReactNode;
  /** Enable scroll view (default: true) */
  scrollable?: boolean;
  /** Enable keyboard avoiding behavior (default: true on iOS) */
  keyboardAvoiding?: boolean;
  /** Show pull-to-refresh indicator */
  refreshing?: boolean;
  /** Pull-to-refresh callback */
  onRefresh?: () => void;
  /** Called when scroll reaches end (for infinite scroll) */
  onEndReached?: () => void;
  /** How far from end to trigger onEndReached (0-1), default: 0.2 */
  onEndReachedThreshold?: number;
  /** Horizontal padding - theme key or number (default: 'sm') */
  horizontalPadding?: keyof typeof Spacing | number;
  /** Vertical padding - theme key or number (default: 'md') */
  verticalPadding?: keyof typeof Spacing | number;
  /** Add bottom padding for tab bar clearance (default: true) */
  tabBarClearance?: boolean;
  /** Additional bottom padding (e.g. for chips bar) */
  extraBottomPadding?: number;
  /** Show scroll indicator (default: false) */
  showScrollIndicator?: boolean;
  /** Custom style override for container */
  style?: object;
  /** Content container style (for ScrollView) */
  contentContainerStyle?: object;
  /** Scroll event callback */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const ScreenContainer = forwardRef<ScrollView, ScreenContainerProps>(
  function ScreenContainer(
    {
      children,
      header,
      scrollable = true,
      keyboardAvoiding = true,
      refreshing = false,
      onRefresh,
      onEndReached,
      onEndReachedThreshold = 0.2,
      horizontalPadding = 'sm',
      verticalPadding = 'md',
      tabBarClearance = true,
      extraBottomPadding = 0,
      showScrollIndicator = false,
      style,
      contentContainerStyle,
      onScroll: externalOnScroll,
    },
    ref
  ) {
    const { colorScheme } = useTheme();
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();

    // Resolve padding values from theme or raw numbers
    const hPadding =
      typeof horizontalPadding === 'number'
        ? horizontalPadding
        : Spacing[horizontalPadding];
    const vPadding =
      typeof verticalPadding === 'number'
        ? verticalPadding
        : Spacing[verticalPadding];

    // Tab bar height + bottom safe area
    const bottomClearance = tabBarClearance
      ? Layout.tabBarHeight + insets.bottom + extraBottomPadding
      : insets.bottom + extraBottomPadding;

    const containerStyle = [styles.container, style];

    const contentStyle = [
      styles.scrollContent,
      {
        paddingHorizontal: hPadding,
        paddingTop: vPadding,
        paddingBottom: bottomClearance,
      },
      contentContainerStyle,
    ];

    // Handle scroll with infinite scroll detection
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      externalOnScroll?.(event);

      if (!onEndReached) return;
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = contentSize.height * onEndReachedThreshold;
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      ) {
        onEndReached();
      }
    };

    const scrollContent = scrollable ? (
      <ScrollView
        ref={ref}
        style={styles.scrollView}
        contentContainerStyle={contentStyle}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={showScrollIndicator}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    ) : (
      <View style={contentStyle}>{children}</View>
    );

    const wrappedContent = keyboardAvoiding ? (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
      >
        {scrollContent}
      </KeyboardAvoidingView>
    ) : (
      scrollContent
    );

    return (
      <View style={containerStyle}>
        {header}
        {wrappedContent}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
