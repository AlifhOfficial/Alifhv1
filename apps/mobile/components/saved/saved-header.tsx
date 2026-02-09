/**
 * Saved Header - Matches ProfileHeader style for consistency
 * Title on left, toggle button on right for Favorites/Superlikes
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Heart, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
import type { ThemeColors, SavedTab } from './types';

interface SavedHeaderProps {
  colors: ThemeColors;
  topInset: number;
  activeTab: SavedTab;
  onTabChange: (tab: SavedTab) => void;
  favoritesCount: number;
  superlikesCount: number;
}

export function SavedHeader({ 
  colors,
  topInset,
  activeTab, 
  onTabChange,
  favoritesCount,
  superlikesCount,
}: SavedHeaderProps) {
  const currentCount = activeTab === 'favorites' ? favoritesCount : superlikesCount;
  
  const handleToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(activeTab === 'favorites' ? 'superlikes' : 'favorites');
  };

  const Icon = activeTab === 'favorites' ? Heart : Sparkles;
  
  return (
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
      {/* Left: Title */}
      <Text style={[styles.title, { color: colors.text }]}>Saved</Text>

      {/* Right: Toggle Button */}
      <Pressable
        onPress={handleToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[
          styles.iconButton, 
          { 
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }
        ]}
      >
        {({ pressed }) => (
          <Icon 
            size={20} 
            color={colors.iconMuted}
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
    ...Typography.headingLarge,
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
