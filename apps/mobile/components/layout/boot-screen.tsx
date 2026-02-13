/**
 * Boot Screen
 * Full-screen branded boot-up state - Revolut-style minimal design
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Text } from '@/components/ui';

export function BootScreen() {
  return (
    <View style={styles.container}>
      <Text variant="splashBrand" style={styles.brandName}>
        Revvup
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    color: '#FFFFFF',
  },
});
