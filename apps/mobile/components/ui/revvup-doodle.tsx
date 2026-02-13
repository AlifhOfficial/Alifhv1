/**
 * Revvup Doodle Background
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A scattered logo pattern background that creates a premium, branded feel.
 * Inspired by the BLK widget layout - subtle logos at varying sizes, rotations,
 * and opacities scattered across the container.
 * 
 * USAGE:
 *   import { RevvupDoodle } from '@/components/ui';
 * 
 *   // As an absolute positioned background
 *   <View style={{ flex: 1 }}>
 *     <RevvupDoodle />
 *     <YourContent />
 *   </View>
 * 
 *   // With custom opacity/color
 *   <RevvupDoodle opacity={0.08} color="#FFFFFF" />
 * 
 *   // For light theme
 *   <RevvupDoodle variant="light" />
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { RevvupLogo } from './loaders';
import { useTheme } from '@/context/theme-context';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface RevvupDoodleProps {
  /** Color variant - auto-adjusts based on theme if not specified */
  variant?: 'dark' | 'light' | 'auto';
  /** Base opacity for logos (0-1). Individual logos vary around this. */
  opacity?: number;
  /** Custom logo color (overrides variant) */
  color?: string;
  /** Density of logos: 'sparse' | 'normal' | 'dense' */
  density?: 'sparse' | 'normal' | 'dense';
  /** Container style overrides */
  style?: ViewStyle;
  /** Whether to use absolute positioning (default: true) */
  absolute?: boolean;
}

// ═══════════════════════════════════════════════════
// DOODLE PATTERN DATA
// ═══════════════════════════════════════════════════

