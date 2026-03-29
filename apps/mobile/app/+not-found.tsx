import { Text } from '@/components/ui';
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { Colors, Spacing, Layout, Sizes, Radius } from '@/constants/theme';
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
      <View style={styles.content}>
        <Image
          source="sf:questionmark.circle"
          style={styles.icon}
          tintColor={colors.labelTertiary}
        />

        <Text variant="title" style={styles.title}>
          Page Not Found
        </Text>

        <Text tone="secondary" style={styles.body} variant="body">
          This page doesn't exist or was moved.
        </Text>

        <Pressable
          onPress={handleGoBack}
          style={[styles.button, { backgroundColor: colors.fill }]}
        >
          <Text tone="primary" variant="body">Go Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    width: Sizes.iconXl,
    height: Sizes.iconXl,
    marginBottom: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing['3xl'],
    height: Sizes.actionButtonMd,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
