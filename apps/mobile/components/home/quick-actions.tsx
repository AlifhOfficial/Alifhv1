/**
 * QuickActions — Saved, Inventory, Bookings, Create
 * 2×2 grid below GreetingNote on the home tab.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import { HapticPressable, Data } from '@/components/ui';
import { Body } from '@/components/ui/text';
import { CreateListingFlow } from '@/components/sheets';

const actions = [
  { key: 'saved',     label: 'Saved',     icon: 'bookmark-outline' as const,  route: '/saved' },
  { key: 'inventory', label: 'Inventory', icon: 'cube-outline' as const,      route: '/inventory' },
  { key: 'bookings',  label: 'Bookings',  icon: 'calendar-outline' as const,  route: '/bookings' },
  { key: 'create',    label: 'Create',    icon: 'add' as const,               route: null },
] as const;

export function QuickActions() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
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
            style={[styles.cell, { backgroundColor: colors.backgroundSecondary }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.fill3 }]}>
              <Ionicons name={action.icon} size={Sizes.iconMd} color={colors.label} />
            </View>
            <Body size="bodySm">{action.label}</Body>
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
