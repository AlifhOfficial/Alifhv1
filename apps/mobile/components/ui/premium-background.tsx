/**
 * Premium Background - Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * GPU-accelerated ambient backgrounds using @shopify/react-native-skia.
 * Creates the subtle, dark gradient/mesh effects seen in apps like
 * Instagram and Revolut — near-black with barely-perceptible color depth.
 *
 * VARIANTS:
 *   • mesh       → Soft blurred color blobs (Revolut-style mesh gradient)
 *   • radial     → Single centered radial glow
 *   • geometric  → Subtle geometric shapes with blur
 *   • aurora     → Northern-lights style gradient sweep
 *   • noise      → Solid dark with subtle grain texture
 *
 * USAGE:
 *   import { PremiumBackground } from '@/components/ui/premium-background';
 *
 *   // Wrap screen content
 *   <PremiumBackground variant="mesh">
 *     <YourContent />
 *   </PremiumBackground>
 *
 *   // Standalone (absolute positioned behind content)
 *   <View style={{ flex: 1 }}>
 *     <PremiumBackground variant="aurora" />
 *     <YourContent />
 *   </View>
 *
 * PERFORMANCE:
 *   • Rendered on GPU via Skia — zero impact on JS thread
 *   • Static by default (no animation overhead)
 *   • Use animated={true} for slow-drifting blobs (optional)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Blur,
  LinearGradient as SkiaLinearGradient,
  RadialGradient as SkiaRadialGradient,
  Rect,
  RoundedRect,
  vec,
  Group,
  Paint,
  FractalNoise,
  Turbulence,
  BlendMode,
  Blend,
} from '@shopify/react-native-skia';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export type BackgroundVariant = 'mesh' | 'radial' | 'geometric' | 'aurora' | 'noise';

export interface PremiumBackgroundProps {
  /** Background effect variant */
  variant?: BackgroundVariant;
  /** Render children on top of the background */
  children?: React.ReactNode;
  /** Override the base dark color */
  baseColor?: string;
  /** Accent color intensity (0-1, default ~0.06 for subtlety) */
  intensity?: number;
  /** Custom accent colors (overrides theme-based defaults) */
  accentColors?: string[];
  /** Container style overrides */
  style?: ViewStyle;
  /** Whether the background fills absolute position (default: false, uses flex:1) */
  absolute?: boolean;
}

// ═══════════════════════════════════════════════════
// COLOR PALETTES — ultra-subtle accent sets
// ═══════════════════════════════════════════════════

const ACCENT_PALETTES = {
  // Brand-tinted — deep blue core
  brand: [
    'rgba(0, 102, 255, 0.06)',   // primary blue
    'rgba(88, 28, 235, 0.04)',   // deep purple
    'rgba(0, 200, 200, 0.03)',   // teal accent
  ],
  // Warm — ember glow
  warm: [
    'rgba(255, 90, 50, 0.05)',   // warm orange
    'rgba(200, 40, 80, 0.04)',   // deep rose
    'rgba(255, 160, 0, 0.03)',   // amber
  ],
  // Cool — icy depth
  cool: [
    'rgba(0, 180, 255, 0.05)',   // cyan
    'rgba(100, 50, 255, 0.04)',  // indigo
    'rgba(0, 255, 180, 0.03)',   // mint
  ],
  // Neutral — pure depth with no color
  neutral: [
    'rgba(255, 255, 255, 0.03)',
    'rgba(255, 255, 255, 0.02)',
    'rgba(255, 255, 255, 0.015)',
  ],
} as const;

type AccentPalette = keyof typeof ACCENT_PALETTES;

// ═══════════════════════════════════════════════════
// MESH VARIANT — Revolut-style blurred color blobs
// ═══════════════════════════════════════════════════

