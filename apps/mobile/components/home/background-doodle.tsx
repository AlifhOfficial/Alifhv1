/**
 * Background Doodle Component
 * 
 * Wallpaper background (wp.jpg)
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

export function BackgroundDoodle() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        source={require('@/assets/images/bg.png')}
        style={styles.image}
        contentFit="cover"
        contentPosition="center"
        blurRadius={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
