import { Layout, Sizes, Spacing } from '@/constants/theme';

export const ACTIVE_CHIPS_HEIGHT = Sizes.pillHeight;

export const getTabBarBottomPadding = (bottomInset: number) =>
  Math.max(bottomInset, Spacing.md);

export const getTabBarOverlayHeight = (bottomInset: number) =>
  Math.max(
    Layout.tabBarHeight,
    Sizes.actionButtonLg + Spacing['2xl'] + getTabBarBottomPadding(bottomInset)
  );

export const getTabBarContentInset = (bottomInset: number, extra = 0) =>
  getTabBarOverlayHeight(bottomInset) + extra;
