/**
 * Custom Text Component - Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Typography chain:
 *   1. theme.ts      — shared Apple HIG-derived tokens
 *   2. text.tsx      — <Text variant="[HIG token]"> base wrapper
 *   3. All call sites — use Apple HIG token names directly
 *
 * Token names: largeTitle · largeTitleEmphasized
 *              title1 · title1Emphasized
 *              title2 · title2Emphasized
 *              title3 · title3Emphasized
 *              headline
 *              body · bodyEmphasized
 *              callout · calloutEmphasized
 *              subhead · subheadEmphasized
 *              footnote · footnoteEmphasized
 *              caption1 · caption1Emphasized
 *              caption2 · caption2Emphasized
 *
 * USAGE:
 *   <Text variant="callout">Regular text</Text>
 *   <Text variant="title3Emphasized">Section Title</Text>
 *   <Text variant="subhead">Description text</Text>
 *   <Text variant="footnoteEmphasized" uppercase>SPECIFICATIONS</Text>
 *   <Text variant="title3Emphasized" tone="primary">$24,500</Text>
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo } from 'react';
import { Platform, Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

import { Typography, Colors } from '@/constants/theme';
import { useThemeSafe } from '@/context/theme-context';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

/** All semantic typography tokens — each resolves to a TextStyle on the current platform */
export type TypographyKey = keyof typeof Typography;

/** Text color tone */
export type TextTone = 'default' | 'secondary' | 'muted' | 'primary' | 'error' | 'success';

export interface TextProps extends Omit<RNTextProps, 'allowFontScaling' | 'maxFontSizeMultiplier'> {
  /** Typography variant from the design system */
  variant?: TypographyKey;
  /** Text color tone */
  tone?: TextTone;
  /** Optional text transform helper for label-like content */
  uppercase?: boolean;
  children?: React.ReactNode;
}

// ═══════════════════════════════════════════════════
// BASE TEXT COMPONENT
// ═══════════════════════════════════════════════════

export const Text = memo(function Text({
  variant = 'callout',
  tone = 'default',
  uppercase = false,
  style,
  children,
  ...props
}: TextProps) {
  const { colorScheme } = useThemeSafe();
  const colors = Colors[colorScheme];

  const textColor = (() => {
    switch (tone) {
      case 'secondary': return colors.labelSecondary;
      case 'muted':     return colors.labelQuaternary;
      case 'primary':   return colors.primary;
      case 'error':     return colors.error;
      case 'success':   return colors.success;
      default:          return colors.label;
    }
  })();

  return (
    <RNText
      {...props}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      style={[
        Typography[variant],
        { color: textColor },
        uppercase && styles.uppercase,
        style,
        Platform.OS === 'android' && styles.androidTextBase,
      ]}
    >
      {children}
    </RNText>
  );
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  androidTextBase: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  uppercase: { textTransform: 'uppercase' },
});
