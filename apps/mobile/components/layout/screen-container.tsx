/**
 * ScreenContainer - Mobile
 * 
 * Base layout wrapper for all screens
 * Provides consistent safe area handling and structure:
 * - Header slot (top, respects safe area)
 * - Content slot (center, flexible)
 * - Tab bar handled by navigator (bottom)
 */

import { useColor } from '@/hooks/useColor';
import { ReactNode } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: ReactNode;
  /** Header component to render at top */
  header?: ReactNode;
  /** Whether to add horizontal padding to content */
  padded?: boolean;
  /** Background color override */
  backgroundColor?: string;
}

export function ScreenContainer({
  children,
  header,
  padded = false,
  backgroundColor,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const bg = useColor('background');
  const bgColor = backgroundColor || bg;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent"
        translucent
      />
      
      {/* Safe area spacer for status bar */}
      <View style={{ height: insets.top, backgroundColor: bgColor }} />
      
      {/* Header slot */}
      {header && (
        <View style={styles.headerSlot}>
          {header}
        </View>
      )}
      
      {/* Content area */}
      <View style={[styles.content, padded && styles.padded]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSlot: {
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 16,
  },
});
