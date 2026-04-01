/**
 * Bookings Screen — Route
 * Route: /bookings
 *
 * Renders the My Bookings view with booking management.
 * Requires authentication — shows auth empty state if not signed in.
 */

import { AuthGate } from '@/components/ui';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Platform, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { BookingsScreen } from '@/components/bookings/bookings-screen';
import { Colors, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays } from 'lucide-react-native';

export default function BookingsRoute() {
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
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Bookings', headerTintColor: colors.label }} />
        <MobileHeader title="Bookings" showBackButton titleHidden={isHeaderTitleHidden} />
        <View style={{ flex: 1, paddingTop: headerInset }}>
        <AuthGate
          icon={CalendarDays}
          title="Sign in to view bookings."
          subtitle="Manage your test drive appointments on Revvup."
        />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Bookings', headerTintColor: colors.label }} />
      <MobileHeader title="Bookings" showBackButton titleHidden={isHeaderTitleHidden} />
      <BookingsScreen onScroll={handleScroll} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
