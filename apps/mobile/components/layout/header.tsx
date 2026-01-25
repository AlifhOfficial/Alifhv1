/**
 * Header - Mobile
 * 
 * Revolut-inspired dynamic header component
 * Clean, minimal design with smooth animations
 */

import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '@/theme/globals';
import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';

interface HeaderProps {
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Left action component (e.g., back button) */
  left?: ReactNode;
  /** Right action component (e.g., menu button) */
  right?: ReactNode;
  /** Whether to show bottom border */
  bordered?: boolean;
  /** Whether header is transparent */
  transparent?: boolean;
  /** Custom children instead of title */
  children?: ReactNode;
}

export function Header({
  title,
  subtitle,
  left,
  right,
  bordered = false,
  transparent = false,
  children,
}: HeaderProps) {
  const bg = useColor('background');
  const card = useColor('card');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const border = useColor('border');

  return (
    <View 
      style={[
        styles.container,
        !transparent && { backgroundColor: card },
        bordered && { borderBottomWidth: 0.5, borderBottomColor: border },
      ]}
    >
      {/* Left slot */}
      <View style={styles.leftSlot}>
        {left}
      </View>

      {/* Center content */}
      <View style={styles.center}>
        {children ? (
          children
        ) : (
          <>
            {title && (
              <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: mutedFg }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Right slot */}
      <View style={styles.rightSlot}>
        {right}
      </View>
    </View>
  );
}

/**
 * HeaderButton - Action button for header
 */
interface HeaderButtonProps {
  icon: ReactNode;
  onPress: () => void;
  badge?: number;
}

export function HeaderButton({ icon, onPress, badge }: HeaderButtonProps) {
  const accent = useColor('accent');
  const primary = useColor('primary');

  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor: accent }]}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: primary }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    gap: 12,
  },
  leftSlot: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: -0.2,
    marginTop: 1,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONT_FAMILY_BOLD,
  },
});
