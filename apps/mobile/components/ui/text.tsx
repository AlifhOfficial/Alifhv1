/**
 * Custom Text Component - Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A drop-in replacement for React Native's Text component with:
 *   • Disabled font scaling for UI consistency across devices
 *   • Pre-applied typography tokens
 *   • Cross-platform consistent rendering
 * 
 * USAGE:
 *   import { Text, Heading, Body, Data, Label } from '@/components/ui/text';
 * 
 *   <Text variant="bodyMedium">Regular text</Text>
 *   <Heading size="large">Screen Title</Heading>
 *   <Body size="medium">Description text</Body>
 *   <Data size="medium">15,000 km</Data>
 *   <Label size="medium">SPECIFICATIONS</Label>
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

type TypographyKey = keyof typeof Typography;

/** Text color tone - mutually exclusive to avoid conflicts */
type TextTone = 'default' | 'secondary' | 'muted' | 'primary' | 'error' | 'success';

export interface TextProps extends Omit<RNTextProps, 'allowFontScaling' | 'maxFontSizeMultiplier'> {
  /** Typography variant from the design system */
  variant?: TypographyKey;
  /** Text color tone (mutually exclusive) */
  tone?: TextTone;
  /** 
   * Allow font scaling for accessibility (default: false)
   * Enable for long-form content like articles, terms, guides
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

  // Determine text color based on tone (mutually exclusive)
  const textColor = (() => {
    switch (tone) {
      case 'secondary': return colors.text2;
      case 'muted': return colors.textMuted;
      case 'primary': return colors.primary;
      case 'error': return colors.error;
      case 'success': return colors.success;
      default: return colors.text;
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
        style,
      ]}
    >
      {children}
    </RNText>
  );
});

// ═══════════════════════════════════════════════════
// SEMANTIC TEXT COMPONENTS
// ═══════════════════════════════════════════════════
// Pre-configured variants for common use cases

// DISPLAY - Hero text, large callouts
type DisplaySize = 'large' | 'medium' | 'number';
const displayMap: Record<DisplaySize, TypographyKey> = {
  large: 'hero',
  medium: 'title',
  number: 'hero',
};

export interface DisplayProps extends Omit<TextProps, 'variant'> {
  size?: DisplaySize;
}

// Re-export tone type for external use
export type { TextTone };

export const Display = memo(function Display({ size = 'large', ...props }: DisplayProps) {
  return <Text variant={displayMap[size]} {...props} />;
});

// HEADING - Titles, section headers
type HeadingSize = 'large' | 'medium' | 'small' | 'card' | 'mini';
const headingMap: Record<HeadingSize, TypographyKey> = {
  large: 'title',
  medium: 'heading',
  small: 'subheading',
  card: 'subheading',
  mini: 'subheading',
};

export interface HeadingProps extends Omit<TextProps, 'variant'> {
  size?: HeadingSize;
}

export const Heading = memo(function Heading({ size = 'large', ...props }: HeadingProps) {
  return <Text variant={headingMap[size]} {...props} />;
});

// BODY - Readable content, descriptions
type BodySize = 'large' | 'medium' | 'small' | 'mini';
const bodyMap: Record<BodySize, TypographyKey> = {
  large: 'bodyLg',
  medium: 'body',
  small: 'bodySm',
  mini: 'bodySm',
};

export interface BodyProps extends Omit<TextProps, 'variant'> {
  size?: BodySize;
}

export const Body = memo(function Body({ size = 'medium', ...props }: BodyProps) {
  return <Text variant={bodyMap[size]} {...props} />;
});

// DATA - Stats, values, specs
type DataSize = 'large' | 'medium' | 'small' | 'mini';
const dataMap: Record<DataSize, TypographyKey> = {
  large: 'bodyLg',
  medium: 'body',
  small: 'bodySm',
  mini: 'bodySm',
};

export interface DataProps extends Omit<TextProps, 'variant'> {
  size?: DataSize;
}

export const Data = memo(function Data({ size = 'medium', ...props }: DataProps) {
  return <Text variant={dataMap[size]} {...props} />;
});

// LABEL - Section headers, form labels (often uppercase)
type LabelSize = 'large' | 'medium' | 'small' | 'badge';
const labelMap: Record<LabelSize, TypographyKey> = {
  large: 'label',
  medium: 'label',
  small: 'micro',
  badge: 'micro',
};

export interface LabelProps extends Omit<TextProps, 'variant'> {
  size?: LabelSize;
  /** Auto-uppercase the text (common for labels) */
  uppercase?: boolean;
}

export const Label = memo(function Label({ 
  size = 'medium', 
  uppercase = true, 
  children,
  style,
  ...props 
}: LabelProps) {
  return (
    <Text 
      variant={labelMap[size]} 
      style={[uppercase && styles.uppercase, style]}
      {...props}
    >
      {children}
    </Text>
  );
});

// SUPPORTING - Helper text, captions
type SupportingSize = 'medium' | 'small' | 'mini';
const supportingMap: Record<SupportingSize, TypographyKey> = {
  medium: 'body',
  small: 'bodySm',
  mini: 'micro',
};

export interface SupportingProps extends Omit<TextProps, 'variant'> {
  size?: SupportingSize;
}

export const Supporting = memo(function Supporting({ size = 'small', ...props }: SupportingProps) {
  return <Text variant={supportingMap[size]} tone="secondary" {...props} />;
});

// BUTTON TEXT - For button labels
type ButtonSize = 'large' | 'medium' | 'small';
const buttonMap: Record<ButtonSize, TypographyKey> = {
  large: 'subheading',
  medium: 'body',
  small: 'bodySm',
};

export interface ButtonTextProps extends Omit<TextProps, 'variant'> {
  size?: ButtonSize;
}

export const ButtonText = memo(function ButtonText({ size = 'medium', ...props }: ButtonTextProps) {
  return <Text variant={buttonMap[size]} {...props} />;
});

// PRICE - For price displays
type PriceSize = 'tag' | 'mini';
const priceMap: Record<PriceSize, TypographyKey> = {
  tag: 'price',
  mini: 'price',
};

export interface PriceProps extends Omit<TextProps, 'variant'> {
  size?: PriceSize;
}

export const Price = memo(function Price({ size = 'tag', ...props }: PriceProps) {
  return <Text variant={priceMap[size]} tone="primary" {...props} />;
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  uppercase: {
    textTransform: 'uppercase',
  },
});
