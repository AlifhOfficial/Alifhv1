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
import { Settings2, LayoutGrid, List } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Layout, Radius } from '@/constants/theme';
import { Data, Label } from '@/components/ui';

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
}

export function BrowseHeader({ 
  pills = [], 
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
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
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding, paddingHorizontal: Layout.screenPadding }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* View Mode Toggle */}
        <HapticPressable
          onPress={handleViewModeToggle}
          style={[
            styles.iconBubble,
            { 
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.7 : 1 }}>
              {viewMode === 'grid' ? (
                <LayoutGrid size={18} color={colors.text} strokeWidth={2} />
              ) : (
                <List size={18} color={colors.text} strokeWidth={2} />
              )}
            </View>
          )}
        </HapticPressable>

        {/* Settings bubble */}
        <HapticPressable
          onPress={handleSettingsPress}
          style={[
            styles.iconBubble,
            { 
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {({ pressed }) => (
            <View style={[styles.iconBubbleInner, { opacity: pressed ? 0.7 : 1 }]}>
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
          return (
            <HapticPressable
              key={pill.type}
              onPress={() => handlePress(pill.type)}
              style={[
                styles.pill,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              {({ pressed }) => (
                <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                  <Data
                    size="small"
                    tone="secondary"
                    numberOfLines={1}
                  >
                    {pill.label}
                  </Data>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 20,
    paddingBottom: Spacing.sm,
    flexDirection: 'column',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
    paddingRight: Layout.screenPadding,
  },
  iconBubble: {
    padding: 4,
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleInner: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
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
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
});