const MeshBackground = memo(({
  width,
  height,
  baseColor,
  accents,
  intensity,
}: {
  width: number;
  height: number;
  baseColor: string;
  accents: string[];
  intensity: number;
}) => {
  const blobConfigs = useMemo(() => [
    { cx: width * 0.2, cy: height * 0.15, r: width * 0.55, color: accents[0] ?? 'rgba(0,102,255,0.06)' },
    { cx: width * 0.8, cy: height * 0.35, r: width * 0.45, color: accents[1] ?? 'rgba(88,28,235,0.04)' },
    { cx: width * 0.5, cy: height * 0.75, r: width * 0.50, color: accents[2] ?? 'rgba(0,200,200,0.03)' },
  ], [width, height, accents]);

  return (
    <Canvas style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}>
      {/* Base dark fill */}
      <Rect x={0} y={0} width={width} height={height} color={baseColor} />

      {/* Blurred color blobs */}
      {blobConfigs.map((blob, i) => (
        <Circle key={i} cx={blob.cx} cy={blob.cy} r={blob.r * intensity * 10}>
          <Blur blur={80} />
          <Paint color={blob.color} />
        </Circle>
      ))}
    </Canvas>
  );
});

MeshBackground.displayName = 'MeshBackground';

// ═══════════════════════════════════════════════════
// RADIAL VARIANT — Single centered glow
// ═══════════════════════════════════════════════════

const RadialBackground = memo(({
  width,
  height,
  baseColor,
  accents,
  intensity,
}: {
  width: number;
  height: number;
  baseColor: string;
  accents: string[];
  intensity: number;
}) => {
  const centerX = width * 0.5;
  const centerY = height * 0.3;
  const radius = width * 0.8;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}>
      <Rect x={0} y={0} width={width} height={height} color={baseColor} />
      <Circle cx={centerX} cy={centerY} r={radius * intensity * 8}>
        <Blur blur={100} />
        <Paint color={accents[0] ?? 'rgba(0, 102, 255, 0.06)'} />
      </Circle>
    </Canvas>
  );
});

RadialBackground.displayName = 'RadialBackground';

// ═══════════════════════════════════════════════════
// GEOMETRIC VARIANT — Soft shapes with blur
// ═══════════════════════════════════════════════════

const GeometricBackground = memo(({
  width,
  height,
  baseColor,
  accents,
  intensity,
}: {
  width: number;
  height: number;
  baseColor: string;
  accents: string[];
  intensity: number;
}) => {
  const shapes = useMemo(() => [
    // Large tilted rectangle — top left
    { x: -width * 0.1, y: height * 0.05, w: width * 0.6, h: width * 0.6, r: 40, color: accents[0] ?? 'rgba(0,102,255,0.05)' },
    // Medium square — bottom right
    { x: width * 0.55, y: height * 0.5, w: width * 0.5, h: width * 0.5, r: 30, color: accents[1] ?? 'rgba(88,28,235,0.04)' },
    // Small shape — center
    { x: width * 0.25, y: height * 0.6, w: width * 0.35, h: width * 0.35, r: 24, color: accents[2] ?? 'rgba(0,200,200,0.03)' },
  ], [width, height, accents]);

  return (
    <Canvas style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}>
      <Rect x={0} y={0} width={width} height={height} color={baseColor} />
      {shapes.map((shape, i) => (
        <RoundedRect
          key={i}
          x={shape.x}
          y={shape.y}
          width={shape.w * intensity * 10}
          height={shape.h * intensity * 10}
          r={shape.r}
        >
          <Blur blur={60} />
          <Paint color={shape.color} />
        </RoundedRect>
      ))}
    </Canvas>
  );
});

GeometricBackground.displayName = 'GeometricBackground';

// ═══════════════════════════════════════════════════
// AURORA VARIANT — Northern-lights gradient sweep
// ═══════════════════════════════════════════════════

const AuroraBackground = memo(({
  width,
  height,
  baseColor,
  accents,
  intensity,
}: {
  width: number;
  height: number;
  baseColor: string;
  accents: string[];
  intensity: number;
}) => {
  return (
    <Canvas style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}>
      <Rect x={0} y={0} width={width} height={height} color={baseColor} />

      {/* Sweeping gradient band — top portion */}
      <Rect x={0} y={0} width={width} height={height * 0.6}>
        <Blur blur={90} />
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(width, height * 0.5)}
          colors={[
            'transparent',
            accents[0] ?? 'rgba(0, 102, 255, 0.06)',
            accents[1] ?? 'rgba(88, 28, 235, 0.04)',
            accents[2] ?? 'rgba(0, 200, 200, 0.03)',
            'transparent',
          ]}
        />
      </Rect>

      {/* Secondary sweep — offset for depth */}
      <Rect x={0} y={height * 0.2} width={width} height={height * 0.5}>
        <Blur blur={70} />
        <SkiaLinearGradient
          start={vec(width, 0)}
          end={vec(0, height * 0.5)}
          colors={[
            'transparent',
            accents[1] ?? 'rgba(88, 28, 235, 0.03)',
            accents[0] ?? 'rgba(0, 102, 255, 0.04)',
            'transparent',
          ]}
        />
      </Rect>
    </Canvas>
  );
});

