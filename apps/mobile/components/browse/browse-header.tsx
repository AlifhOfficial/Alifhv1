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
import { LayoutGrid, List } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Layout, Radius, Sizes } from '@/constants/theme';
import { Data, Label } from '@/components/ui';
import { ProfileMenu } from '@/components/home/profile-menu';

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
  onBrowsePress?: () => void;
}

export function BrowseHeader({ 
  pills = [], 
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
  onBrowsePress,
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

  const handleBrowsePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onBrowsePress?.();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Avatar */}
        <ProfileMenu />

        {/* Browse Title Pill */}
        <View
          style={[
            styles.pill,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBg,
            },
          ]}
        >
          <HapticPressable onPress={handleBrowsePress} style={styles.pillInner}>
            {({ pressed }) => (
              <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                <LayoutGrid size={Sizes.iconXs} color={colors.icon} strokeWidth={2} />
                <Data size="small">Browse</Data>
              </View>
            )}
          </HapticPressable>
        </View>

        {/* Filters pill */}
        <View
          style={[
            styles.pill,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBg,
            },
          ]}
        >
          <HapticPressable onPress={handleSettingsPress} style={styles.pillInner}>
            {({ pressed }) => (
              <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                <Data size="small">Filters</Data>
                {settingsCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.text }]}>
                    <Label size="badge" uppercase={false} style={{ color: colors.bg }}>
                      {settingsCount > 9 ? '9+' : settingsCount}
                    </Label>
                  </View>
                )}
              </View>
            )}
          </HapticPressable>
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
                backgroundColor: colors.glassBg,
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
                      <Label size="badge" uppercase={false} style={{ color: colors.bg }}>
                        {pill.activeCount}
                      </Label>
                    </View>
                  )}
                </View>
              )}
            </HapticPressable>
          </View>
        ))}

        {/* View Mode Toggle */}
        <View
          style={[
            styles.iconButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBg,
            },
          ]}
        >
          <HapticPressable onPress={handleViewModeToggle} style={styles.iconButtonInner}>
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.7 : 1 }}>
                {viewMode === 'grid' ? (
                  <LayoutGrid size={Sizes.iconSm} color={colors.icon} strokeWidth={2} />
                ) : (
                  <List size={Sizes.iconSm} color={colors.icon} strokeWidth={2} />
                )}
              </View>
            )}
          </HapticPressable>
        </View>
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
  },
  iconButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
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
  pill: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Sizes.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    width: Sizes.iconSm,
    height: Sizes.iconSm,
    borderRadius: Sizes.iconSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
