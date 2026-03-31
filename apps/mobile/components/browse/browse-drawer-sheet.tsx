import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

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
        <View style={[styles.popover, { bottom: bottomOffset + Sizes.actionButtonLg + Spacing.lg, backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handleIndicator, { backgroundColor: colors.border }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTopRow}>
              <HapticPressable onPress={onClose} hitSlop={Layout.hitSlopSmall} style={styles.cancelButton}>
                <Text variant="subhead" tone="muted">Cancel</Text>
              </HapticPressable>
              <Text variant="caption1Emphasized" tone="muted" uppercase>Browse Menu</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </View>

          <HapticPressable style={[styles.row, { borderBottomColor: colors.border }]} onPress={handleSettingsPress}>
            <View style={styles.rowInner}>
              <Text variant="subhead">Filters</Text>
              {settingsCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.label }]}>
                  <Text variant="caption1Emphasized" style={{ color: colors.background }}>
                    {settingsCount > 9 ? '9+' : settingsCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </HapticPressable>

          {pills.map((pill) => (
            <HapticPressable
              key={pill.type}
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => handlePillPress(pill.type)}
            >
              <View style={styles.rowInner}>
                <Text variant="subhead">{pill.label}</Text>
                {pill.activeCount > 0 ? (
                  <View style={[styles.badge, { backgroundColor: colors.label }]}>
                    <Text variant="caption1Emphasized" style={{ color: colors.background }}>
                      {pill.activeCount > 9 ? '9+' : pill.activeCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </HapticPressable>
          ))}

          <HapticPressable style={styles.row} onPress={handleViewToggle}>
            <View style={styles.rowInner}>
              <Text variant="subhead">View: {viewMode === 'grid' ? 'Grid' : 'List'}</Text>
            </View>
          </HapticPressable>
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
    borderRadius: Radius['2xl'],
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
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
  row: {
    minHeight: Sizes.pillHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    minWidth: Sizes.iconSm,
    height: Sizes.iconSm,
    borderRadius: Sizes.iconSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
});
