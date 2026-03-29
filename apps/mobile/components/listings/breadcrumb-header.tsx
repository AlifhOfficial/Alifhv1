/**
 * Listing Detail Header - Title with share
 * Matches ProfileHeader/HomeHeader style for consistency
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Share2 } from 'lucide-react-native';

import { Colors, Spacing, Sizes, Radius, Layout } from '@/constants/theme';
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
      <Text variant="title3Emphasized" style={{ flex: 1 }} numberOfLines={1}>
        {title}
      </Text>

      {/* Right: Share Button */}
      <HapticPressable
        onPress={onShare}
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
          <Share2
            size={Spacing.xl}
            color={colors.label}
            strokeWidth={1.75}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </HapticPressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xs,
    borderWidth: 1,
    width: Sizes.avatarMd,
    height: Sizes.avatarMd,
    borderRadius: Sizes.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
