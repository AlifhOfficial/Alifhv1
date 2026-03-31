/**
 * Button Component - Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A flexible button component with primary, secondary, and ghost variants.
 * Uses theme colors and follows the design system patterns.
 * 
 * USAGE:
 *    * 
 *   <Button onPress={handlePress}>Primary Button</Button>
 *   <Button variant="secondary" onPress={handlePress}>Secondary</Button>
 *   <Button variant="ghost" onPress={handlePress}>Ghost</Button>
 *   <Button size="small" icon={<Icon />}>With Icon</Button>
 *   <Button loading>Loading...</Button>
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Text } from './text';
import React, { memo } from 'react';
import { Pressable, PressableProps, StyleSheet, View, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button content */
  children: React.ReactNode;
  /** Show loading spinner */
  loading?: boolean;
  /** Icon to show before text */
  icon?: React.ReactNode;
  /** Icon to show after text */
  iconAfter?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
}

// ═══════════════════════════════════════════════════
// SIZE CONFIG
// ═══════════════════════════════════════════════════

const sizeConfig = {
  small: {
    height: Sizes.actionButtonSm,
    paddingHorizontal: Spacing.md,
    textSize: 'subhead' as const,
    iconSize: Spacing.lg,
  },
  medium: {
    height: Sizes.actionButtonMd + Spacing.xs,
    paddingHorizontal: Spacing.lg,
    textSize: 'callout' as const,
    iconSize: Sizes.iconSm,
  },
  large: {
    height: Spacing['5xl'] + Spacing.xs,
    paddingHorizontal: Spacing.xl,
    textSize: 'headline' as const,
    iconSize: Spacing.xl,
  },
};

// ═══════════════════════════════════════════════════
// BUTTON COMPONENT
// ═══════════════════════════════════════════════════

export const Button = memo(function Button({
  variant = 'primary',
  size = 'medium',
  children,
  loading = false,
  icon,
  iconAfter,
  fullWidth = false,
  disabled,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const config = sizeConfig[size];

  // Get colors based on variant
  const getVariantStyles = (pressed: boolean) => {
    const baseOpacity = pressed ? 0.85 : 1;
    const disabledOpacity = disabled ? 0.5 : 1;

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          textColor: colors.primaryForeground,
          opacity: baseOpacity * disabledOpacity,
        };
      case 'secondary':
        return {
          backgroundColor: colors.surfaceSecondary,
          textColor: colors.label,
          opacity: baseOpacity * disabledOpacity,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? colors.fill2 : 'transparent',
          textColor: colors.label,
          opacity: disabledOpacity,
        };
      case 'destructive':
        return {
          backgroundColor: colors.error,
          textColor: colors.primaryForeground,
          opacity: baseOpacity * disabledOpacity,
        };
      default:
        return {
          backgroundColor: colors.primary,
          textColor: colors.primaryForeground,
          opacity: baseOpacity * disabledOpacity,
        };
    }
  };

  const variantStyles = getVariantStyles(false);

  return (
    <Pressable
      {...props}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => {
        const pressedStyles = getVariantStyles(pressed);
        return [
          styles.base,
          {
            height: config.height,
            paddingHorizontal: config.paddingHorizontal,
            backgroundColor: pressedStyles.backgroundColor,
            opacity: pressedStyles.opacity,
            borderRadius: variant === 'secondary' ? Radius.sheet : Radius.lg,
          },
          fullWidth && styles.fullWidth,
          style,
        ];
      }}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={variantStyles.textColor} />
        ) : (
          <>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text variant={config.textSize} style={{ color: variantStyles.textColor }}>
              {children}
            </Text>
            {iconAfter && <View style={styles.iconRight}>{iconAfter}</View>}
          </>
        )}
      </View>
    </Pressable>
  );
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  iconLeft: {
    marginRight: Spacing.xs,
  },
  iconRight: {
    marginLeft: Spacing.xs,
  },
});
