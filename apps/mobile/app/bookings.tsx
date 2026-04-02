/**
 * Bookings Screen — Route
 * Route: /bookings
 *
 * Renders the My Bookings view with booking management.
 * Requires authentication — redirects unauthenticated users to auth prompt.
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { MobileHeader } from '@/components/layout';
import { BookingsScreen } from '@/components/bookings/bookings-screen';
import { Colors, Spacing } from '@/constants/theme';

export default function BookingsRoute() {
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [isHeaderTitleHidden, setIsHeaderTitleHidden] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderTitleHidden(event.nativeEvent.contentOffset.y > Spacing.lg);
  }, []);

  const nativeHeaderOptions = {
    headerShown: false,
  };

  // Redirect unauthenticated users to auth prompt
  if (!isAuthenticated) {
    return <Redirect href={{ pathname: '/auth-prompt', params: { context: 'bookings' } }} />;
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
