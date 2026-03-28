/**
 * Settings Header Component
 * Glass pill style matching other headers
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Settings2 } from 'lucide-react-native';

import { Data } from '@/components/ui';
import { Spacing, Layout, Sizes, ZIndex} from '@/constants/theme';
import type { ThemeColors } from './types';

interface SettingsHeaderProps {
  colors: ThemeColors;
  topInset: number;
}

export function SettingsHeader({
  colors,
  topInset,
}: SettingsHeaderProps) {
  return (
    <View style={[styles.header, { paddingTop: topInset + Layout.headerPadding }]}>
      {/* Settings Title Pill */}
      <View
        style={[
          styles.pillButton,
          styles.glass,
          {
            borderColor: colors.glassBorder,
            backgroundColor: colors.glassBg,
          },
        ]}
      >
        <View style={styles.pillContent}>
          <Settings2 size={Sizes.iconXs} color={colors.icon} strokeWidth={2} />
          <Data size="bodySm">Settings</Data>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
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
