/**
 * QuickActions Card — Saved, Inventory, Bookings, Create
 * Placed below GreetingNote on the home tab.
 */

import React, { useState, useCallback } from 'react';
import { View, Platform } from 'react-native';
import { Bookmark, Package, CalendarDays, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import { HapticPressable, Data } from '@/components/ui';
import { CreateListingFlow } from '@/components/sheets';

interface ActionItem {
  key: string;
  label: string;
  icon: typeof Bookmark;
  onPress: () => void;
}

export function QuickActions() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const haptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCreatePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsCreateOpen(true);
  }, []);

  const handleCreateSuccess = useCallback((listingId: string) => {
    setIsCreateOpen(false);
    router.push(`/listing/${listingId}` as any);
  }, [router]);

  const actions: ActionItem[] = [
    { key: 'saved', label: 'Saved', icon: Bookmark, onPress: () => { haptic(); router.push('/saved'); } },
    { key: 'inventory', label: 'Inventory', icon: Package, onPress: () => { haptic(); router.push('/inventory'); } },
    { key: 'bookings', label: 'Bookings', icon: CalendarDays, onPress: () => { haptic(); router.push('/bookings'); } },
    { key: 'create', label: 'Create', icon: Plus, onPress: handleCreatePress },
  ];

  return (
    <View style={{ paddingHorizontal: Layout.screenPadding }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: Radius['2xl'],
          borderCurve: 'continuous',
          padding: Spacing.lg,
          gap: Spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <HapticPressable
                key={action.key}
                onPress={action.onPress}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: Spacing.xs,
                  paddingVertical: Spacing.md,
                  borderRadius: Radius.xl,
                  borderCurve: 'continuous',
                  backgroundColor: colors.surface2,
                }}
              >
                {({ pressed }) => (
                  <View style={{ alignItems: 'center', gap: Spacing.xs, opacity: pressed ? 0.6 : 1 }}>
                    <Icon size={Sizes.iconMd} color={colors.icon} strokeWidth={1.8} />
                    <Data size="bodySm">{action.label}</Data>
                  </View>
                )}
              </HapticPressable>
            );
          })}
        </View>
      </View>

      <CreateListingFlow
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </View>
  );
}
