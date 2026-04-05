import React, { useCallback, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';

import { InventoryScreen } from '@/components/user-inventory-management/inventory-screen';
import { MobileHeader } from '@/components/layout';
import { RequireAuthSheet } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';

export default function InventoryRoute() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [isHeaderTitleHidden, setIsHeaderTitleHidden] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderTitleHidden(event.nativeEvent.contentOffset.y > Spacing.lg);
  }, []);

  if (!isAuthLoading && !isAuthenticated) {
    return <RequireAuthSheet context="listings" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
