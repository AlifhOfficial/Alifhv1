import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EdgeFade } from '@/components/ui';
import { Layout, ZIndex } from '@/constants/theme';

interface FooterFadeProps {
  height?: number;
}

export function FooterFade({ height }: FooterFadeProps) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const routeSegments = segments as string[];
  const hideForMessages =
    routeSegments.includes('(messages)') ||
    routeSegments.includes('chat') ||
    routeSegments.some((segment) => segment.startsWith('[conversationId]'));

  if (hideForMessages) {
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
