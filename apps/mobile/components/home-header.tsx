/**
 * Home Header - Custom header with avatar
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User } from 'lucide-react-native';

import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from '@/context/theme-context';

interface HomeHeaderProps {
  avatarUrl?: string;
}

export function HomeHeader({ avatarUrl }: HomeHeaderProps) {
  const { colorScheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + 8 },
      isDark ? styles.containerDark : styles.containerLight,
    ]}>
      {/* Left: Avatar + Title */}
      <View style={styles.leftSection}>
        <Pressable style={({ pressed }) => [styles.avatarContainer, { opacity: pressed ? 0.7 : 1 }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
              <User size={22} color={isDark ? '#AEAEB2' : '#8E8E93'} strokeWidth={2} />
            </View>
          )}
        </Pressable>
        <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
          Home
        </Text>
      </View>

      {/* Right: Notifications + Theme Toggle */}
      <View style={styles.rightSection}>
        <Pressable 
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Bell 
            size={22} 
            color={isDark ? '#FFFFFF' : '#000000'} 
            strokeWidth={2}
          />
        </Pressable>
        <ThemeToggle />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },

  // Left section
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#2C2C2E',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  avatarTextDark: {
    color: '#AEAEB2',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  titleLight: {
    color: '#000000',
  },

  // Right section
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
});
