/**
 * Saved Header - Title + pill tabs for Favourites / Superlikes
 * Matches InventoryScreen filter pills styling
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';

import { Heading, Body, Label } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
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

  const getCount = (key: SavedTab) => key === 'favorites' ? favoritesCount : superlikesCount;

  return (
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
      {/* Title */}
      <Heading size="large">Saved</Heading>

      {/* Pill tabs — matches InventoryScreen filter pills */}
      <View style={styles.pillRow}>
        {TABS.map(({ key, label }) => {
          const active = activeTab === key;
          const count = getCount(key);
          return (
            <HapticPressable
              key={key}
              onPress={() => handleTab(key)}
              style={[
                styles.pill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {({ pressed }) => (
                <>
                  <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                  <Body
                    size="small"
                    style={{
                      color: active ? colors.text : colors.textSecondary,
                      fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium',
                    }}
                  >
                    {label}
                  </Body>
                  {count > 0 && (
                    <View style={[styles.pillBadge, { backgroundColor: colors.text }]}>
                      <Label
                        size="badge"
                        uppercase={false}
                        style={{ color: colors.background }}
                      >
                        {count > 99 ? '99+' : count}
                      </Label>
                    </View>
                  )}
                </View>
                </>
              )}
            </HapticPressable>
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
  pill: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
});
