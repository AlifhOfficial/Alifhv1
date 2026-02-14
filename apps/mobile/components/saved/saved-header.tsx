/**
 * Saved Header - Title + pill tabs for Favourites / Superlikes
 * Matches InventoryScreen filter pills styling
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';

import { Heading, Data } from '@/components/ui';
import { Spacing, Sizes, Radius } from '@/constants/theme';
import type { ThemeColors, SavedTab } from './types';

interface SavedHeaderProps {
  colors: ThemeColors;
  topInset: number;
  activeTab: SavedTab;
  onTabChange: (tab: SavedTab) => void;
  favoritesCount: number;
  superlikesCount: number;
}

const TABS: { key: SavedTab; label: string }[] = [
  { key: 'favorites', label: 'Favourites' },
  { key: 'superlikes', label: 'Superlikes' },
];

export function SavedHeader({ 
  colors,
  topInset,
  activeTab, 
  onTabChange,
  favoritesCount,
  superlikesCount,
}: SavedHeaderProps) {
  const handleTab = (tab: SavedTab) => {
    if (tab === activeTab) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(tab);
  };

  const getCount = (tab: SavedTab) => tab === 'favorites' ? favoritesCount : superlikesCount;

  return (
    <View style={[styles.container, { paddingTop: topInset + Spacing.sm }]}>
      {/* Title */}
      <Heading size="medium">Saved</Heading>

      {/* Pill tabs — matches InventoryScreen filter pills */}
      <View style={styles.pillRow}>
        {TABS.map(({ key, label }) => {
          const active = activeTab === key;
          const count = getCount(key);
          return (
            <View
              key={key}
              style={[
                styles.pill,
                styles.glass,
                {
                  backgroundColor: colors.glassBackground,
                  borderColor: active ? colors.textMuted : colors.glassBorder,
                },
              ]}
            >
              <HapticPressable
                onPress={() => handleTab(key)}
                style={styles.pillInner}
              >
                {({ pressed }) => (
                  <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                    <Data
                      size="small"
                      style={{ color: active ? colors.text : colors.textSecondary }}
                      numberOfLines={1}
                    >
                      {label}
                    </Data>
                    {count > 0 && (
                      <View
                        style={[
                          styles.pillBadge,
                          { backgroundColor: colors.fillSecondary },
                        ]}
                      >
                        <Data
                          size="mini"
                          style={{ color: colors.textSecondary }}
                        >
                          {count > 99 ? '99+' : count}
                        </Data>
                      </View>
                    )}
                  </View>
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
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  glass: {
    borderWidth: 1,
  },
  pill: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  pillInner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pillBadge: {
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.lg,
    minWidth: Sizes.iconSm,
    alignItems: 'center',
  },
});
