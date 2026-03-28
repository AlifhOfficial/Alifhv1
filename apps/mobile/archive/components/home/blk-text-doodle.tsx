/**
 * BlkTextDoodle - Decorative text pattern for BLK screen
 * Subtle "BLK" text scattered in a dark, OLED-style monochrome pattern.
 */

import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Fonts, Colors } from '@/constants/theme';

const POSITIONS = [
  { top: '4%',  left: '3%',   rotation: -15, opacity: 0.08, size: 20 },
  { top: '3%',  left: '42%',  rotation:  10, opacity: 0.06, size: 16 },
  { top: '7%',  right: '4%',  rotation:  -8, opacity: 0.07, size: 18 },
  { top: '18%', left: '20%',  rotation:  12, opacity: 0.05, size: 14 },
  { top: '22%', right: '10%', rotation: -12, opacity: 0.09, size: 22 },
  { top: '30%', left: '2%',   rotation: -10, opacity: 0.07, size: 17 },
  { top: '36%', left: '55%',  rotation:  15, opacity: 0.05, size: 13 },
  { top: '44%', left: '14%',  rotation:   8, opacity: 0.08, size: 19 },
  { top: '50%', right: '6%',  rotation: -14, opacity: 0.06, size: 15 },
  { top: '58%', left: '4%',   rotation: -12, opacity: 0.07, size: 20 },
  { top: '64%', left: '38%',  rotation:  10, opacity: 0.05, size: 14 },
  { top: '70%', right: '3%',  rotation:  -8, opacity: 0.08, size: 17 },
  { top: '78%', left: '18%',  rotation:  14, opacity: 0.06, size: 21 },
  { top: '84%', right: '14%', rotation:  -6, opacity: 0.07, size: 15 },
  { top: '90%', left: '50%',  rotation:  -9, opacity: 0.05, size: 18 },
];

export const BlkTextDoodle = memo(function BlkTextDoodle() {
  return (
    <View style={styles.container} pointerEvents="none">
      {POSITIONS.map((pos, i) => (
        <Text
          key={i}
          style={[
            styles.text,
            {
              top: pos.top,
              left: (pos as any).left,
              right: (pos as any).right,
              transform: [{ rotate: `${pos.rotation}deg` }],
              opacity: pos.opacity,
              fontSize: pos.size,
            } as any,
          ]}
        >
          BLK
        </Text>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  text: {
    position: 'absolute',
    fontWeight: Fonts.bold,
    color: Colors.dark.white,
    letterSpacing: 3,
  },
});