interface DoodleItem {
  id: number;
  size: number;
  rotation: number;
  opacity: number;
  position: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

// Scattered logo positions with varying sizes, rotations, and opacities
const DOODLE_PATTERN_NORMAL: DoodleItem[] = [
  // Row 1 - Top area
  { id: 1, size: 80, rotation: -15, opacity: 0.04, position: { top: -30, left: -40 } },
  { id: 2, size: 50, rotation: 10, opacity: 0.06, position: { top: -10, left: 60 } },
  { id: 3, size: 65, rotation: -5, opacity: 0.03, position: { top: 10, left: 150 } },
  { id: 4, size: 55, rotation: 20, opacity: 0.05, position: { top: -20, right: 80 } },
  { id: 5, size: 90, rotation: -25, opacity: 0.04, position: { top: 20, right: -30 } },
  
  // Row 2 - Upper middle
  { id: 6, size: 60, rotation: 8, opacity: 0.05, position: { top: 70, left: -20 } },
  { id: 7, size: 45, rotation: -12, opacity: 0.07, position: { top: 90, left: 100 } },
  { id: 8, size: 70, rotation: 15, opacity: 0.04, position: { top: 60, right: 120 } },
  { id: 9, size: 55, rotation: -8, opacity: 0.06, position: { top: 100, right: 20 } },
  
  // Row 3 - Middle area
  { id: 10, size: 75, rotation: -18, opacity: 0.03, position: { top: 150, left: 30 } },
  { id: 11, size: 40, rotation: 22, opacity: 0.06, position: { top: 170, left: 180 } },
  { id: 12, size: 85, rotation: -3, opacity: 0.04, position: { top: 140, right: 60 } },
  
  // Row 4 - Lower middle
  { id: 13, size: 95, rotation: 12, opacity: 0.03, position: { top: 220, left: -30 } },
  { id: 14, size: 50, rotation: -20, opacity: 0.05, position: { top: 250, left: 120 } },
  { id: 15, size: 70, rotation: 7, opacity: 0.04, position: { top: 230, right: -20 } },
  
  // Row 5 - Lower
  { id: 16, size: 60, rotation: -10, opacity: 0.05, position: { top: 320, left: 50 } },
  { id: 17, size: 45, rotation: 25, opacity: 0.06, position: { top: 340, left: 200 } },
  { id: 18, size: 55, rotation: -15, opacity: 0.04, position: { top: 300, right: 100 } },
  
  // Row 6 - Bottom area
  { id: 19, size: 80, rotation: 18, opacity: 0.04, position: { top: 400, left: -30 } },
  { id: 20, size: 65, rotation: -7, opacity: 0.05, position: { top: 420, left: 130 } },
  { id: 21, size: 75, rotation: 13, opacity: 0.03, position: { top: 380, right: 50 } },
  { id: 22, size: 90, rotation: -22, opacity: 0.04, position: { top: 440, right: -40 } },
  
  // Row 7 - Even lower
  { id: 23, size: 55, rotation: 5, opacity: 0.05, position: { top: 500, left: 20 } },
  { id: 24, size: 70, rotation: -14, opacity: 0.04, position: { top: 520, left: 160 } },
  { id: 25, size: 60, rotation: 19, opacity: 0.06, position: { top: 480, right: 30 } },
  
  // Row 8 - Near bottom
  { id: 26, size: 85, rotation: -9, opacity: 0.03, position: { top: 580, left: -20 } },
  { id: 27, size: 50, rotation: 16, opacity: 0.05, position: { top: 600, left: 100 } },
  { id: 28, size: 75, rotation: -21, opacity: 0.04, position: { top: 560, right: 80 } },
  
  // Row 9 - Bottom
  { id: 29, size: 65, rotation: 11, opacity: 0.05, position: { top: 660, left: 40 } },
  { id: 30, size: 80, rotation: -6, opacity: 0.04, position: { top: 680, right: -10 } },
  
  // Row 10 - Very bottom (for longer screens)
  { id: 31, size: 70, rotation: 23, opacity: 0.03, position: { top: 740, left: -10 } },
  { id: 32, size: 55, rotation: -17, opacity: 0.05, position: { top: 760, left: 150 } },
  { id: 33, size: 90, rotation: 8, opacity: 0.04, position: { top: 720, right: 60 } },
];

// Sparse pattern (fewer logos)
const DOODLE_PATTERN_SPARSE: DoodleItem[] = DOODLE_PATTERN_NORMAL.filter((_, i) => i % 2 === 0);

// Dense pattern (more logos, smaller sizes)
const DOODLE_PATTERN_DENSE: DoodleItem[] = [
  ...DOODLE_PATTERN_NORMAL,
  // Additional logos for dense mode
  { id: 101, size: 35, rotation: 30, opacity: 0.04, position: { top: 40, left: 220 } },
  { id: 102, size: 42, rotation: -28, opacity: 0.05, position: { top: 130, left: 250 } },
  { id: 103, size: 38, rotation: 14, opacity: 0.06, position: { top: 200, right: 150 } },
  { id: 104, size: 48, rotation: -11, opacity: 0.04, position: { top: 280, left: 10 } },
  { id: 105, size: 33, rotation: 26, opacity: 0.05, position: { top: 360, right: 180 } },
  { id: 106, size: 40, rotation: -19, opacity: 0.04, position: { top: 450, left: 80 } },
  { id: 107, size: 36, rotation: 9, opacity: 0.06, position: { top: 540, right: 140 } },
  { id: 108, size: 44, rotation: -24, opacity: 0.03, position: { top: 620, left: 200 } },
  { id: 109, size: 50, rotation: 17, opacity: 0.05, position: { top: 700, right: 120 } },
];

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export const RevvupDoodle = memo(function RevvupDoodle({
  variant = 'auto',
  opacity = 1,
  color,
  density = 'normal',
  style,
  absolute = true,
}: RevvupDoodleProps) {
  const { colorScheme } = useTheme();
  
  // Determine base color for logos
  const logoColor = useMemo(() => {
    if (color) return color;
    
    const effectiveVariant = variant === 'auto' 
      ? (colorScheme === 'dark' ? 'dark' : 'light')
      : variant;
    
    return effectiveVariant === 'dark' 
      ? 'rgba(255, 255, 255, 1)' 
      : 'rgba(0, 0, 0, 1)';
  }, [color, variant, colorScheme]);
  
  // Select pattern based on density
  const pattern = useMemo(() => {
    switch (density) {
      case 'sparse': return DOODLE_PATTERN_SPARSE;
      case 'dense': return DOODLE_PATTERN_DENSE;
      default: return DOODLE_PATTERN_NORMAL;
    }
  }, [density]);
  
  // Compute logo color with opacity
  const getLogoColor = (itemOpacity: number) => {
    // Extract RGB from base color
    const isWhite = logoColor.includes('255, 255, 255');
    const rgb = isWhite ? '255, 255, 255' : '0, 0, 0';
    return `rgba(${rgb}, ${itemOpacity * opacity})`;
  };
  
  const containerStyle = absolute 
    ? [styles.absoluteContainer, style] 
    : [styles.relativeContainer, style];
  
  return (
    <View style={containerStyle} pointerEvents="none">
      {pattern.map((item) => (
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
          <RevvupLogo size={item.size} color={getLogoColor(item.opacity)} />
        </View>
      ))}
    </View>
  );
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  relativeContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  logoWrapper: {
    position: 'absolute',
  },
});
