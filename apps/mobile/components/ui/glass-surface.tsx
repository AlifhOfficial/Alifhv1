/**
 * GlassSurface — Liquid Glass background layer
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Renders iOS 26 Liquid Glass (`GlassView`) when available,
 * otherwise falls back to a transparent `View` (no-op).
 *
 * USAGE — drop inside any Pressable/View as an absolute-fill background:
 *
 *   <HapticPressable style={[UIKit.bubbleLg, { backgroundColor: GLASS_AVAILABLE ? 'transparent' : colors.surface }]}>
 *     <GlassSurface />
 *     <Icon ... />
 *   </HapticPressable>
 *
 * The parent still keeps its UIKit shape (borderRadius, border, shadow).
 * GlassSurface just replaces the solid `backgroundColor` with glass.
 *
 * IMPORTANT (Apple constraints):
 *   • Do NOT set opacity < 1 on GlassView or any parent View.
 *     Use scale/width animations instead of opacity to show/hide.
 *   • Parent must NOT use overflow: 'hidden' — it clips the effect.
 *     UIKit tokens already handle this via overflow: 'visible'.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, type ViewStyle } from 'react-native';
import { HapticPressable } from '@/components/ui';

// ── Lazy availability check ─────────────────────────────────────────────────
// Resolved once at runtime (not at import time) so the native module is ready.
let _resolved = false;
let _glassAvailable = false;
let _GlassViewComponent: React.ComponentType<any> | null = null;

function resolveGlass(): boolean {
  if (_resolved) return _glassAvailable;
  _resolved = true;

  if (Platform.OS !== 'ios') return false;

  try {
    const mod = require('expo-glass-effect');
    // Primary check — is Liquid Glass compiled in?
    const liquidOk =
      typeof mod.isLiquidGlassAvailable === 'function' && mod.isLiquidGlassAvailable();
    // Secondary safety — is the runtime API present? (beta guard)
    const apiOk =
      typeof mod.isGlassEffectAPIAvailable === 'function'
        ? mod.isGlassEffectAPIAvailable()
        : true; // if the guard doesn't exist, trust liquidOk
    if (liquidOk && apiOk && mod.GlassView) {
      _glassAvailable = true;
      _GlassViewComponent = mod.GlassView;
    }
  } catch {
    // not installed / not linked
  }
  return _glassAvailable;
}

/** Whether Liquid Glass is available at runtime (iOS 26+). Lazy-resolved. */
export function isGlassAvailable(): boolean {
  return resolveGlass();
}

/** Static shortcut — resolves once then caches */
export const GLASS_AVAILABLE: boolean = (() => resolveGlass())();

// ── Props ───────────────────────────────────────────────────────────────────
interface GlassSurfaceProps {
  /** Extra styles on the absolute-fill layer (e.g. borderRadius to match parent) */
  style?: ViewStyle;
  /** Glass variant — 'regular' (default) or 'clear' */
  glassStyle?: 'regular' | 'clear';
  /** Tint color for the glass */
  tintColor?: string;
  /** Whether the glass should be interactive */
  interactive?: boolean;
}

/**
 * Absolute-fill glass background.
 * When glass is unavailable the component renders nothing (null),
 * so the parent's own backgroundColor shows through as the fallback.
 */
export function GlassSurface({
  style,
  glassStyle = 'regular',
  tintColor,
  interactive = false,
}: GlassSurfaceProps) {
  if (!resolveGlass() || !_GlassViewComponent) {
    return null;
  }

  const NativeGlass = _GlassViewComponent;

  return (
    <NativeGlass
      style={[StyleSheet.absoluteFill, style]}
      glassEffectStyle={glassStyle}
      tintColor={tintColor}
      isInteractive={interactive}
      pointerEvents="none"
    />
  );
}
