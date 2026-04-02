import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSegments, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EdgeFade } from '@/components/ui';
import { Layout, ZIndex } from '@/constants/theme';

const FORM_SHEET_ROUTES = [
  '/sort',
  '/search',
  '/menu',
  '/car-info',
  '/superlike-confirmation',
  '/superlike-exhausted',
  '/financing',
  '/phone-actions',
  '/seller-description',
  '/booking',
  '/filter-make',
  '/filter-model',
  '/filter-price',
  '/filter-year-mileage',
  '/filter-location',
  '/more-filters',
  '/active-filters',
];

interface FooterFadeProps {
  height?: number;
}

export function FooterFade({ height }: FooterFadeProps) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const pathname = usePathname();
  const routeSegments = segments as string[];

  const hideForMessages =
    routeSegments.includes('(messages)') ||
    routeSegments.includes('chat') ||
    routeSegments.some((segment) => segment.startsWith('[conversationId]'));

  const hideForSheet =
    Platform.OS === 'android' && FORM_SHEET_ROUTES.some((r) => pathname.endsWith(r));

  if (hideForMessages || hideForSheet) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      <EdgeFade
        edge="bottom"
        height={height ?? insets.bottom + Layout.bottomGradientExtension}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: ZIndex.base,
  },
});
