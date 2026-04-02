import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Layout, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Bubble } from './chrome';

interface SheetFloatingCloseButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

interface SheetFloatingCloseHandleProps {
  onPress: () => void;
  disabled?: boolean;
}

function SheetFloatingCloseButton({ onPress, disabled = false }: SheetFloatingCloseButtonProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <Bubble
      onPress={onPress}
      hitSlop={Spacing.md}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Close sheet"
      style={styles.button}
    >
      <Ionicons name="close" size={Sizes.iconSm} color={colors.labelSecondary} />
    </Bubble>
  );
}

export function SheetFloatingCloseHandle({
  onPress,
  disabled = false,
}: SheetFloatingCloseHandleProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.handle}>
      <View pointerEvents="box-none" style={styles.closeLayer}>
        <SheetFloatingCloseButton onPress={onPress} disabled={disabled} />
      </View>
      <View style={[styles.indicator, { backgroundColor: colors.labelQuaternary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  handle: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    overflow: 'visible',
  },
  closeLayer: {
    position: 'absolute',
    top: -(Sizes.actionButtonMd + Spacing.sm),
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'flex-end',
    paddingRight: Layout.screenPadding + Spacing.md,
  },
  indicator: {
    alignSelf: 'center',
    width: Sizes.bubble,
    height: 4,
    borderRadius: Radius.full,
  },
  button: {
    position: 'relative',
  },
});
