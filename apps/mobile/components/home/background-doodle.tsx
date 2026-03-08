/**
 * Background Doodle Component
 * 
 * Single flowing gradient glow using brand blue
 * Designed to be subtle and elegant, adding depth without overpowering content
 */

import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useTheme } from '@/context/theme-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Brand blue
const BRAND_BLUE = '#0066FF';

export function BackgroundDoodle() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} viewBox="0 0 400 850" preserveAspectRatio="xMidYMid slice">
        <Defs>
          {/* Smooth flowing gradient with multiple stops for silky transition */}
          <LinearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={BRAND_BLUE} stopOpacity={0} />
            <Stop offset="10%" stopColor={BRAND_BLUE} stopOpacity={isDark ? 0.02 : 0.01} />
            <Stop offset="25%" stopColor={BRAND_BLUE} stopOpacity={isDark ? 0.05 : 0.025} />
            <Stop offset="40%" stopColor={BRAND_BLUE} stopOpacity={isDark ? 0.08 : 0.04} />
            <Stop offset="50%" stopColor={BRAND_BLUE} stopOpacity={isDark ? 0.1 : 0.05} />
            <Stop offset="60%" stopColor={BRAND_BLUE} stopOpacity={isDark ? 0.08 : 0.04} />
            <Stop offset="75%" stopColor={BRAND_BLUE} stopOpacity={isDark ? 0.05 : 0.025} />
            <Stop offset="90%" stopColor={BRAND_BLUE} stopOpacity={isDark ? 0.02 : 0.01} />
            <Stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Single flowing S-curve glow that spans the screen */}
        <Path
          d="M-100,100 
             Q100,50 200,200 
             T350,400 
             T200,600 
             T400,800 
             Q500,900 500,950"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth={isDark ? 200 : 180}
          strokeLinecap="round"
        />
      </Svg>
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
});
