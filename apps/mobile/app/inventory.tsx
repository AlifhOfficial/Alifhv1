/**
 * Inventory Screen — Route
 * Route: /inventory
 *
 * Renders the My Inventory view with listing management.
 * Requires authentication — shows auth empty state if not signed in.
 */

import { AuthRequiredEmptyState } from '@/components/ui';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { InventoryScreen } from '@/components/user-inventory-management/inventory-screen';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InventoryRoute() {
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);

  const nativeHeaderOptions = {
    headerShown: false,
  };

  // Show auth empty state when not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Inventory', headerTintColor: colors.label }} />
        <MobileHeader title="Inventory" showBackButton />
        <View style={{ flex: 1, paddingTop: headerInset }}>
        <AuthRequiredEmptyState
          title="Sign in to view inventory"
          subtitle="Manage your car listings on Revvup"
        />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Inventory', headerTintColor: colors.label }} />
      <MobileHeader title="Inventory" showBackButton />
      <InventoryScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
