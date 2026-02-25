/**
 * Background Doodle Component
 * 
 * Abstract artistic doodle pattern with gradients for light/dark modes
 */

import React from 'react';
import { StyleSheet, View, useColorScheme, Dimensions } from 'react-native';
import Svg, { Path, G, Circle, Defs, LinearGradient, RadialGradient, Stop, Ellipse } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function BackgroundDoodle() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} viewBox="0 0 400 850">
        <Defs>
          {/* Gradient definitions */}
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isDark ? '#6366f1' : '#818cf8'} stopOpacity={isDark ? 0.2 : 0.15} />
            <Stop offset="100%" stopColor={isDark ? '#ec4899' : '#f472b6'} stopOpacity={isDark ? 0.15 : 0.1} />
          </LinearGradient>
          
          <LinearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={isDark ? '#14b8a6' : '#2dd4bf'} stopOpacity={isDark ? 0.18 : 0.12} />
            <Stop offset="100%" stopColor={isDark ? '#3b82f6' : '#60a5fa'} stopOpacity={isDark ? 0.12 : 0.08} />
          </LinearGradient>
          
          <LinearGradient id="grad3" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={isDark ? '#f59e0b' : '#fbbf24'} stopOpacity={isDark ? 0.15 : 0.1} />
            <Stop offset="100%" stopColor={isDark ? '#ef4444' : '#f87171'} stopOpacity={isDark ? 0.12 : 0.08} />
          </LinearGradient>
          
          <RadialGradient id="radial1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={isDark ? '#a855f7' : '#c084fc'} stopOpacity={isDark ? 0.2 : 0.12} />
            <Stop offset="100%" stopColor={isDark ? '#6366f1' : '#818cf8'} stopOpacity={0} />
          </RadialGradient>
          
          <RadialGradient id="radial2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={isDark ? '#22d3ee' : '#67e8f9'} stopOpacity={isDark ? 0.18 : 0.1} />
            <Stop offset="100%" stopColor={isDark ? '#0ea5e9' : '#38bdf8'} stopOpacity={0} />
          </RadialGradient>
          
          <RadialGradient id="radial3" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={isDark ? '#f472b6' : '#fb7185'} stopOpacity={isDark ? 0.15 : 0.1} />
            <Stop offset="100%" stopColor={isDark ? '#ec4899' : '#f43f5e'} stopOpacity={0} />
          </RadialGradient>

          <LinearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={isDark ? '#6366f1' : '#818cf8'} stopOpacity={isDark ? 0.3 : 0.2} />
            <Stop offset="50%" stopColor={isDark ? '#a855f7' : '#c084fc'} stopOpacity={isDark ? 0.25 : 0.15} />
            <Stop offset="100%" stopColor={isDark ? '#ec4899' : '#f472b6'} stopOpacity={isDark ? 0.15 : 0.1} />
          </LinearGradient>
          
          <LinearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={isDark ? '#14b8a6' : '#2dd4bf'} stopOpacity={isDark ? 0.25 : 0.18} />
            <Stop offset="100%" stopColor={isDark ? '#3b82f6' : '#60a5fa'} stopOpacity={isDark ? 0.15 : 0.1} />
          </LinearGradient>
        </Defs>

        {/* Large gradient blobs */}
        <Ellipse cx={80} cy={120} rx={100} ry={80} fill="url(#radial1)" />
        <Ellipse cx={340} cy={300} rx={90} ry={70} fill="url(#radial2)" />
        <Ellipse cx={60} cy={500} rx={110} ry={90} fill="url(#radial3)" />
        <Ellipse cx={320} cy={700} rx={100} ry={80} fill="url(#radial1)" />

        {/* Top flowing abstract blob with gradient stroke */}
        <G transform="translate(30, 70)">
          <Path
            d="M30,0 C70,-15 110,25 95,65 C80,105 30,115 5,85 C-20,55 0,15 30,0 Z"
            stroke="url(#grad1)"
            strokeWidth={2}
            fill="none"
          />
          <Path
            d="M40,18 C60,10 80,35 70,55 C60,75 35,80 20,65 C5,50 20,25 40,18 Z"
            stroke="url(#grad1)"
            strokeWidth={1.5}
            fill="url(#grad1)"
            fillOpacity={0.3}
          />
        </G>

        {/* Flowing gradient wave lines */}
        <Path
          d="M-20,200 C60,170 120,230 180,200 S300,140 380,180 S450,220 500,190"
          stroke="url(#lineGrad1)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M-20,220 C50,195 110,245 170,215 S280,165 360,195 S440,235 500,210"
          stroke="url(#lineGrad1)"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />

        {/* Abstract star/sparkle with gradient */}
        <G transform="translate(330, 90)">
          <Path 
            d="M0,-25 L4,-7 L22,-7 L8,5 L13,23 L0,12 L-13,23 L-8,5 L-22,-7 L-4,-7 Z" 
            stroke="url(#grad3)" 
            strokeWidth={2} 
            fill="url(#grad3)"
            fillOpacity={0.4}
          />
        </G>

        {/* Organic curved shape with gradient - middle right */}
        <G transform="translate(270, 320)">
          <Path
            d="M0,0 C40,-25 90,5 100,55 C110,105 70,150 20,135 C-30,120 -40,70 -15,35 C10,0 0,0 0,0"
            stroke="url(#grad2)"
            strokeWidth={2}
            fill="url(#grad2)"
            fillOpacity={0.25}
          />
          <Circle cx={50} cy={60} r={20} stroke="url(#grad2)" strokeWidth={1.5} fill="none" />
        </G>

        {/* Spiral doodle with gradient */}
        <G transform="translate(50, 380)">
          <Path
            d="M30,30 C30,15 45,8 60,15 C75,22 82,42 75,57 C68,72 48,78 33,72 C18,66 12,46 18,31 C24,16 44,10 64,20"
            stroke="url(#lineGrad2)"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </G>

        {/* Abstract leaf/petal shapes with gradient fill */}
        <G transform="translate(170, 480)">
          <Path 
            d="M0,0 Q25,-40 50,0 Q25,40 0,0" 
            stroke="url(#grad1)" 
            strokeWidth={2} 
            fill="url(#grad1)"
            fillOpacity={0.3}
          />
        </G>
        <G transform="translate(195, 505) rotate(50)">
          <Path 
            d="M0,0 Q18,-30 36,0 Q18,30 0,0" 
            stroke="url(#grad2)" 
            strokeWidth={1.5} 
            fill="url(#grad2)"
            fillOpacity={0.25}
          />
        </G>

        {/* Flowing S-curve with gradient */}
        <Path
          d="M-10,580 C50,555 100,615 160,590 C220,565 250,625 310,600 C370,575 420,635 480,610"
          stroke="url(#lineGrad2)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />

        {/* Abstract cloud/blob bottom left with gradient */}
        <G transform="translate(20, 650)">
          <Path
            d="M25,50 C0,42 -8,22 12,10 C32,-2 58,5 70,25 C82,12 108,18 115,38 C122,58 102,78 75,70 C48,82 18,70 25,50 Z"
            stroke="url(#grad3)"
            strokeWidth={2}
            fill="url(#grad3)"
            fillOpacity={0.3}
          />
        </G>

        {/* Small decorative gradient circles */}
        <G transform="translate(350, 440)">
          <Circle cx={0} cy={0} r={5} fill="url(#grad1)" />
          <Circle cx={18} cy={10} r={3} fill="url(#grad2)" />
          <Circle cx={6} cy={22} r={4} fill="url(#grad3)" />
        </G>

        {/* Abstract infinity/loop with gradient */}
        <G transform="translate(240, 750)">
          <Path
            d="M0,25 C12,-5 38,-5 50,25 C62,55 88,55 100,25 C88,-5 62,-5 50,25 C38,55 12,55 0,25"
            stroke="url(#lineGrad1)"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </G>

        {/* Scattered gradient curves */}
        <Path d="M140,130 Q165,100 190,130" stroke="url(#grad2)" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d="M70,270 Q90,250 110,270" stroke="url(#grad1)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Path d="M290,630 Q315,605 340,630" stroke="url(#grad3)" strokeWidth={2} fill="none" strokeLinecap="round" />
        
        {/* Tiny gradient stars */}
        <G transform="translate(110, 550) scale(0.6)">
          <Path 
            d="M0,-15 L3,-5 L13,-5 L5,2 L8,12 L0,6 L-8,12 L-5,2 L-13,-5 L-3,-5 Z" 
            fill="url(#grad2)"
          />
        </G>
        <G transform="translate(360, 220) scale(0.5)">
          <Path 
            d="M0,-15 L3,-5 L13,-5 L5,2 L8,12 L0,6 L-8,12 L-5,2 L-13,-5 L-3,-5 Z" 
            fill="url(#grad1)"
          />
        </G>

        {/* Bottom decorative gradient wave */}
        <Path
          d="M-20,810 C40,785 90,835 150,810 S240,760 320,795 S420,845 480,815"
          stroke="url(#lineGrad2)"
          strokeWidth={2}
          fill="none"
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
