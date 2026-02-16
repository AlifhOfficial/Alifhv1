/**
 * Global Tab Bar - Renders on all screens
 * Uses expo-router navigation
 * Includes search bubble and sort bubble on browse tab
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { HapticPressable, ConfettiBurst, useConfettiBurst, Body } from '@/components/ui';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Home, MessageCircle, LayoutGrid, ChevronLeft, Search, ArrowUpDown, Plus, Zap } from 'lucide-react-native';
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
import { Colors, Layout, Sizes, Spacing } from '@/constants/theme';
import { SearchSheet, SortSheet, AmnaSheet, ActiveFiltersSheet, CreateListingFlow } from '@/components/sheets';
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
const MAIN_TAB_PATHS = ['/', '/messages', '/browse', '/(tabs)', '/(tabs)/index'];

// Check if pathname is on browse tab - more robust matching
const isBrowsePath = (path: string) => {
  const normalized = path.toLowerCase();
  return normalized === '/browse' || 
         normalized.endsWith('/browse') ||
         normalized.includes('/browse');
};

// Check if pathname is on home tab
const isHomePath = (path: string) => {
  return path === '/' || path === '/(tabs)' || path === '/(tabs)/index';
};

// Gap between bubbles uses standard spacing
const GAP = Spacing.sm;

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
  const { applySearch, sortBy, applySort, searchParams, filterParams, updateFilterParams, triggerScrollToTop, getSearchChips } = useSearch();
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
  const [isAmnaOpen, setIsAmnaOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Check if current screen is NOT a main tab OR is on browse tab (show back button)
  const showBackButton = !MAIN_TAB_PATHS.includes(pathname) || onBrowseTab;

  // Show search/sort bubbles on browse tab
  const showSearchBubble = onBrowseTab;

  // Show main tabs pill only when NOT on browse tab
  const showMainTabs = !onBrowseTab;

  // Check if on home tab (show create bubble) - use robust matching
  const showCreateBubble = isHomePath(pathname);

  // Check if we have active search, filters, or non-default sort
  const chips = getSearchChips();
  const activeFilterCount = chips.length;

  // Animation values
  const progress = useSharedValue(showBackButton ? 1 : 0);
  const createProgress = useSharedValue(showCreateBubble ? 1 : 0);
  const filterProgress = useSharedValue(activeFilterCount > 0 && showSearchBubble ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(showBackButton ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [showBackButton]);

  React.useEffect(() => {
    createProgress.value = withTiming(showCreateBubble ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [showCreateBubble]);

  React.useEffect(() => {
    filterProgress.value = withTiming(activeFilterCount > 0 && showSearchBubble ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [activeFilterCount, showSearchBubble]);

  // Back bubble animates in from left
  const backBubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(progress.value, [0, 1], [0, 1]) },
      ],
      width: interpolate(progress.value, [0, 1], [0, Sizes.bubbleLg]),
      marginRight: interpolate(progress.value, [0, 1], [0, GAP]),
    };
  });

  // Create bubble animates in from right (on home tab)
  const createBubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(createProgress.value, [0, 1], [0, 1]) },
      ],
      width: interpolate(createProgress.value, [0, 1], [0, Sizes.bubbleLg]),
      marginLeft: interpolate(createProgress.value, [0, 1], [0, GAP]),
    };
  });

  // Filter bubble animates in from right (on browse tab when filters active)
  const filterBubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(filterProgress.value, [0, 1], [0, 1]) },
      ],
      width: interpolate(filterProgress.value, [0, 1], [0, Sizes.bubbleLg]),
      marginLeft: interpolate(filterProgress.value, [0, 1], [0, GAP]),
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
    setIsCreateOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setIsCreateOpen(false);
  }, []);

  const handleCreateSuccess = useCallback((listingId: string) => {
    setIsCreateOpen(false);
    router.push(`/listing/${listingId}` as any);
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

  // Confetti for Amna AI bubble
  const amnaConfetti = useConfettiBurst();

  const handleAmnaPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    amnaConfetti.fire({ colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#7C3AED', '#6D28D9', '#DDD6FE'], count: 12 });
    setIsAmnaOpen(true);
  }, [amnaConfetti]);

  const handleAmnaClose = useCallback(() => {
    setIsAmnaOpen(false);
  }, []);

  const handleAmnaSearch = useCallback((params: Record<string, any>) => {
    // Split into search-level vs filter-level params
    const { make, model, trim, tags, extras, q, ...filterLevel } = params;
    
    // Apply search-level params
    const searchLevel: Record<string, any> = {};
    if (make?.length) searchLevel.make = make;
    if (model?.length) searchLevel.model = model;
    if (trim?.length) searchLevel.trim = trim;
    if (tags?.length) searchLevel.tags = tags;
    if (extras?.length) searchLevel.extras = extras;
    if (q) searchLevel.q = q;
    
    if (Object.keys(searchLevel).length > 0) {
      applySearch(searchLevel);
    }
    
    // Apply filter-level params
    const filterUpdates: Record<string, any> = {};
    if (filterLevel.bodyType?.length) filterUpdates.bodyType = filterLevel.bodyType;
    if (filterLevel.fuelType?.length) filterUpdates.fuelType = filterLevel.fuelType;
    if (filterLevel.transmission?.length) filterUpdates.transmission = filterLevel.transmission;
    if (filterLevel.specs?.length) filterUpdates.specs = filterLevel.specs;
    if (filterLevel.exteriorColor?.length) filterUpdates.exteriorColor = filterLevel.exteriorColor;
    if (filterLevel.interiorColor?.length) filterUpdates.interiorColor = filterLevel.interiorColor;
    if (filterLevel.engineSize?.length) filterUpdates.engineSize = filterLevel.engineSize;
    if (filterLevel.emirate?.length) filterUpdates.emirate = filterLevel.emirate;
    if (filterLevel.priceMin) filterUpdates.priceMin = filterLevel.priceMin;
    if (filterLevel.priceMax) filterUpdates.priceMax = filterLevel.priceMax;
    if (filterLevel.yearMin) filterUpdates.yearMin = filterLevel.yearMin;
    if (filterLevel.yearMax) filterUpdates.yearMax = filterLevel.yearMax;
    if (filterLevel.mileageMax) filterUpdates.mileageMax = filterLevel.mileageMax;
    if (filterLevel.condition) filterUpdates.condition = filterLevel.condition;
    if (filterLevel.sellerType) filterUpdates.sellerType = filterLevel.sellerType;
    
    if (Object.keys(filterUpdates).length > 0) {
      updateFilterParams(filterUpdates);
    }
    
    // Handle sort
    if (filterLevel.sortBy) {
      applySort(filterLevel.sortBy);
    }
  }, [applySearch, updateFilterParams, applySort]);

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

  const handleFiltersPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFiltersOpen(true);
  }, []);

  const handleFiltersClose = useCallback(() => {
    setIsFiltersOpen(false);
  }, []);

  // Determine which tab is active
  const getIsActive = (tab: TabRoute) => {
    if (tab.name === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname === tab.path;
  };

  // ── Hard hide: return null AFTER all hooks ─────────────────────
  // Hide on blocklisted screens OR when context says hidden (except on browse tab)
  if (shouldHide || shouldHideByContext) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.tabBarContent, { paddingBottom: insets.bottom + Spacing.xs }]}>
        <View style={styles.navGroup}>
          {/* Back bubble */}
          <AnimatedPressable
            onPress={handleBack}
            style={[
              styles.backBubble,
              styles.glass,
              {
                borderColor: colors.glassBorder,
              },
              backBubbleStyle,
            ]}
            pointerEvents={showBackButton ? 'auto' : 'none'}
          >
            <View style={[StyleSheet.absoluteFill, { borderRadius: Sizes.bubbleLg / 2, overflow: 'hidden', backgroundColor: colors.glassBackground }]} />
            <ChevronLeft
              size={Sizes.iconMd}
              color={colors.text}
              strokeWidth={2}
            />
          </AnimatedPressable>

          {/* Pill Group - hidden on browse tab */}
          {showMainTabs && (
            <AnimatedView style={[
              styles.pillWrapper, 
              styles.glass,
              {
                borderColor: colors.glassBorder,
              }, 
              pillStyle
            ]}>
              <View style={[StyleSheet.absoluteFill, { borderRadius: Sizes.bubbleLg / 2, overflow: 'hidden', backgroundColor: colors.glassBackground }]} />
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
                          size={Sizes.iconMd}
                          color={iconColor}
                          fill={isActive ? iconColor : 'none'}
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
          )}

          {/* Search bubble (appears on browse tab) */}
          {showSearchBubble && (
            <HapticPressable
              onPress={handleSearchPress}
              style={[
                styles.actionBubble,
                styles.glass,
                {
                  borderColor: colors.glassBorder,
                  marginLeft: GAP,
                },
              ]}
            >
              <View style={[StyleSheet.absoluteFill, { borderRadius: Sizes.bubbleLg / 2, overflow: 'hidden', backgroundColor: colors.glassBackground }]} />
              <Search
                size={Sizes.iconMd}
                color={colors.text}
                strokeWidth={2}
              />
            </HapticPressable>
          )}

          {/* Amna AI bubble (appears on browse tab) */}
          {showSearchBubble && (
            <View style={{ overflow: 'visible', marginLeft: GAP }}>
              <HapticPressable
                onPress={handleAmnaPress}
                style={[
                  styles.actionBubble,
                  styles.glass,
                  {
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <View style={[StyleSheet.absoluteFill, { borderRadius: Sizes.bubbleLg / 2, overflow: 'hidden', backgroundColor: colors.glassBackground }]} />
                <Zap
                  size={Sizes.iconMd}
                  color="#8B5CF6"
                  strokeWidth={2}
                />
              </HapticPressable>
              <ConfettiBurst ref={amnaConfetti.ref} />
            </View>
          )}

          {/* Sort bubble (appears on browse tab) */}
          {showSearchBubble && (
            <HapticPressable
              onPress={handleSortPress}
              style={[
                styles.actionBubble,
                styles.glass,
                {
                  borderColor: colors.glassBorder,
                  marginLeft: GAP,
                },
              ]}
            >
              <View style={[StyleSheet.absoluteFill, { borderRadius: Sizes.bubbleLg / 2, overflow: 'hidden', backgroundColor: colors.glassBackground }]} />
              <ArrowUpDown
                size={Sizes.iconMd}
                color={colors.text}
                strokeWidth={2}
              />
            </HapticPressable>
          )}

          {/* Filter bubble (appears on browse tab when filters active) */}
          <AnimatedPressable
            onPress={handleFiltersPress}
            style={[
              styles.filterBubble,
              styles.glass,
              {
                borderColor: colors.glassBorder,
              },
              filterBubbleStyle,
            ]}
            pointerEvents={activeFilterCount > 0 && showSearchBubble ? 'auto' : 'none'}
          >
            <View style={[StyleSheet.absoluteFill, { borderRadius: Sizes.bubbleLg / 2, overflow: 'hidden', backgroundColor: colors.glassBackground }]} />
            <Body tone="secondary">
              {activeFilterCount > 9 ? '9+' : activeFilterCount}
            </Body>
          </AnimatedPressable>

          {/* Create bubble (appears on home tab) */}
          <AnimatedPressable
            onPress={handleCreatePress}
            style={[
              styles.createBubble,
              styles.glass,
              {
                borderColor: colors.glassBorder,
              },
              createBubbleStyle,
            ]}
            pointerEvents={showCreateBubble ? 'auto' : 'none'}
          >
            <View style={[StyleSheet.absoluteFill, { borderRadius: Sizes.bubbleLg / 2, overflow: 'hidden', backgroundColor: colors.glassBackground }]} />
            <Plus
              size={Sizes.iconMd}
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

      {/* Amna AI Sheet */}
      <AmnaSheet
        visible={isAmnaOpen}
        onClose={handleAmnaClose}
        onSearch={handleAmnaSearch}
      />

      {/* Active Filters Sheet */}
      <ActiveFiltersSheet
        visible={isFiltersOpen}
        onClose={handleFiltersClose}
      />

      {/* Create Listing Flow */}
      <CreateListingFlow
        visible={isCreateOpen}
        onClose={handleCreateClose}
        onSuccess={handleCreateSuccess}
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
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Layout.headerPadding,
    paddingBottom: Spacing.md,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glass: {
    borderWidth: 1,
  },
  backBubble: {
    width: Sizes.bubbleLg,
    height: Sizes.bubbleLg,
    borderRadius: Sizes.bubbleLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillWrapper: {
    height: Sizes.bubbleLg,
    borderRadius: Sizes.bubbleLg / 2,
    overflow: 'hidden',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.xs,
  },
  pillTab: {
    width: Sizes.bubbleLg - Spacing.sm,
    height: Sizes.bubbleLg - Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (Sizes.bubbleLg - Spacing.sm) / 2,
  },
  createBubble: {
    width: Sizes.bubbleLg,
    height: Sizes.bubbleLg,
    borderRadius: Sizes.bubbleLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionBubble: {
    width: Sizes.bubbleLg,
    height: Sizes.bubbleLg,
    borderRadius: Sizes.bubbleLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filterBubble: {
    width: Sizes.bubbleLg,
    height: Sizes.bubbleLg,
    borderRadius: Sizes.bubbleLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.xs,
  },
});