AuroraBackground.displayName = 'AuroraBackground';

// ═══════════════════════════════════════════════════
// NOISE VARIANT — Subtle grain texture
// ═══════════════════════════════════════════════════

const NoiseBackground = memo(({
  width,
  height,
  baseColor,
  intensity,
}: {
  width: number;
  height: number;
  baseColor: string;
  intensity: number;
}) => {
  return (
    <Canvas style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}>
      <Rect x={0} y={0} width={width} height={height} color={baseColor} />

      {/* Fractal noise overlay — very subtle grain */}
      <Rect x={0} y={0} width={width} height={height} opacity={intensity * 0.5}>
        <FractalNoise
          freqX={0.6}
          freqY={0.6}
          octaves={4}
          seed={42}
        />
      </Rect>
    </Canvas>
  );
});

NoiseBackground.displayName = 'NoiseBackground';

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export const PremiumBackground = memo(({
  variant = 'mesh',
  children,
  baseColor,
  intensity = 0.06,
  accentColors,
  style,
  absolute = false,
}: PremiumBackgroundProps) => {
  const { isDark, colors } = useTheme();
  const { width, height } = useWindowDimensions();

  // Use theme-appropriate base color
  const resolvedBase = baseColor ?? (isDark ? colors.background : colors.background);

  // Use provided accents or default brand palette
  const resolvedAccents = accentColors ?? ACCENT_PALETTES.brand;

  // Adjust intensity for light mode (more subtle)
  const resolvedIntensity = isDark ? intensity : intensity * 0.5;

  const containerStyle: ViewStyle = absolute
    ? { ...StyleSheet.absoluteFillObject, ...style }
    : { flex: 1, ...style };

  const renderBackground = () => {
    const props = {
      width,
      height,
      baseColor: resolvedBase,
      accents: resolvedAccents as unknown as string[],
      intensity: resolvedIntensity,
    };

    switch (variant) {
      case 'mesh':
        return <MeshBackground {...props} />;
      case 'radial':
        return <RadialBackground {...props} />;
      case 'geometric':
        return <GeometricBackground {...props} />;
      case 'aurora':
        return <AuroraBackground {...props} />;
      case 'noise':
        return <NoiseBackground {...props} />;
      default:
        return <MeshBackground {...props} />;
    }
  };

  return (
    <View style={containerStyle}>
      {renderBackground()}
      {children && (
        <View style={StyleSheet.absoluteFill}>
          {children}
        </View>
      )}
    </View>
  );
});

PremiumBackground.displayName = 'PremiumBackground';

// ═══════════════════════════════════════════════════
// CONVENIENCE PRESETS
// ═══════════════════════════════════════════════════
// Pre-configured backgrounds for common use cases

/** Default dark mesh — brand blue tint (most common) */
export const MeshBG = memo(({ children, ...props }: Omit<PremiumBackgroundProps, 'variant'>) => (
  <PremiumBackground variant="mesh" {...props}>{children}</PremiumBackground>
));
MeshBG.displayName = 'MeshBG';

/** Centered radial glow — for focused content screens */
export const RadialBG = memo(({ children, ...props }: Omit<PremiumBackgroundProps, 'variant'>) => (
  <PremiumBackground variant="radial" {...props}>{children}</PremiumBackground>
));
RadialBG.displayName = 'RadialBG';

/** Aurora sweep — for onboarding or marketing screens */
export const AuroraBG = memo(({ children, ...props }: Omit<PremiumBackgroundProps, 'variant'>) => (
  <PremiumBackground variant="aurora" {...props}>{children}</PremiumBackground>
));
AuroraBG.displayName = 'AuroraBG';

/** Grain texture — for premium card backgrounds */
export const NoiseBG = memo(({ children, ...props }: Omit<PremiumBackgroundProps, 'variant'>) => (
  <PremiumBackground variant="noise" {...props}>{children}</PremiumBackground>
));
NoiseBG.displayName = 'NoiseBG';

// Export palette for custom usage
export { ACCENT_PALETTES, type AccentPalette };
