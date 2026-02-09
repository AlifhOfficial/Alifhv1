/**
 * TabBar - Tab navigation for search sheet
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Body } from '@/components/ui';
import type { TabType, ThemedComponentProps } from '../types';

interface TabBarProps extends ThemedComponentProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedMakesCount: number;
  selectedModelsCount: number;
  selectedTrimsCount: number;
}

const TABS: TabType[] = ['search', 'makes', 'models', 'trims'];

export function TabBar({
  activeTab,
  onTabChange,
  selectedMakesCount,
  selectedModelsCount,
  selectedTrimsCount,
  colors,
}: TabBarProps) {
  const getTabCount = (tab: TabType): number => {
    switch (tab) {
      case 'makes':
        return selectedMakesCount;
      case 'models':
        return selectedModelsCount;
      case 'trims':
        return selectedTrimsCount;
      default:
        return 0;
    }
  };

  const isTabDisabled = (tab: TabType): boolean => {
    if (tab === 'models') return selectedMakesCount === 0;
    if (tab === 'trims') return selectedModelsCount === 0;
    return false;
  };

  const getTabLabel = (tab: TabType): string => {
    const label = tab.charAt(0).toUpperCase() + tab.slice(1);
    const count = getTabCount(tab);
    return count > 0 ? `${label} (${count})` : label;
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        const isDisabled = isTabDisabled(tab);

        return (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              isActive && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => !isDisabled && onTabChange(tab)}
            disabled={isDisabled}
          >
            <Body
              size="small"
              style={[
                styles.tabText,
                {
                  color: isDisabled
                    ? colors.textTertiary
                    : isActive
                    ? colors.primary
                    : colors.textSecondary,
                  fontFamily: isActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                },
              ]}
            >
              {getTabLabel(tab)}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabText: {},
});
