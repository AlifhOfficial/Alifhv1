/**
 * Global Tab Bar - Renders on all screens
 * Uses expo-router navigation
 * Includes search bubble and sort bubble on browse tab
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Home, MessageCircle, LayoutGrid, ChevronLeft, Search, ArrowUpDown, Plus } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { useTabBar } from '@/context/tab-bar-context';
import { useAuth } from '@/context/auth-context';
import { Colors } from '@/constants/theme';
import { SearchSheet, SortSheet } from '@/components/sheets';
import { ActiveSearchChips, ACTIVE_CHIPS_HEIGHT } from './active-search-chips';
import { getUnreadCount } from '@/lib/messaging-api';
import type { SearchSortOption } from '@/lib/search-api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.View;

type TabRoute = {
  name: string;
  path: string;
  icon: typeof Home;
};

const TABS: TabRoute[] = [
  { name: 'index', path: '/', icon: Home },
  { name: 'messages', path: '/messages', icon: MessageCircle },
  { name: 'browse', path: '/browse', icon: LayoutGrid },
];

// Main tab paths
const MAIN_TAB_PATHS = ['/', '/messages', '/browse', '/(tabs)', '/(tabs)/index', '/(tabs)/messages', '/(tabs)/browse'];

// Check if pathname is on browse tab - more robust matching
const isBrowsePath = (path: string) => {
  const normalized = path.toLowerCase();
  return normalized === '/browse' || 
         normalized === '/(tabs)/browse' || 
         normalized.endsWith('/browse') ||
         normalized.includes('/browse');
};

// Check if pathname is on home tab
const isHomePath = (path: string) => {
  return path === '/' || path === '/(tabs)' || path === '/(tabs)/index';
};

// Back bubble size (matches pill height: 44 + padding 4*2 = 52)
const BACK_BUBBLE_SIZE = 52;
const SEARCH_BUBBLE_SIZE = 52;
const SORT_BUBBLE_SIZE = 52;
const CREATE_BUBBLE_SIZE = 52;
const GAP = 8;

/**
 * Screens that must NEVER show the tab bar.
 * This is a hard blocklist checked synchronously — no useEffect race.
 */
const HIDE_TAB_BAR_PATHS = [
  '/create-listing',
  '/inventory',
];

