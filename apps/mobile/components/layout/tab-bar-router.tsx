/**
 * TabBarRouter - Routes to the correct tab bar based on current pathname
 * Replaces GlobalTabBar with tab-specific implementations
 */

import React from 'react';
import { usePathname } from 'expo-router';

import { useTabBar } from '@/context/tab-bar-context';
import { HomeTabBar } from '@/components/home/home-tab-bar';
import { BrowseTabBar } from '@/components/browse/browse-tab-bar';
import { BlkTabBar } from '@/components/blk/blk-tab-bar';
import { DefaultTabBar } from '@/components/layout/tab-bar';

/**
 * Screens that must NEVER show the tab bar.
 */
const HIDE_TAB_BAR_PATHS = [
  '/create-listing',
  '/inventory',
];

// Check if pathname is on browse tab
const isBrowsePath = (path: string) => {
  const normalized = path.toLowerCase();
  return normalized === '/browse' || 
         normalized.endsWith('/browse') ||
         normalized.includes('/browse');
};

// Check if pathname is on BLK tab
const isBlkPath = (path: string) => {
  const normalized = path.toLowerCase();
  return normalized === '/blk' || normalized.endsWith('/blk');
};

// Check if pathname is on home tab
const isHomePath = (path: string) => {
  return path === '/' || path === '/(tabs)' || path === '/(tabs)/index';
};

// Main tab paths (don't show back button)
const MAIN_TAB_PATHS = ['/', '/messages', '/(tabs)', '/(tabs)/index'];

export function TabBarRouter() {
  const pathname = usePathname();
  const { isTabBarVisible } = useTabBar();

  // Check current tab
  const onBrowseTab = isBrowsePath(pathname);
  const onBlkTab = isBlkPath(pathname);
  const onHomeTab = isHomePath(pathname);

  // Hard hide: never render on blocklisted screens
  const shouldHide = HIDE_TAB_BAR_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  // Respect isTabBarVisible from context, but ALWAYS show on browse/BLK tab
  const shouldHideByContext = !isTabBarVisible && !onBrowseTab && !onBlkTab;

  if (shouldHide || shouldHideByContext) {
    return null;
  }

  // Route to specific tab bar
  if (onHomeTab) {
    return <HomeTabBar />;
  }

  if (onBrowseTab) {
    return <BrowseTabBar />;
  }

  if (onBlkTab) {
    return <BlkTabBar />;
  }

  // Default: show back + tabs pill
  // For messages tab specifically, don't show back button
  const showBack = !MAIN_TAB_PATHS.includes(pathname);
  return <DefaultTabBar showBack={showBack} />;
}
