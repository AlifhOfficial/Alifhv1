/**
 * Home Tab Screen
 * 
 * Shows greeting and quick actions.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GreetingNote,
  QuickActions,
  ProfileMenu,
  HomeFeed,
} from '@/components/home';
import { Bubble, HapticRefreshControl } from '@/components/ui';
import { MobileHeader, getMobileHeaderContentInset, getTabBarContentInset } from '@/components/layout';
import { useTheme } from '@/context/theme-context';
import { Spacing, Sizes } from '@/constants/theme';

// ============================================================================
// CONSTANTS
// ============================================================================

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen() {
  const { colors, colorScheme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isHeaderTitleHidden, setIsHeaderTitleHidden] = useState(false);
  const topSpacerHeight = getMobileHeaderContentInset(insets.top) + Spacing['5xl'] * 2 + Spacing['3xl'] * 2;
  const bottomInset = getTabBarContentInset(insets.bottom, Spacing['3xl']);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const handleToggleTheme = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  }, [toggleTheme]);

  const ThemeIcon = colorScheme === 'dark' ? Moon : Sun;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderTitleHidden(event.nativeEvent.contentOffset.y > Spacing.lg);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader
        title="Home"
        titleHidden={isHeaderTitleHidden}
        left={<ProfileMenu />}
        right={
          <Bubble
            onPress={handleToggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
          >
            <ThemeIcon size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
          </Bubble>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <HapticRefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={[styles.ghostSpacer, { height: topSpacerHeight }]} />
        <View style={styles.greetingContainer}>
          <GreetingNote />
        </View>
        <QuickActions />
        <HomeFeed />

        <View style={[styles.bottomSpacer, { height: bottomInset }]} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.lg,
  },
  ghostSpacer: {},
  greetingContainer: {
    marginBottom: Spacing.md,
  },
  bottomSpacer: {
    height: 0,
  },
});
