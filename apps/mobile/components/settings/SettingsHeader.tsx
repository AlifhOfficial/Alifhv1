/**
 * Settings Header Component
 * Title header with theme toggle bubble
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
import type { ThemeColors } from './types';

type ThemeOption = 'light' | 'dark';

interface SettingsHeaderProps {
  colors: ThemeColors;
  topInset: number;
  currentTheme?: ThemeOption;
  onToggleTheme?: () => void;
}

export function SettingsHeader({ 
  colors, 
  topInset, 
  currentTheme = 'light',
  onToggleTheme,
}: SettingsHeaderProps) {
  const handleToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleTheme?.();
  };

  const Icon = currentTheme === 'dark' ? Moon : Sun;

  return (
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      
      {onToggleTheme && (
        <Pressable
          onPress={handleToggle}
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
            <Icon 
              size={20} 
              color="#8E8E93" 
              strokeWidth={2} 
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
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
