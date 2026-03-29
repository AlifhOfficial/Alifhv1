import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EdgeFade } from '@/components/ui';
import { Layout, ZIndex } from '@/constants/theme';

export function FooterFade() {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="none" style={styles.container}>
      <EdgeFade
        edge="bottom"
        height={insets.bottom + Layout.bottomGradientExtension}
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
