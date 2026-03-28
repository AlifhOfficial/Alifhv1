/**
 * Inventory Screen — Route
 * Route: /inventory
 *
 * Renders the My Inventory view with listing management.
 * Requires authentication — shows auth empty state if not signed in.
 */

import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { InventoryScreen } from '@/components/user-inventory-management/inventory-screen';
import { AuthRequiredEmptyState } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function InventoryRoute() {
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const nativeHeaderOptions = Platform.OS === 'ios'
    ? {
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerBackTitle: '',
      }
    : {
        headerStyle: { backgroundColor: colors.background },
      };

  // Show auth empty state when not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Inventory', headerTintColor: colors.label }} />
        <AuthRequiredEmptyState
          title="Sign in to view inventory"
          subtitle="Manage your car listings on Revvup"
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Inventory', headerTintColor: colors.label }} />
      <InventoryScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
