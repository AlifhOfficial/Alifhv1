import { EmptyState } from '@/components/ui';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FileQuestion, ArrowLeft } from 'lucide-react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function NotFoundScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/(browse)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <EmptyState
        icon={FileQuestion}
        title="Page not found."
        subtitle="This page doesn't exist or may have been moved."
        action={{ label: 'Go Back', onPress: handleGoBack, icon: ArrowLeft }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

