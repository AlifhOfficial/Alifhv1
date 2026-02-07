/**
 * Profile Header Component
 * Matches HomeHeader style for consistency
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';

import { Typography } from '@/constants/theme';
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
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

      {/* Right: Settings */}
      <Pressable
        onPress={() => router.push('/(tabs)/settings')}
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
            color="#8E8E93"
            strokeWidth={2}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </Pressable>
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
  title: {
    fontSize: Typography.navTitle.fontSize,
    lineHeight: Typography.navTitle.lineHeight,
    fontFamily: 'Inter_700Bold',
    fontWeight: Typography.navTitle.fontWeight as any,
    letterSpacing: Typography.navTitle.letterSpacing,
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
