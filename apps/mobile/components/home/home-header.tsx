/**
 * Home Header - "Home" title (left) + Theme toggle (right)
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable, Heading } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Layout, Sizes, ZIndex} from '@/constants/theme';

export function HomeHeader() {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const handleToggleTheme = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  const ThemeIcon = colorScheme === 'dark' ? Moon : Sun;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      <Heading size="title">Home</Heading>

      <View
        style={[
          styles.iconButton,
          {
            borderColor: colors.glassBorder,
            borderWidth: 1,
            backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
          },
        ]}
      >
        <HapticPressable
          style={styles.iconButtonInner}
          onPress={handleToggleTheme}
          hitSlop={Layout.hitSlop}
        >
          {({ pressed }) => (
            <ThemeIcon
              size={Sizes.iconSm}
              color={colors.label}
              strokeWidth={2}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
