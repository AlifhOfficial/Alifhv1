import { Layout, Sizes, Spacing } from '@/constants/theme';

export const getTabBarBottomPadding = (bottomInset: number) =>
  Math.max(bottomInset, Spacing.md);

export const getTabBarOverlayHeight = (bottomInset: number) =>
  Math.max(
    Layout.tabBarHeight,
    Sizes.pillHeightMd + Spacing.xl + getTabBarBottomPadding(bottomInset)
  );

export const getTabBarContentInset = (bottomInset: number, extra = 0) =>
  getTabBarOverlayHeight(bottomInset) + extra;
