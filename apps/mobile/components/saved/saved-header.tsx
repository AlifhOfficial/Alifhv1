/**
 * Saved Header - Title + pill tabs for Favourites / Superlikes
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';

import { Heading, Body } from '@/components/ui';
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

      {/* Pill tabs */}
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
                  backgroundColor: active ? colors.text : 'transparent',
                  borderColor: active ? colors.text : colors.border,
                },
              ]}
            >
              <Body
                size="small"
                style={{
                  color: active ? colors.surface : colors.textSecondary,
                  fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium',
                }}
              >
                {label}{count > 0 ? ` ${count}` : ''}
              </Body>
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
});
