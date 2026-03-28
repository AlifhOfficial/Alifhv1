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
 *   <Heading size="heading">Section Title</Heading>
 *   <Body size="bodySm">Description text</Body>
 *   <Label>SPECIFICATIONS</Label>
 *   <Price>$24,500</Price>
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

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
      style={[Typography[variant], { color: textColor }, style]}
    >
      {children}
    </RNText>
  );
});

// ═══════════════════════════════════════════════════
// SEMANTIC TEXT COMPONENTS
// ═══════════════════════════════════════════════════

// DISPLAY — Hero text, large callouts
// Large: iOS LargeTitle·E (34) / Android Headline Lg (32)
// Title:  iOS Title2·E (22)    / Android Title Lg (22)
export type DisplaySize = 'hero' | 'title';
export interface DisplayProps extends Omit<TextProps, 'variant'> { size?: DisplaySize }
export const Display = memo(function Display({ size = 'hero', ...props }: DisplayProps) {
  return <Text variant={size} {...props} />;
});

// HEADING — Titled sections, screen headers
// Title:      iOS Title2·E (22)   / Android Title Lg (22)
// Heading:    iOS Title3·E (20)   / Android Title Md (20)
// Subheading: iOS Headline (17)   / Android Title Sm (17)
export type HeadingSize = 'title' | 'heading' | 'subheading';
export interface HeadingProps extends Omit<TextProps, 'variant'> { size?: HeadingSize }
export const Heading = memo(function Heading({ size = 'title', ...props }: HeadingProps) {
  return <Text variant={size} {...props} />;
});

// BODY — Readable content, descriptions
// BodyLg: iOS Body (17)     / Android Body Lg (16)
// Body:   iOS Callout (16)  / Android Body Md (16)
// BodySm: iOS Subhead (15)  / Android Body Sm (14)
export type BodySize = 'bodyLg' | 'body' | 'bodySm';
export interface BodyProps extends Omit<TextProps, 'variant'> { size?: BodySize }
export const Body = memo(function Body({ size = 'body', ...props }: BodyProps) {
  return <Text variant={size} {...props} />;
});

// DATA — Stats, values, specs, IDs
// Title:   iOS Title2 (22)    / Android Title Lg (22)
// Body:    iOS Callout (16)   / Android Body Md (16)
// BodySm:  iOS Subhead (15)   / Android Body Sm (14)
// Caption: iOS Caption1 (12)  / Android Label Sm (12)
export type DataSize = 'title' | 'body' | 'bodySm' | 'caption';
export interface DataProps extends Omit<TextProps, 'variant'> { size?: DataSize }
export const Data = memo(function Data({ size = 'body', ...props }: DataProps) {
  return <Text variant={size} {...props} />;
});

// LABEL — Section headers, form labels (uppercase by default)
// Label:   iOS Footnote·E (13) / Android Label Md (13)
// Caption: iOS Caption1 (12)   / Android Label Sm (12)
export type LabelSize = 'label' | 'caption';
export interface LabelProps extends Omit<TextProps, 'variant'> {
  size?: LabelSize;
  /** Auto-uppercase the text (default: true) */
  uppercase?: boolean;
}
export const Label = memo(function Label({
  size = 'label',
  uppercase = true,
  children,
  style,
  ...props
}: LabelProps) {
  return (
    <Text
      variant={size}
      style={[uppercase && styles.uppercase, style]}
      {...props}
    >
      {children}
    </Text>
  );
});

// SUPPORTING — Helper text, captions (tone defaults to secondary)
// Body:    iOS Callout (16)   / Android Body Md (16)
// BodySm:  iOS Subhead (15)   / Android Body Sm (14)
// Caption: iOS Caption1 (12)  / Android Label Sm (12)
export type SupportingSize = 'body' | 'bodySm' | 'caption';
export interface SupportingProps extends Omit<TextProps, 'variant'> { size?: SupportingSize }
export const Supporting = memo(function Supporting({ size = 'bodySm', ...props }: SupportingProps) {
  return <Text variant={size} tone="secondary" {...props} />;
});

// BUTTON TEXT — For button labels
// Subheading: iOS Headline (17)   / Android Title Sm (17)
// Body:       iOS Callout (16)    / Android Body Md (16)
// BodySm:     iOS Subhead (15)    / Android Body Sm (14)
export type ButtonSize = 'subheading' | 'body' | 'bodySm';
export interface ButtonTextProps extends Omit<TextProps, 'variant'> { size?: ButtonSize }
export const ButtonText = memo(function ButtonText({ size = 'body', ...props }: ButtonTextProps) {
  return <Text variant={size} {...props} />;
});

// PRICE — Price tags (tone defaults to primary)
export interface PriceProps extends Omit<TextProps, 'variant'> {}
export const Price = memo(function Price(props: PriceProps) {
  return <Text variant="heading" tone="primary" {...props} />;
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  uppercase: { textTransform: 'uppercase' },
});
