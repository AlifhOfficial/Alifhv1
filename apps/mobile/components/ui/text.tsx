/**
 * Custom Text Component - Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Typography chain:
 *   1. theme.ts      — Apple HIG + Material Design 3 tokens
 *   2. text.tsx      — <Text variant="[token]"> base + semantic wrappers
 *   3. All call sites — use token names directly, no aliases
 *
 * Token names: hero · title · heading · subheading
 *              bodyLg · body · bodySm
 *              label · caption
 *
 * USAGE:
 *   <Text variant="body">Regular text</Text>
 *   <Text variant="heading">Section Title</Text>
 *   <Text variant="bodySm">Description text</Text>
 *   <Text variant="label" uppercase>SPECIFICATIONS</Text>
 *   <Text variant="heading" tone="primary">$24,500</Text>
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
  /**
   * Allow font scaling for accessibility (default: false).
   * Enable for long-form content like articles, terms, guides.
   */
  allowScaling?: boolean;
  children?: React.ReactNode;
}

// ═══════════════════════════════════════════════════
// BASE TEXT COMPONENT
// ═══════════════════════════════════════════════════

export const Text = memo(function Text({
  variant = 'body',
  tone = 'default',
  uppercase = false,
  allowScaling = false,
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
      allowFontScaling={allowScaling}
      maxFontSizeMultiplier={allowScaling ? 1.4 : 1}
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
