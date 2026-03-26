/**
 * Home Doodle - Bold Colorful Text-based Decorative Pattern
 * Creates a lively monogram pattern using scattered "revvup" text
 * Bold vibrant colors that bring energy to the home screen
 */

import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { Fonts } from '@/constants/theme';

// Vibrant accent colors - bright and lively
const VIBRANT_COLORS = [
  '#FF6B6B', // Coral red
  '#4ECDC4', // Teal
  '#FFE66D', // Sunny yellow
  '#95E1D3', // Mint
  '#F38181', // Salmon pink
  '#AA96DA', // Lavender purple
  '#FCBAD3', // Bubblegum pink
  '#A8D8EA', // Sky blue
];

// Scattered text positions - bold and visible
const TEXT_POSITIONS = [
  // Top section
  { top: '6%', left: '2%', rotation: -15, opacity: 0.35, size: 18, colorIndex: 0 },
  { top: '4%', left: '40%', rotation: 10, opacity: 0.28, size: 15, colorIndex: 1 },
  { top: '8%', right: '5%', rotation: -8, opacity: 0.32, size: 16, colorIndex: 2 },
  
  // Upper section
  { top: '16%', left: '18%', rotation: 12, opacity: 0.25, size: 14, colorIndex: 3 },
  { top: '20%', right: '12%', rotation: -12, opacity: 0.38, size: 19, colorIndex: 4 },
  { top: '14%', left: '60%', rotation: 8, opacity: 0.30, size: 15, colorIndex: 5 },
  
  // Upper-middle section  
  { top: '28%', left: '0%', rotation: -10, opacity: 0.32, size: 17, colorIndex: 6 },
  { top: '32%', left: '35%', rotation: 15, opacity: 0.26, size: 14, colorIndex: 7 },
  { top: '26%', right: '2%', rotation: -6, opacity: 0.35, size: 18, colorIndex: 0 },
  
  // Middle section
  { top: '40%', left: '12%', rotation: 8, opacity: 0.30, size: 16, colorIndex: 1 },
  { top: '44%', left: '52%', rotation: -14, opacity: 0.38, size: 19, colorIndex: 2 },
  { top: '42%', right: '8%', rotation: 12, opacity: 0.26, size: 14, colorIndex: 3 },
  
  // Lower-middle section
  { top: '54%', left: '3%', rotation: -12, opacity: 0.35, size: 18, colorIndex: 4 },
  { top: '58%', left: '32%', rotation: 10, opacity: 0.28, size: 15, colorIndex: 5 },
  { top: '52%', right: '5%', rotation: -8, opacity: 0.32, size: 17, colorIndex: 6 },
  
  // Lower section
  { top: '66%', left: '20%', rotation: 14, opacity: 0.26, size: 14, colorIndex: 7 },
  { top: '70%', left: '55%', rotation: -15, opacity: 0.38, size: 19, colorIndex: 0 },
  { top: '64%', right: '15%', rotation: 8, opacity: 0.30, size: 16, colorIndex: 1 },
  
  // Bottom section
  { top: '78%', left: '5%', rotation: -10, opacity: 0.32, size: 17, colorIndex: 2 },
  { top: '82%', left: '38%', rotation: 12, opacity: 0.26, size: 14, colorIndex: 3 },
  { top: '76%', right: '2%', rotation: -8, opacity: 0.35, size: 18, colorIndex: 4 },
  
  // Very bottom
  { top: '90%', left: '15%', rotation: 10, opacity: 0.30, size: 16, colorIndex: 5 },
  { top: '92%', left: '48%', rotation: -12, opacity: 0.28, size: 15, colorIndex: 6 },
  { top: '88%', right: '10%', rotation: 14, opacity: 0.32, size: 17, colorIndex: 7 },
];

export const HomeDoodle = memo(function HomeDoodle() {
  return (
    <View style={styles.container} pointerEvents="none">
      {TEXT_POSITIONS.map((pos, index) => (
        <Text
          key={index}
          style={[
            styles.doodleText,
            {
              top: pos.top,
              left: pos.left,
              right: pos.right,
              transform: [{ rotate: `${pos.rotation}deg` }],
              opacity: pos.opacity,
              fontSize: pos.size,
              color: VIBRANT_COLORS[pos.colorIndex],
            } as any,
          ]}
        >
          revvup
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
  doodleText: {
    position: 'absolute',
    fontFamily: Fonts.regular,
    letterSpacing: 0.5,
  },
});
