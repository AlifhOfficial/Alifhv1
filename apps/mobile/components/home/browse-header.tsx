/**
 * Browse Header - Floating header with integrated filter pills
 * Positioned absolute like GlobalTabBar for floating effect
 * Revvup Design System + Inter font
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import { Settings2, LayoutGrid, List, Sparkles } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { Heading, Body, Label } from '@/components/ui';

export type ViewMode = 'grid' | 'list';
export type FilterPillType = 'make' | 'model' | 'price' | 'yearMileage' | 'location';

interface FilterPillConfig {
  type: FilterPillType;
  label: string;
  activeCount: number;
}

interface BrowseHeaderProps {
  pills?: FilterPillConfig[];
  onPillPress?: (type: FilterPillType) => void;
  onSettingsPress?: () => void;
  settingsCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onAmnaPress?: () => void;
}

export function BrowseHeader({ 
  pills = [], 
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
  onAmnaPress,
}: BrowseHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const handlePress = (type: FilterPillType) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPillPress?.(type);
  };

  const handleSettingsPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSettingsPress?.();
  };

  const handleViewModeToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    onViewModeChange?.(newMode);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md, backgroundColor: colors.background, paddingHorizontal: Spacing.lg }]}>
      {/* Title */}
      <Heading size="large">Browse</Heading>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amna AI Pill */}
        {onAmnaPress && (
          <HapticPressable
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onAmnaPress();
            }}
            style={[
              styles.amnaPill,
              {
                backgroundColor: colors.background,
                borderColor: 'rgba(139, 92, 246, 0.30)',
              },
            ]}
          >
            {({ pressed }) => (
              <View style={[styles.pillContent, { opacity: pressed ? 0.8 : 1 }]}>
                <Sparkles size={14} color="#8B5CF6" strokeWidth={2.5} />
                <Body
                  size="small"
                  style={[styles.pillLabel, { color: '#8B5CF6', fontFamily: 'Inter_600SemiBold' }]}
                  numberOfLines={1}
                >
                  Amna
                </Body>
              </View>
            )}
          </HapticPressable>
        )}

        {/* Settings bubble */}
        <HapticPressable
          onPress={handleSettingsPress}
          style={[
            styles.settingsBubble,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {({ pressed }) => (
            <View style={[styles.settingsContent, { opacity: pressed ? 0.7 : 1 }]}>
              <Settings2 
                size={20} 
                color={colors.text} 
                strokeWidth={2}
              />
              {settingsCount > 0 && (
                <View
                  style={[
                    styles.settingsBadge,
                    { backgroundColor: colors.text, borderColor: colors.background },
                  ]}
                >
                  <Label size="badge" uppercase={false} style={[styles.settingsBadgeText, { color: colors.background }]}>
                    {settingsCount > 9 ? '9+' : settingsCount}
                  </Label>
                </View>
              )}
            </View>
          )}
        </HapticPressable>

        {/* Individual floating pills */}
        {pills.map((pill) => {
          const isActive = pill.activeCount > 0;
          
          return (
            <HapticPressable
              key={pill.type}
              onPress={() => handlePress(pill.type)}
              style={[
                styles.pill,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {({ pressed }) => (
                <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                  <Body
                    size="small"
                    style={styles.pillLabel}
                    numberOfLines={1}
                  >
                    {pill.label}
                  </Body>
                  {pill.activeCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.text }]}>
                      <Label size="badge" uppercase={false} style={[styles.badgeText, { color: colors.background }]}>
                        {pill.activeCount}
                      </Label>
                    </View>
                  )}
                </View>
              )}
            </HapticPressable>
          );
        })}

        {/* View Mode Toggle */}
        <HapticPressable
          onPress={handleViewModeToggle}
          style={[
            styles.viewModeBubble,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {({ pressed }) => (
            <View style={[styles.viewModeContent, { opacity: pressed ? 0.7 : 1 }]}>
              {viewMode === 'grid' ? (
                <LayoutGrid size={18} color={colors.text} strokeWidth={2} />
              ) : (
                <List size={18} color={colors.text} strokeWidth={2} />
              )}
            </View>
          )}
        </HapticPressable>
      </ScrollView>
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
    flexDirection: 'column',
    gap: Spacing.md,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  settingsBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  settingsContent: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 2,
  },
  settingsBadgeText: {
    // Typography handled by <Label size="badge"> component
  },
  pill: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillLabel: {
    // Typography handled by <Body size="small"> component
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    // Typography handled by <Label size="badge"> component
  },
  viewModeBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeContent: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amnaPill: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
});
