/**
 * Browse Header - Filter pills row
 * Matches ProfileHeader layout pattern for consistency
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
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* View Mode Toggle */}
        <View
          style={[
            styles.iconButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          <HapticPressable onPress={handleViewModeToggle} style={styles.iconButtonInner}>
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
        </View>

        {/* Settings bubble */}
        <View>
          <View
            style={[
              styles.iconButton,
              styles.glass,
              {
                borderColor: colors.glassBorder,
                backgroundColor: colors.glassBackground,
              },
            ]}
          >
            <HapticPressable onPress={handleSettingsPress} style={styles.iconButtonInner}>
              {({ pressed }) => (
                <View style={{ opacity: pressed ? 0.7 : 1 }}>
                  <Settings2 
                    size={20} 
                    color={colors.text} 
                    strokeWidth={2}
                  />
                </View>
              )}
            </HapticPressable>
          </View>
          {settingsCount > 0 && (
            <View
              style={[
                styles.settingsBadge,
                { backgroundColor: colors.text, borderColor: colors.background },
              ]}
            >
              <Label size="badge" uppercase={false} style={{ color: colors.background }}>
                {settingsCount > 9 ? '9+' : settingsCount}
              </Label>
            </View>
          )}
        </View>

        {/* Filter pills */}
        {pills.map((pill) => (
          <View
            key={pill.type}
            style={[
              styles.pill,
              styles.glass,
              {
                borderColor: colors.glassBorder,
                backgroundColor: colors.glassBackground,
              },
            ]}
          >
            <HapticPressable onPress={() => handlePress(pill.type)} style={styles.pillInner}>
              {({ pressed }) => (
                <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                  <Data
                    size="small"
                    numberOfLines={1}
                  >
                    {pill.label}
                  </Data>
                  {pill.activeCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.text }]}>
                      <Label size="badge" uppercase={false} style={{ color: colors.background }}>
                        {pill.activeCount}
                      </Label>
                    </View>
                  )}
                </View>
              )}
            </HapticPressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
    paddingRight: Layout.screenPadding,
  },
  glass: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  iconButton: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 2,
  },
  pill: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  pillInner: {
    paddingHorizontal: 12,
    height: Layout.hitTarget,
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
});
