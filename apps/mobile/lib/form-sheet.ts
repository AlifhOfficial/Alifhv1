import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { Layout, Radius, Spacing, type ColorPalette } from '@/constants/theme';

function getAndroidDetachedSheetContentStyle(
  colors: ColorPalette,
): NonNullable<NativeStackNavigationOptions['contentStyle']> {
  return {
    backgroundColor: colors.sheet,
    marginHorizontal: Layout.screenPadding - Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.sheetBorder,
  };
}

export function getFormSheetContentStyle(
  colors: ColorPalette,
): NativeStackNavigationOptions['contentStyle'] {
  if (Platform.OS === 'android') {
    return getAndroidDetachedSheetContentStyle(colors);
  }

  return {
    backgroundColor: colors.sheet,
  };
}

export function createFormSheetOptions(
  colors: ColorPalette,
  overrides: NativeStackNavigationOptions = {},
): NativeStackNavigationOptions {
  const baseContentStyle = getFormSheetContentStyle(colors);

  return {
    presentation: 'formSheet',
    sheetGrabberVisible: true,
    sheetExpandsWhenScrolledToEdge: false,
    headerShown: false,
    ...overrides,
    contentStyle: overrides.contentStyle
      ? [baseContentStyle, overrides.contentStyle]
      : baseContentStyle,
  };
}
