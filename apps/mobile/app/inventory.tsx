/**
 * Inventory Screen — Route
 * Route: /inventory
 *
 * Renders the My Inventory view with listing management.
 * Requires authentication — shows auth empty state if not signed in.
 */

import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { InventoryScreen } from '@/components/user-inventory-management/inventory-screen';
import { TopSafeAreaGradient } from '@/components/layout';
import { AuthRequiredEmptyState } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function InventoryRoute() {
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  // Show auth empty state when not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <TopSafeAreaGradient />
        <AuthRequiredEmptyState
          title="Sign in to view inventory"
          subtitle="Manage your car listings on Revvup"
        />
      </View>
    );
  }

  return <InventoryScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
