/**
 * Profile Header Component
 * Matches HomeHeader style for consistency
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';

import { Heading } from '@/components/ui';
import { Spacing, Layout, Sizes } from '@/constants/theme';
import type { ThemeColors } from './types';

interface ProfileHeaderProps {
  colors: ThemeColors;
  topInset: number;
}

export function ProfileHeader({ colors, topInset }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: topInset + Layout.headerPadding }]}>
      {/* Left: Title */}
      <Heading size="medium">Profile</Heading>

      {/* Right: Settings */}
      <HapticPressable
        onPress={() => router.push('/settings')}
        hitSlop={Layout.hitSlop}
        style={[
          styles.iconButton,
          {
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        {({ pressed }) => (
          <>
            <Settings
              size={Sizes.iconSm}
              color={colors.text}
              strokeWidth={2}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          </>
        )}
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: Spacing.xs,
    borderWidth: 1,
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
