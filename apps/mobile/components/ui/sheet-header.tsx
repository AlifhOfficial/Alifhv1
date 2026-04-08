import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, SheetChrome, SheetTypography, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { Text, type TextProps } from './text';

type SheetHeaderProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  titleVariant?: TextProps['variant'];
  style?: StyleProp<ViewStyle>;
};

export function SheetHeader({
  title,
  left,
  right,
  titleVariant = SheetTypography.headerTitle,
  style,
}: SheetHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { borderBottomColor: colors.sheetBorder }, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text variant={titleVariant} style={[styles.title, { color: colors.sheetLabel }]} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {left ? <View style={styles.leftSlot}>{left}</View> : null}
        {right ? <View style={styles.rightSlot}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.md,
    paddingBottom: SheetChrome.headerPaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SheetChrome.headerMarginBottom,
  },
  topRow: {
    minHeight: Spacing['3xl'],
    justifyContent: 'center',
  },
  titleWrap: {
    paddingHorizontal: SheetChrome.headerPlaceholderWidth,
  },
  title: {
    textAlign: 'center',
  },
  leftSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    minWidth: SheetChrome.headerPlaceholderWidth,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    minWidth: SheetChrome.headerPlaceholderWidth,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});