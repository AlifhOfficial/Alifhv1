/**
 * Background Doodle Component
 * 
 * Lightweight SVG doodle pattern for light/dark modes
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

const DOODLE_ELEMENTS = [
  { type: 'circle', x: 40, y: 80, r: 12 },
  { type: 'circle', x: 320, y: 150, r: 8 },
  { type: 'circle', x: 180, y: 280, r: 15 },
  { type: 'circle', x: 60, y: 420, r: 10 },
  { type: 'circle', x: 280, y: 520, r: 18 },
  { type: 'circle', x: 120, y: 650, r: 6 },
  { type: 'circle', x: 350, y: 380, r: 14 },
  { type: 'squiggle', x: 100, y: 180, scale: 1 },
  { type: 'squiggle', x: 250, y: 350, scale: 0.8 },
  { type: 'squiggle', x: 50, y: 550, scale: 1.2 },
  { type: 'squiggle', x: 300, y: 680, scale: 0.9 },
  { type: 'arc', x: 200, y: 100, scale: 1 },
  { type: 'arc', x: 80, y: 320, scale: 0.7 },
  { type: 'arc', x: 320, y: 480, scale: 1.1 },
  { type: 'arc', x: 150, y: 600, scale: 0.8 },
  { type: 'dots', x: 220, y: 220, scale: 1 },
  { type: 'dots', x: 30, y: 500, scale: 0.9 },
  { type: 'dots', x: 280, y: 620, scale: 1.1 },
];

export function BackgroundDoodle() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const strokeColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)';
  const fillColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

  const elements = useMemo(() => {
    return DOODLE_ELEMENTS.map((el, i) => {
      if (el.type === 'circle') {
        return (
          <Circle
            key={i}
            cx={el.x}
            cy={el.y}
            r={el.r}
            stroke={strokeColor}
            strokeWidth={2}
            fill="none"
          />
        );
      }
      if (el.type === 'squiggle') {
        return (
          <G key={i} transform={`translate(${el.x}, ${el.y}) scale(${el.scale})`}>
            <Path
              d="M0,0 Q15,-10 30,0 T60,0 T90,0"
              stroke={strokeColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </G>
        );
      }
      if (el.type === 'arc') {
        return (
          <G key={i} transform={`translate(${el.x}, ${el.y}) scale(${el.scale})`}>
            <Path
              d="M0,20 Q20,-10 40,20"
              stroke={strokeColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </G>
        );
      }
      if (el.type === 'dots') {
        return (
          <G key={i} transform={`translate(${el.x}, ${el.y}) scale(${el.scale})`}>
            <Circle cx={0} cy={0} r={4} fill={fillColor} />
            <Circle cx={14} cy={6} r={3} fill={fillColor} />
            <Circle cx={7} cy={16} r={3.5} fill={fillColor} />
          </G>
        );
      }
      return null;
    });
  }, [strokeColor, fillColor]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        {elements}
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
