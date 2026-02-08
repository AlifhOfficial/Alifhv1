/**
 * Listing Detail Header - Title with share
 * Matches ProfileHeader/HomeHeader style for consistency
 */

import React, { memo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Share2 } from 'lucide-react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface BreadcrumbHeaderProps {
  make: string;
  model: string;
  year: number;
  topInset: number;
  onShare?: () => void;
}

export const BreadcrumbHeader = memo(function BreadcrumbHeader({
  make,
  model,
  year,
  topInset,
  onShare,
}: BreadcrumbHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const title = `${year} ${make} ${model}`;

  return (
    <View style={[styles.container, { paddingTop: topInset + 8, backgroundColor: colors.background }]}>
      {/* Left: Title */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>

      {/* Right: Share Button */}
      <Pressable
        onPress={onShare}
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
          <Share2
            size={20}
            color={colors.icon}
            strokeWidth={1.75}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
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
