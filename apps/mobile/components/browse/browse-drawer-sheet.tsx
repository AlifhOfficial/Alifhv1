import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import { Text, HapticPressable } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { BorderWidths, Colors, Layout, Radius, Shadows, Sizes, Spacing, ZIndex } from '@/constants/theme';

export type FilterPillType = 'make' | 'model' | 'price' | 'yearMileage' | 'location';
export type ViewMode = 'grid' | 'list';

interface DrawerPillItem {
  type: FilterPillType;
  label: string;
  activeCount: number;
}

interface BrowseDrawerSheetProps {
  visible: boolean;
  onClose: () => void;
  pills: DrawerPillItem[];
  onPillPress?: (type: FilterPillType) => void;
  onSettingsPress?: () => void;
  settingsCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  bottomOffset?: number;
}

export function BrowseDrawerSheet({
  visible,
  onClose,
  pills,
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
  bottomOffset = 0,
}: BrowseDrawerSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleSettingsPress = () => {
    onClose();
    onSettingsPress?.();
  };

  const handlePillPress = (type: FilterPillType) => {
    onClose();
    onPillPress?.(type);
  };

  const handleViewToggle = () => {
    const mode = viewMode === 'grid' ? 'list' : 'grid';
    onClose();
    onViewModeChange?.(mode);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
        <View style={[styles.popover, { bottom: bottomOffset + Sizes.actionButtonLg + Spacing.lg, backgroundColor: colors.sheet, borderColor: colors.border }]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handleIndicator, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <HapticPressable onPress={onClose} hitSlop={Layout.hitSlopSmall} style={styles.cancelButton}>
                <Text variant="subhead" tone="muted">Cancel</Text>
              </HapticPressable>
              <Text variant="caption1Emphasized" tone="muted" uppercase>Browse Menu</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </View>

          <View style={styles.rows}>
            <HapticPressable style={[styles.row, { backgroundColor: colors.surface }]} onPress={handleSettingsPress}>
              <Text variant="subhead">Filters</Text>
              {settingsCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.label }]}>
                  <Text variant="caption1Emphasized" style={{ color: colors.background }}>
                    {settingsCount > 9 ? '9+' : settingsCount}
                  </Text>
                </View>
              ) : (
                <View style={[styles.plusWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                  <Plus size={Sizes.iconSm - Spacing.xs} color={colors.labelSecondary} strokeWidth={2.25} />
                </View>
              )}
            </HapticPressable>

          {pills.map((pill) => (
            <HapticPressable
              key={pill.type}
              style={[styles.row, { backgroundColor: colors.surface }]}
              onPress={() => handlePillPress(pill.type)}
            >
              <Text variant="subhead">{pill.label}</Text>
              {Number.isFinite(pill.activeCount) && pill.activeCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.label }]}>
                  <Text variant="caption1Emphasized" style={{ color: colors.background }}>
                    {pill.activeCount > 9 ? '9+' : pill.activeCount}
                  </Text>
                </View>
              ) : (
                <View style={[styles.plusWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                  <Plus size={Sizes.iconSm - Spacing.xs} color={colors.labelSecondary} strokeWidth={2.25} />
                </View>
              )}
            </HapticPressable>
          ))}

            <HapticPressable style={[styles.row, { backgroundColor: colors.surface }]} onPress={handleViewToggle}>
              <Text variant="subhead">View</Text>
              <Text variant="subhead" tone="secondary">{viewMode === 'grid' ? 'Grid' : 'List'}</Text>
            </HapticPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popover: {
    position: 'absolute',
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    borderRadius: Radius.sheet,
    borderWidth: BorderWidths.thin,
    overflow: 'hidden',
    zIndex: ZIndex.modal,
    ...Shadows.lg,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  headerPlaceholder: {
    width: Spacing.xl * 3,
  },
  rows: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  row: {
    minHeight: Sizes.pillHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  badge: {
    minWidth: Sizes.iconSm,
    height: Sizes.iconSm,
    borderRadius: Sizes.iconSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  plusWrap: {
    width: Sizes.iconSm,
    height: Sizes.iconSm,
    borderRadius: Sizes.iconSm / 2,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
