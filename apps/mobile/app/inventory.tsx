/**
 * Inventory Screen — Route
 * Route: /inventory
 *
 * Renders the My Inventory view with listing management.
 * Requires authentication — shows auth empty state if not signed in.
 */

import { AuthGate } from '@/components/ui';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Platform, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { InventoryScreen } from '@/components/user-inventory-management/inventory-screen';
import { Colors, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package } from 'lucide-react-native';

export default function InventoryRoute() {
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  const [isHeaderTitleHidden, setIsHeaderTitleHidden] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderTitleHidden(event.nativeEvent.contentOffset.y > Spacing.lg);
  }, []);

  const nativeHeaderOptions = {
    headerShown: false,
  };

  // Show auth empty state when not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Inventory', headerTintColor: colors.label }} />
        <MobileHeader title="Inventory" showBackButton titleHidden={isHeaderTitleHidden} />
        <View style={{ flex: 1, paddingTop: headerInset }}>
        <AuthGate
          icon={Package}
          title="Sign in to view inventory."
          subtitle="Manage your car listings on Revvup."
        />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Inventory', headerTintColor: colors.label }} />
      <MobileHeader title="Inventory" showBackButton titleHidden={isHeaderTitleHidden} />
      <InventoryScreen onScroll={handleScroll} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
