/**
 * QuickActions — Saved, Inventory, Bookings, Create
 * 2×2 grid below GreetingNote on the home tab.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Bookmark, Box, Calendar, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/theme-context';
import { Spacing, Radius, Layout, Sizes, Stroke } from '@/constants/theme';
import { CreateListingFlow } from '@/components/sheets';

const actions = [
  { key: 'saved',     label: 'Saved',     icon: Bookmark, route: '/saved' },
  { key: 'inventory', label: 'Inventory', icon: Box,      route: '/inventory' },
  { key: 'bookings',  label: 'Bookings',  icon: Calendar, route: '/bookings' },
  { key: 'create',    label: 'Create',    icon: Plus,     route: null },
] as const;

export function QuickActions() {
  const { colors } = useTheme();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreatePress = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleCreateSuccess = useCallback((listingId: string) => {
    setIsCreateOpen(false);
    router.push(`/listing/${listingId}` as any);
  }, [router]);

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {actions.map((action) => (
          <HapticPressable
            key={action.key}
            onPress={action.route ? () => router.push(action.route as any) : handleCreatePress}
            style={[styles.cell, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.fill3 }]}>
              <action.icon size={Sizes.iconMd} color={colors.label} strokeWidth={Stroke.icon} />
            </View>
            <Text variant="subhead">{action.label}</Text>
          </HapticPressable>
        ))}
      </View>

      <CreateListingFlow
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Layout.screenPadding,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    width: '48%' as any,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderCurve: 'continuous',
  },
  iconCircle: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
