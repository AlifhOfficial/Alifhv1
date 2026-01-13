import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY, FONT_SIZE } from '@/theme/globals';
import React, { forwardRef } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';

type TextVariant =
  | 'body'           // Default text - 500 weight
  | 'bodyMedium'     // Medium emphasis - 500 weight
  | 'bodySemibold'   // Strong emphasis - 600 weight
  | 'heading'        // Page titles - xl/20, 600 weight
  | 'section'        // Section headers - 15px, 700 weight
  | 'label'          // Form labels - sm/14, 600 weight
  | 'caption'        // Helper text - xs/12, 400 weight
  | 'captionMuted'   // Muted helper - xs/12, 400 weight, muted color
  | 'stat'           // Statistics - xl/20, 700 weight
  | 'link';          // Links - underlined

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  lightColor?: string;
  darkColor?: string;
  children: React.ReactNode;
  muted?: boolean; // Apply muted color
}

export const Text = forwardRef<RNText, TextProps>(
  (
    { variant = 'body', lightColor, darkColor, style, children, muted = false, ...props },
    ref
  ) => {
    const textColor = useColor('text', { light: lightColor, dark: darkColor });
    const mutedColor = useColor('textMuted');

    const getTextStyle = (): TextStyle => {
      const baseStyle: TextStyle = {
        color: muted ? mutedColor : textColor,
        fontFamily: FONT_FAMILY,
        letterSpacing: -0.4, // Tight tracking for mobile
      };

      switch (variant) {
        // Page heading - 28px, semibold (600)
        // Mobile-sized for prominent page titles
        case 'heading':
          return {
            ...baseStyle,
            fontSize: 28,
            fontWeight: '600',
            letterSpacing: -0.6,
            lineHeight: 34,
          };
        
        // Section headers - 20px, bold (700)
        // Larger than web for mobile readability
        case 'section':
          return {
            ...baseStyle,
            fontSize: 20,
            fontWeight: '700',
            letterSpacing: -0.5,
            lineHeight: 26,
          };
        
        // Form labels - 15px, semibold (600), muted
        // Slightly larger for better readability
        case 'label':
          return {
            ...baseStyle,
            fontSize: 15,
            fontWeight: '600',
            color: `${mutedColor}B3`, // 70% opacity
            lineHeight: 20,
          };
        
        // Statistics - 32px, bold (700)
        // Large and prominent for key metrics
        case 'stat':
          return {
            ...baseStyle,
            fontSize: 32,
            fontWeight: '700',
            letterSpacing: -0.8,
            lineHeight: 38,
          };
        
        // Body semibold - 16px, semibold (600)
        // Mobile-optimized for comfortable reading
        case 'bodySemibold':
          return {
            ...baseStyle,
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 24,
          };
        
        // Body medium - 16px, medium (500)
        // Primary body text size
        case 'bodyMedium':
          return {
            ...baseStyle,
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 24,
          };
        
        // Caption muted - 13px, regular (400), muted
        // Smallest text for less important info
        case 'captionMuted':
          return {
            ...baseStyle,
            fontSize: 13,
            fontWeight: '400',
            color: `${mutedColor}B3`, // 70% opacity
            lineHeight: 18,
          };
        
        // Caption - 14px, regular (400)
        // Helper text and descriptions
        case 'caption':
          return {
            ...baseStyle,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
          };
        
        // Link - 16px, medium (500), underlined
        // Same size as body for consistency
        case 'link':
          return {
            ...baseStyle,
            fontSize: 16,
            fontWeight: '500',
            textDecorationLine: 'underline',
            lineHeight: 24,
          };
        
        // Default body - 16px, medium (500)
        // Comfortable reading size for mobile
        default:
          return {
            ...baseStyle,
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 24,
          };
      }
    };

    return (
      <RNText ref={ref} style={[getTextStyle(), style]} {...props}>
        {children}
      </RNText>
    );
  }
);
