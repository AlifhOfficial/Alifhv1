/**
 * Bookings Screen — Route
 * Route: /bookings
 *
 * Renders the My Bookings view with booking management.
 * Requires authentication — shows auth empty state if not signed in.
 */

import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { BookingsScreen } from '@/components/bookings/bookings-screen';
import { AuthRequiredEmptyState } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function BookingsRoute() {
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  // Show auth empty state when not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <AuthRequiredEmptyState
          title="Sign in to view bookings"
          subtitle="Manage your test drive appointments on Revvup"
        />
      </View>
    );
  }

  return <BookingsScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
