/**
 * Saved Header - Matches home-header and messages-header style
 * Absolute positioning with glass UI pills
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Heart, Sparkles } from 'lucide-react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';

import { Data } from '@/components/ui';
import { Colors, Spacing, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { SavedTab } from './types';

interface SavedHeaderProps {
  activeTab: SavedTab;
  onTabChange: (tab: SavedTab) => void;
}

const TABS: { key: SavedTab; icon: typeof Heart }[] = [
  { key: 'favorites', icon: Heart },
  { key: 'superlikes', icon: Sparkles },
];

export function SavedHeader({ 
  activeTab, 
  onTabChange,
}: SavedHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const handleTab = (tab: SavedTab) => {
    if (tab === activeTab) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(tab);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      {/* Left section with profile and title */}
      <View style={styles.leftSection}>
        {/* Title pill */}
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
            <Bookmark size={Sizes.iconXs} color={colors.icon} strokeWidth={2} />
            <Data size="small">Saved</Data>
          </View>
        </View>
      </View>

      {/* Tab bubbles - icon-only circular glass bubbles */}
      <View style={styles.pillRow}>
        {TABS.map(({ key, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <View
              key={key}
              style={[
                styles.iconButton,
                styles.glass,
                {
                  backgroundColor: colors.glassBg,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <HapticPressable
                onPress={() => handleTab(key)}
                style={styles.iconButtonInner}
              >
                {({ pressed }) => (
                  <Icon 
                    size={Sizes.iconSm} 
                    color={isActive ? colors.icon : colors.textMuted} 
                    strokeWidth={2}
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  />
                )}
              </HapticPressable>
            </View>
          );
        })}
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
    zIndex: 20,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
  },
  pillRow: {
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
  iconButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
