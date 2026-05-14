import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function AuthCallbackScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/(browse)');
      }
    }, 80);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="subhead" style={{ color: colors.labelSecondary }}>
        Finishing sign in...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
});
