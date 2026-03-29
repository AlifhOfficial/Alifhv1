/**
 * Confetti Burst - Revvup Design System
 *
 * Lightweight particle burst using Reanimated.
 * Fires a short-lived burst of small confetti particles
 * from a given origin point — used for fav / superlike feedback.
 *
 * Usage:
 *   const confetti = useConfettiBurst();
 *   confetti.fire({ x, y, colors });
 *   <ConfettiBurst ref={confetti.ref} />
 */

import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, type LayoutRectangle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { ConfettiPalettes } from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface ConfettiBurstRef {
  fire: (opts?: ConfettiBurstOptions) => void;
}

export interface ConfettiBurstOptions {
  /** Particle colors — defaults to favourite palette */
  colors?: string[];
  /** Number of particles (default 12) */
  count?: number;
}

interface Particle {
  id: number;
  color: string;
  /** Angle in radians */
  angle: number;
  /** Distance to travel */
  distance: number;
  /** Random size 4-8 */
  size: number;
  /** Random rotation */
  rotation: number;
  /** Delay before starting (stagger) */
  delay: number;
}

// ============================================================================
// PALETTES
// ============================================================================

export const FAVORITE_COLORS = ConfettiPalettes.favorite;
export const SUPERLIKE_COLORS = ConfettiPalettes.superlike;

// ============================================================================
// SINGLE PARTICLE COMPONENT
// ============================================================================

const DURATION = 500;

const AnimatedParticle = memo(function AnimatedParticle({
  particle,
  onDone,
}: {
  particle: Particle;
  onDone?: () => void;
}) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, {
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
      }),
    );
    opacity.value = withDelay(
      particle.delay + DURATION * 0.5,
      withTiming(0, {
        duration: DURATION * 0.5,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished && onDone) {
          runOnJS(onDone)();
        }
      }),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const dx = Math.cos(particle.angle) * particle.distance * progress.value;
    const dy = Math.sin(particle.angle) * particle.distance * progress.value;
    const scale = 1 - progress.value * 0.4;
    const rotate = particle.rotation * progress.value;

    return {
      opacity: opacity.value,
      transform: [
        { translateX: dx },
        { translateY: dy },
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ConfettiBurst = memo(
  forwardRef<ConfettiBurstRef>(function ConfettiBurst(_props, ref) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const idCounter = useRef(0);
    const doneCount = useRef(0);
    const activeCount = useRef(0);

    const fire = useCallback((opts?: ConfettiBurstOptions) => {
      const colors = opts?.colors ?? FAVORITE_COLORS;
      const count = opts?.count ?? 12;

      const newParticles: Particle[] = [];
      const baseId = idCounter.current;
      idCounter.current += count;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        newParticles.push({
          id: baseId + i,
          color: colors[i % colors.length],
          angle,
          distance: 30 + Math.random() * 40,
          size: 4 + Math.random() * 5,
          rotation: (Math.random() - 0.5) * 360,
          delay: Math.random() * 60,
        });
      }

      doneCount.current = 0;
      activeCount.current = count;
      setParticles(newParticles);
    }, []);

    const handleParticleDone = useCallback(() => {
      doneCount.current += 1;
      if (doneCount.current >= activeCount.current) {
        setParticles([]);
      }
    }, []);

    useImperativeHandle(ref, () => ({ fire }), [fire]);

    if (particles.length === 0) return null;

    return (
      <View style={styles.container} pointerEvents="none">
        {particles.map((p) => (
          <AnimatedParticle
            key={p.id}
            particle={p}
            onDone={handleParticleDone}
          />
        ))}
      </View>
    );
  }),
);

// ============================================================================
// HOOK — convenience imperative API
// ============================================================================

export function useConfettiBurst() {
  const ref = useRef<ConfettiBurstRef>(null);

  const fire = useCallback((opts?: ConfettiBurstOptions) => {
    ref.current?.fire(opts);
  }, []);

  return { ref, fire };
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    pointerEvents: 'none',
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
  },
});
