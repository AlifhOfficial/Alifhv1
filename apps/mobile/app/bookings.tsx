/**
 * Bookings Screen — Route
 * Route: /bookings
 *
 * Renders the My Bookings view with booking management.
 * Requires authentication — shows auth empty state if not signed in.
 */

import { AuthRequiredEmptyState } from '@/components/ui';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { BookingsScreen } from '@/components/bookings/bookings-screen';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingsRoute() {
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
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Bookings', headerTintColor: colors.label }} />
        <MobileHeader title="Bookings" showBackButton />
        <View style={{ flex: 1, paddingTop: headerInset }}>
        <AuthRequiredEmptyState
          title="Sign in to view bookings"
          subtitle="Manage your test drive appointments on Revvup"
        />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Bookings', headerTintColor: colors.label }} />
      <MobileHeader title="Bookings" showBackButton />
      <BookingsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
