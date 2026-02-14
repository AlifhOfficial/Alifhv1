/**
 * AuthDoodle - Custom doodle pattern for AuthSheet
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A compact, elegant logo pattern designed specifically for the auth sheet.
 * Features a balanced distribution for smaller container heights with
 * stronger visibility and intentional placement.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { RevvupLogo } from '@/components/ui/loaders';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface AuthDoodleProps {
  /** Container style overrides */
  style?: ViewStyle;
}

// ═══════════════════════════════════════════════════
// DOODLE PATTERN - Optimized for auth sheet
// ═══════════════════════════════════════════════════

interface DoodleItem {
  id: number;
  size: number;
  rotation: number;
  opacity: number;
  /** Which accent color to use (1-5), or 0 for neutral */
  accent: 0 | 1 | 2 | 3 | 4 | 5;
  position: {
    top?: string | number;
    bottom?: string | number;
    left?: string | number;
    right?: string | number;
  };
}

// Compact pattern for auth sheet (~300-400px height)
// Uses percentage-based positioning for better responsiveness
const AUTH_DOODLE_PATTERN: DoodleItem[] = [
  // Top-left cluster
  { id: 1, size: 48, rotation: -20, opacity: 0.12, accent: 1, position: { top: -8, left: -12 } },
  { id: 2, size: 32, rotation: 15, opacity: 0.15, accent: 2, position: { top: 20, left: 40 } },
  
  // Top-right cluster
  { id: 3, size: 56, rotation: 12, opacity: 0.10, accent: 3, position: { top: -15, right: -20 } },
  { id: 4, size: 28, rotation: -10, opacity: 0.14, accent: 0, position: { top: 35, right: 50 } },
  
  // Mid-left accent
  { id: 5, size: 36, rotation: 25, opacity: 0.12, accent: 4, position: { top: '35%', left: -8 } },
  
  // Mid-right accent
  { id: 6, size: 42, rotation: -18, opacity: 0.10, accent: 5, position: { top: '40%', right: -10 } },
  
  // Bottom-left cluster
  { id: 7, size: 52, rotation: 8, opacity: 0.11, accent: 2, position: { bottom: 30, left: -16 } },
  { id: 8, size: 26, rotation: -25, opacity: 0.15, accent: 1, position: { bottom: 60, left: 60 } },
  
  // Bottom-right cluster
  { id: 9, size: 60, rotation: -15, opacity: 0.10, accent: 3, position: { bottom: -10, right: -24 } },
  { id: 10, size: 34, rotation: 22, opacity: 0.13, accent: 0, position: { bottom: 50, right: 40 } },
  
  // Center subtle accents (very low opacity)
  { id: 11, size: 24, rotation: 30, opacity: 0.08, accent: 4, position: { top: '55%', left: '25%' } },
  { id: 12, size: 20, rotation: -12, opacity: 0.08, accent: 5, position: { top: '65%', right: '30%' } },
];

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export const AuthDoodle = memo(function AuthDoodle({ style }: AuthDoodleProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  // Accent colors from theme
  const accentColors = [
    colors.blkText, // 0 - neutral
    colors.doodleAccent1, // 1 - blue
    colors.doodleAccent2, // 2 - purple
    colors.doodleAccent3, // 3 - green
    colors.doodleAccent4, // 4 - amber
    colors.doodleAccent5, // 5 - rose
  ];
  
  // Convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${opacity})`;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {AUTH_DOODLE_PATTERN.map((item) => (
        <View
          key={item.id}
          style={[
            styles.logoWrapper,
            {
              ...item.position,
              transform: [{ rotate: `${item.rotation}deg` }],
            },
          ]}
        >
          <RevvupLogo 
            size={item.size} 
            color={hexToRgba(accentColors[item.accent], item.opacity)} 
          />
        </View>
      ))}
    </View>
  );
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  logoWrapper: {
    position: 'absolute',
  },
});
