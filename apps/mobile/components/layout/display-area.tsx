/**
 * Display Area - Main Content Container
 * Renders content between header and tab bar
 * Handles safe area insets and scrolling
 */

import React, { ReactNode } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface DisplayAreaProps {
  children: ReactNode;
  /** Enable scroll behavior */
  scrollable?: boolean;
  /** Show pull-to-refresh indicator */
  refreshing?: boolean;
  /** Pull-to-refresh callback */
  onRefresh?: () => void;
  /** Called when scroll reaches end */
  onEndReached?: () => void;
  /** How far from end to trigger onEndReached (0-1) */
  onEndReachedThreshold?: number;
  /** Horizontal padding (uses theme spacing) */
  horizontalPadding?: keyof typeof Spacing | number;
  /** Vertical padding (uses theme spacing) */
  verticalPadding?: keyof typeof Spacing | number;
  /** Content padding at bottom for tab bar clearance */
  tabBarClearance?: boolean;
  /** Custom style override */
  style?: object;
  /** Content container style (for ScrollView) */
  contentContainerStyle?: object;
}

export function DisplayArea({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.2,
  horizontalPadding = 'sm',
  verticalPadding = 'md',
  tabBarClearance = true,
  style,
  contentContainerStyle,
}: DisplayAreaProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // Resolve padding values
  const hPadding = typeof horizontalPadding === 'number' 
    ? horizontalPadding 
    : Spacing[horizontalPadding];
  const vPadding = typeof verticalPadding === 'number' 
    ? verticalPadding 
    : Spacing[verticalPadding];

  // Tab bar height + bottom safe area
  const bottomClearance = tabBarClearance ? Layout.tabBarHeight + insets.bottom : insets.bottom;

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
    style,
  ];

  const contentStyle = [
    styles.content,
    {
      paddingHorizontal: hPadding,
      paddingTop: vPadding,
      paddingBottom: bottomClearance,
    },
    contentContainerStyle,
  ];

  if (!scrollable) {
    return (
      <View style={containerStyle}>
        <View style={contentStyle}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScroll={({ nativeEvent }) => {
        if (!onEndReached) return;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = contentSize.height * onEndReachedThreshold;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
          onEndReached();
        }
      }}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
