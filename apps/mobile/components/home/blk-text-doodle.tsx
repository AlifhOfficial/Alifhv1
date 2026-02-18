/**
 * BLK Text Doodle - Text-based decorative pattern for BLK grid
 * Creates a luxury monogram pattern using scattered "black" text
 * Clean Inter typography at various angles and opacities
 */

import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { Fonts } from '@/constants/theme';

// Scattered "black" text positions - matching first-doodle pattern
// Higher opacity (0.12-0.18) for better visibility
const TEXT_POSITIONS = [
  // Top row - scattered
  { top: '2%', left: '3%', rotation: -8, opacity: 0.16, size: 13 },
  { top: '4%', left: '28%', rotation: 5, opacity: 0.12, size: 11 },
  { top: '3%', left: '52%', rotation: -3, opacity: 0.14, size: 12 },
  { top: '5%', right: '8%', rotation: 10, opacity: 0.12, size: 10 },
  
  // Second row
  { top: '14%', left: '12%', rotation: 6, opacity: 0.10, size: 10 },
  { top: '16%', left: '42%', rotation: -10, opacity: 0.15, size: 14 },
  { top: '13%', right: '15%', rotation: 4, opacity: 0.12, size: 11 },
  
  // Third row
  { top: '26%', left: '2%', rotation: -5, opacity: 0.14, size: 12 },
  { top: '28%', left: '32%', rotation: 8, opacity: 0.10, size: 10 },
  { top: '25%', right: '5%', rotation: -8, opacity: 0.16, size: 13 },
  
  // Middle area
  { top: '38%', left: '18%', rotation: 12, opacity: 0.12, size: 11 },
  { top: '40%', left: '55%', rotation: -6, opacity: 0.14, size: 12 },
  { top: '42%', right: '12%', rotation: 3, opacity: 0.10, size: 10 },
  
  // Lower middle
  { top: '52%', left: '5%', rotation: -10, opacity: 0.15, size: 13 },
  { top: '55%', left: '38%', rotation: 7, opacity: 0.12, size: 11 },
  { top: '53%', right: '8%', rotation: -4, opacity: 0.16, size: 12 },
  
  // Fifth row
  { top: '65%', left: '15%', rotation: 5, opacity: 0.10, size: 10 },
  { top: '68%', left: '48%', rotation: -8, opacity: 0.15, size: 14 },
  { top: '66%', right: '18%', rotation: 10, opacity: 0.12, size: 11 },
  
  // Lower rows
  { top: '78%', left: '3%', rotation: 8, opacity: 0.14, size: 12 },
  { top: '80%', left: '28%', rotation: -5, opacity: 0.12, size: 10 },
  { top: '77%', left: '58%', rotation: 6, opacity: 0.10, size: 11 },
  { top: '82%', right: '5%', rotation: -10, opacity: 0.16, size: 13 },
  
  // Bottom row
  { top: '92%', left: '10%', rotation: -6, opacity: 0.12, size: 11 },
  { top: '94%', left: '40%', rotation: 8, opacity: 0.14, size: 12 },
  { top: '93%', right: '12%', rotation: -3, opacity: 0.12, size: 10 },
];

interface BlkTextDoodleProps {
  opacity?: number;
  color?: string;
}

export const BlkTextDoodle = memo(function BlkTextDoodle({ 
  opacity = 1,
  color = 'rgba(255,255,255,0.5)',
}: BlkTextDoodleProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {TEXT_POSITIONS.map((pos, index) => (
        <Text
          key={index}
          style={[
            styles.blkText,
            {
              top: pos.top,
              left: pos.left,
              right: pos.right,
              transform: [{ rotate: `${pos.rotation}deg` }],
              opacity: pos.opacity * opacity,
              fontSize: pos.size,
              color,
            },
          ]}
        >
          black
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
  blkText: {
    position: 'absolute',
    fontFamily: Fonts.script,
    letterSpacing: 0.5,
  },
});
