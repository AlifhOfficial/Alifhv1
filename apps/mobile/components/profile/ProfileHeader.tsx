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
import type { ThemeColors } from './types';

interface ProfileHeaderProps {
  colors: ThemeColors;
  topInset: number;
}

export function ProfileHeader({ colors, topInset }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
      {/* Left: Title */}
      <Heading size="large">Profile</Heading>

      {/* Right: Settings */}
      <HapticPressable
        onPress={() => router.push('/settings')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[
          styles.iconButton,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {({ pressed }) => (
          <Settings
            size={20}
            color={colors.iconMuted}
            strokeWidth={2}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 4,
    borderWidth: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
