/**
 * Messages Header - Mobile Native
 * Matches home-header style with absolute positioning
 */

import { Text } from '@/components/ui';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { Colors, Spacing, Layout, Sizes, ZIndex} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export function MessagesHeader() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      <View
        style={[
          styles.pillButton,
          styles.glass,
          {
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.pillContent}>
          <MessageCircle size={Sizes.iconXs} color={colors.label} strokeWidth={2} />
          <Text variant="bodySm">Messages</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
  },
  glass: {
    borderWidth: 1,
  },
  pillButton: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Sizes.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
