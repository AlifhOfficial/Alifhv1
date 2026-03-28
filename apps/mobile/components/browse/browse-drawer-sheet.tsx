import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { LayoutGrid, List } from 'lucide-react-native';

import { HapticPressable, Body, Heading, Label } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';

export type ViewMode = 'grid' | 'list';
export type FilterPillType = 'make' | 'model' | 'price' | 'yearMileage' | 'location';

export interface FilterPillConfig {
  type: FilterPillType;
  label: string;
  activeCount: number;
}

interface BrowseDrawerSheetProps {
  visible: boolean;
  onClose: () => void;
  pills?: FilterPillConfig[];
  onPillPress?: (type: FilterPillType) => void;
  onSettingsPress?: () => void;
  settingsCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function BrowseDrawerSheet({
  visible,
  onClose,
  pills = [],
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
}: BrowseDrawerSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['58%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const closeAndRun = useCallback((action?: () => void) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    bottomSheetRef.current?.dismiss();
    if (!action) return;
    setTimeout(action, 180);
  }, []);

  const handleSettingsPress = useCallback(() => {
    closeAndRun(onSettingsPress);
  }, [closeAndRun, onSettingsPress]);

  const handlePillPress = useCallback((type: FilterPillType) => {
    closeAndRun(() => onPillPress?.(type));
  }, [closeAndRun, onPillPress]);

  const handleViewModePress = useCallback((mode: ViewMode) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewModeChange?.(mode);
  }, [onViewModeChange]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
    >
      <BottomSheetView style={styles.content}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}> 
          <HapticPressable onPress={onClose} hitSlop={Spacing.md} style={styles.cancelButton}>
            <Body size="body" tone="secondary">Close</Body>
          </HapticPressable>
          <Heading size="subheading">Drawer</Heading>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.section}>
          <Body size="bodySm" tone="secondary">Filters</Body>
          <HapticPressable
            onPress={handleSettingsPress}
            style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          >
            <Body size="body">All Filters</Body>
            {settingsCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.label }]}>
                <Label size="caption" uppercase={false} style={{ color: colors.background }}>
                  {settingsCount > 9 ? '9+' : settingsCount}
                </Label>
              </View>
            ) : (
              <Body size="bodySm" tone="secondary">Open</Body>
            )}
          </HapticPressable>

          {pills.map((pill) => (
            <HapticPressable
              key={pill.type}
              onPress={() => handlePillPress(pill.type)}
              style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            >
              <Body size="body">{pill.label}</Body>
              {pill.activeCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.label }]}>
                  <Label size="caption" uppercase={false} style={{ color: colors.background }}>
                    {pill.activeCount > 9 ? '9+' : pill.activeCount}
                  </Label>
                </View>
              ) : (
                <Body size="bodySm" tone="secondary">Open</Body>
              )}
            </HapticPressable>
          ))}
        </View>

        <View style={styles.section}>
          <Body size="bodySm" tone="secondary">View</Body>
          <View style={styles.viewModeRow}>
            <HapticPressable
              onPress={() => handleViewModePress('grid')}
              style={[
                styles.viewModeButton,
                {
                  backgroundColor: viewMode === 'grid' ? colors.primaryMuted : colors.surfaceSecondary,
                  borderColor: viewMode === 'grid' ? colors.primary : colors.border,
                },
              ]}
            >
              <LayoutGrid size={Sizes.iconSm} color={viewMode === 'grid' ? colors.primary : colors.labelSecondary} strokeWidth={2} />
              <Body size="bodySm" style={{ color: viewMode === 'grid' ? colors.primary : colors.labelSecondary }}>
                Grid
              </Body>
            </HapticPressable>

            <HapticPressable
              onPress={() => handleViewModePress('list')}
              style={[
                styles.viewModeButton,
                {
                  backgroundColor: viewMode === 'list' ? colors.primaryMuted : colors.surfaceSecondary,
                  borderColor: viewMode === 'list' ? colors.primary : colors.border,
                },
              ]}
            >
              <List size={Sizes.iconSm} color={viewMode === 'list' ? colors.primary : colors.labelSecondary} strokeWidth={2} />
              <Body size="bodySm" style={{ color: viewMode === 'list' ? colors.primary : colors.labelSecondary }}>
                List
              </Body>
            </HapticPressable>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    borderRadius: Radius['3xl'],
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  placeholder: {
    width: Spacing.xl * 3,
  },
  section: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    minWidth: Sizes.iconSm,
    height: Sizes.iconSm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Sizes.iconSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  viewModeButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
});