export function GlobalTabBar() {
  const { colorScheme } = useTheme();
  const { applySearch, sortBy, applySort, searchParams, filterParams, updateFilterParams, triggerScrollToTop } = useSearch();
  const { isTabBarVisible } = useTabBar();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Messages unread badge - fetched when messages tab is tapped
  const [messagesUnread, setMessagesUnread] = useState(0);

  // Fetch unread count on mount and when auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      setMessagesUnread(0);
      return;
    }
    getUnreadCount().then(setMessagesUnread).catch(() => {});
  }, [isAuthenticated]);

  // Double-tap detection for browse tab
  const lastBrowseTapRef = React.useRef<number>(0);
  const colors = Colors[colorScheme];
  const router = useRouter();
  const pathname = usePathname();

  // Check if on browse tab first (always show on browse, regardless of context)
  const onBrowseTab = isBrowsePath(pathname);

  // ── Hard hide: never render on blocklisted screens ─────────────────────
  const shouldHide = HIDE_TAB_BAR_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  
  // Respect isTabBarVisible from context, but ALWAYS show on browse tab
  const shouldHideByContext = !isTabBarVisible && !onBrowseTab;

  // Sheet states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Check if current screen is NOT a main tab (show back button)
  const showBackButton = !MAIN_TAB_PATHS.includes(pathname);

  // Show search/sort bubbles on browse tab
  const showSearchBubble = onBrowseTab;

  // Check if on home tab (show create bubble) - use robust matching
  const showCreateBubble = isHomePath(pathname);

  // Check if we have active search, filters, or non-default sort (show chips)
  const hasActiveFilters = filterParams && Object.keys(filterParams).length > 0;
  const hasActiveSearch = (searchParams !== null && Object.keys(searchParams).length > 0) || hasActiveFilters || sortBy !== 'relevance';

  // Animation values
  const progress = useSharedValue(showBackButton ? 1 : 0);
  const searchProgress = useSharedValue(showSearchBubble ? 1 : 0);
  const sortProgress = useSharedValue(showSearchBubble ? 1 : 0);
  const createProgress = useSharedValue(showCreateBubble ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(showBackButton ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [showBackButton]);

  React.useEffect(() => {
    searchProgress.value = withTiming(showSearchBubble ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    sortProgress.value = withTiming(showSearchBubble ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [showSearchBubble]);

  React.useEffect(() => {
    createProgress.value = withTiming(showCreateBubble ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [showCreateBubble]);

  // Back bubble animates in from left
  const backBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        { scale: interpolate(progress.value, [0, 1], [0.9, 1]) },
      ],
      width: interpolate(progress.value, [0, 1], [0, BACK_BUBBLE_SIZE]),
      marginRight: interpolate(progress.value, [0, 1], [0, GAP]),
    };
  });

  // Search bubble animates in from right
  const searchBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: searchProgress.value,
      transform: [
        { scale: interpolate(searchProgress.value, [0, 1], [0.8, 1]) },
      ],
      width: interpolate(searchProgress.value, [0, 1], [0, SEARCH_BUBBLE_SIZE]),
      marginLeft: interpolate(searchProgress.value, [0, 1], [0, GAP]),
    };
  });

  // Sort bubble animates in from right (after search bubble)
  const sortBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: sortProgress.value,
      transform: [
        { scale: interpolate(sortProgress.value, [0, 1], [0.8, 1]) },
      ],
      width: interpolate(sortProgress.value, [0, 1], [0, SORT_BUBBLE_SIZE]),
      marginLeft: interpolate(sortProgress.value, [0, 1], [0, GAP]),
    };
  });

  // Create bubble animates in from right (on home tab)
  const createBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: createProgress.value,
      transform: [
        { scale: interpolate(createProgress.value, [0, 1], [0.8, 1]) },
      ],
      width: interpolate(createProgress.value, [0, 1], [0, CREATE_BUBBLE_SIZE]),
      marginLeft: interpolate(createProgress.value, [0, 1], [0, GAP]),
    };
  });

  const pillStyle = useAnimatedStyle(() => {
    return {};
  });

  const handleTabPress = (tab: TabRoute) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Double-tap detection for browse tab
    if (tab.name === 'browse') {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300; // ms
      
      if (now - lastBrowseTapRef.current < DOUBLE_TAP_DELAY) {
        // Double-tap detected - scroll to top
        triggerScrollToTop();
        lastBrowseTapRef.current = 0; // Reset
        return;
      }
      
      lastBrowseTapRef.current = now;
    }
    
    router.push(tab.path as any);

    // Refresh unread count when navigating to messages
    if (tab.name === 'messages' && isAuthenticated) {
      getUnreadCount().then(setMessagesUnread).catch(() => {});
    }
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/');
  };

  const handleCreatePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/create-listing' as any);
  }, [router]);

  const handleSearchPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSearchOpen(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSearchSubmit = useCallback((params: { q?: string; make?: string[]; model?: string[]; trim?: string[]; tags?: string[]; extras?: string[]; partnerId?: string; partnerName?: string; bodyType?: string[]; fuelType?: string[]; transmission?: string[]; specs?: string[]; condition?: string; sellerType?: string }) => {
    // Split: search-level params → applySearch, filter-level params → updateFilterParams
    const { bodyType, fuelType, transmission, specs, condition, sellerType, ...searchLevel } = params;
    
    applySearch(searchLevel);
    
    // Route filter-category params through FilterParams (they already exist there)
    const filterUpdates: Record<string, any> = {};
    if (bodyType?.length) filterUpdates.bodyType = bodyType;
    if (fuelType?.length) filterUpdates.fuelType = fuelType;
    if (transmission?.length) filterUpdates.transmission = transmission;
    if (specs?.length) filterUpdates.specs = specs;
    if (condition) filterUpdates.condition = condition;
    if (sellerType) filterUpdates.sellerType = sellerType;
    
    if (Object.keys(filterUpdates).length > 0) {
      updateFilterParams(filterUpdates);
    }
  }, [applySearch, updateFilterParams]);

  const handleSortPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSortOpen(true);
  }, []);

  const handleSortClose = useCallback(() => {
    setIsSortOpen(false);
  }, []);

  const handleSortChange = useCallback((sort: SearchSortOption) => {
    applySort(sort);
  }, [applySort]);

  // Determine which tab is active
  const getIsActive = (tab: TabRoute) => {
    if (tab.name === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname === tab.path || pathname === `/(tabs)/${tab.name}`;
  };

  // ── Hard hide: return null AFTER all hooks ─────────────────────
  // Hide on blocklisted screens OR when context says hidden (except on browse tab)
  if (shouldHide || shouldHideByContext) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Active Search Chips - positioned above tab bar */}
      <View style={[
        styles.chipsWrapper,
        { bottom: 52 + insets.bottom + 6 + 12 } // Tab bar height + padding + gap
      ]}>
        <ActiveSearchChips visible={showSearchBubble && hasActiveSearch} />
      </View>

      <View style={[styles.tabBarContent, { paddingBottom: insets.bottom + 6 }]}>
        <View style={styles.navGroup}>
          {/* Back bubble */}
          <AnimatedPressable
            onPress={handleBack}
            style={[
              styles.backBubble,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              backBubbleStyle,
            ]}
            pointerEvents={showBackButton ? 'auto' : 'none'}
          >
            <ChevronLeft
              size={22}
              color={colors.text}
              strokeWidth={2}
            />
          </AnimatedPressable>

          {/* Pill Group */}
          <AnimatedView style={[
            styles.pillWrapper, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }, 
            pillStyle
          ]}>
            <View style={styles.pillContent}>
              {TABS.map((tab) => {
                const isActive = getIsActive(tab);
                const Icon = tab.icon;

                const iconColor = isActive 
                  ? colors.text
                  : colors.iconMuted;

                return (
                  <HapticPressable
                    key={tab.name}
                    onPress={() => handleTabPress(tab)}
                    style={styles.pillTab}
                  >
                    <View>
                      <Icon
                        size={22}
                        color={iconColor}
                        fill={isActive ? iconColor : colors.surface}
                        strokeWidth={2}
                      />
                      {tab.name === 'messages' && messagesUnread > 0 && (
                        <View style={[styles.unreadDot, { backgroundColor: '#3B82F6' }]} />
                      )}
                    </View>
                  </HapticPressable>
                );
              })}
            </View>
          </AnimatedView>

          {/* Search bubble (appears on browse tab) */}
          <AnimatedPressable
            onPress={handleSearchPress}
            style={[
              styles.searchBubble,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              searchBubbleStyle,
            ]}
            pointerEvents={showSearchBubble ? 'auto' : 'none'}
          >
            <Search
              size={22}
              color={colors.text}
              strokeWidth={2}
            />
          </AnimatedPressable>

          {/* Sort bubble (appears on browse tab) */}
          <AnimatedPressable
            onPress={handleSortPress}
            style={[
              styles.sortBubble,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              sortBubbleStyle,
            ]}
            pointerEvents={showSearchBubble ? 'auto' : 'none'}
          >
            <ArrowUpDown
              size={20}
              color={colors.text}
              strokeWidth={2}
            />
          </AnimatedPressable>

          {/* Create bubble (appears on home tab) */}
          <AnimatedPressable
            onPress={handleCreatePress}
            style={[
              styles.createBubble,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              createBubbleStyle,
            ]}
            pointerEvents={showCreateBubble ? 'auto' : 'none'}
          >
            <Plus
              size={22}
              color={colors.text}
              strokeWidth={2}
            />
          </AnimatedPressable>
        </View>
      </View>

      {/* Search Sheet */}
      <SearchSheet
        visible={isSearchOpen}
        onClose={handleSearchClose}
        onSearch={handleSearchSubmit}
      />

      {/* Sort Sheet */}
      <SortSheet
        visible={isSortOpen}
        onClose={handleSortClose}
        currentSort={sortBy}
        onSortChange={handleSortChange}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  chipsWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  pillWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 4,
  },
  pillTab: {
    width: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  searchBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  sortBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  createBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
