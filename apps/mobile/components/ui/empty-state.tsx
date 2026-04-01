/**
 * EmptyState — Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Standard empty state component following the Revvup Apple-style pattern:
 *   • Large circular icon container (fill3 bg + hairline border)
 *   • title1 bold title
 *   • subhead muted subtitle
 *   • Optional primary action button
 *
 * USAGE:
 *   import { EmptyState } from '@/components/ui';
 *   import { Heart } from 'lucide-react-native';
 *
 *   <EmptyState
 *     icon={Heart}
 *     title="Your favorites is empty."
 *     subtitle="Tap the heart on any listing to save it here."
 *   />
 *
 *   // With action:
 *   <EmptyState
 *     icon={Calendar}
 *     title="No bookings yet."
 *     subtitle="When you book a test drive, it will appear here."
 *     action={{ label: 'Browse Cars', onPress: handleBrowse, icon: ArrowRight }}
 *   />
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Colors, Radius, Sizes, Spacing, Stroke, scale } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Text } from './text';
import { HapticPressable } from './haptic-pressable';

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

const ICON_SIZE = scale(44);
const ICON_CONTAINER_SIZE = scale(92);

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export type EmptyStateIconComponent = React.ComponentType<{
  size: number;
  color: string;
  strokeWidth: number;
}>;

export interface EmptyStateAction {
  /** Button label */
  label: string;
  /** Called when button is pressed */
  onPress: () => void;
  /** Optional leading icon */
  icon?: EmptyStateIconComponent;
}

export interface EmptyStateProps {
  /** Lucide icon component (not a rendered element) */
  icon: EmptyStateIconComponent;
  /** Bold title — include period e.g. "No bookings yet." */
  title: string;
  /** Muted supporting subtitle */
  subtitle: string;
  /** Optional primary CTA button */
  action?: EmptyStateAction;
  /** Override outer container style */
  style?: ViewStyle;
}

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  style,
}: EmptyStateProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, style]}
    >
      {/* Icon bubble */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.fill3,
            borderColor: colors.border,
          },
        ]}
      >
        <Icon
          size={ICON_SIZE}
          color={colors.labelTertiary}
          strokeWidth={Stroke.icon}
        />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text variant="headline" style={[styles.title, { color: colors.label }]}>
          {title}
        </Text>
        <Text variant="subhead" style={[styles.subtitle, { color: colors.labelSecondary }]}>
          {subtitle}
        </Text>
      </View>

      {/* Optional action */}
      {action && (
        <HapticPressable
          haptic="medium"
          onPress={action.onPress}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          {action.icon && (
            <action.icon
              size={Sizes.iconSm}
              color={colors.primaryForeground}
              strokeWidth={Stroke.icon}
            />
          )}
          <Text variant="subhead" style={{ color: colors.primaryForeground }}>
            {action.label}
          </Text>
        </HapticPressable>
      )}
    </Animated.View>
  );
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing['2xl'],
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
});
