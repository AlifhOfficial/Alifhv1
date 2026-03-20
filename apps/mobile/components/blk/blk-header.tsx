/**
 * BLK Header - Premium Signature Line header
 * Simple centered glass pill badge with back button
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Data, HapticPressable } from '@/components/ui';

// Header content height for padding calculation
export const BLK_HEADER_HEIGHT = 56;

interface BlkHeaderProps {}

export function BlkHeader({}: BlkHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      {/* Back Button */}
      <View
        style={[
          styles.backButton,
          styles.glass,
          { 
            backgroundColor: colors.glassBackground, 
            borderColor: colors.glassBorderOnDark 
          }
        ]}
      >
        <HapticPressable 
          onPress={() => router.back()}
          style={styles.buttonInner}
        >
          <ChevronLeft size={Sizes.iconMd} color={colors.oledWhite} strokeWidth={2} />
        </HapticPressable>
      </View>

      {/* BLK Pill - next to back button */}
      <View 
        style={[
          styles.pill,
          styles.glass,
          { 
            backgroundColor: colors.glassBackground, 
            borderColor: colors.glassBorderOnDark 
          }
        ]}
      >
        <HapticPressable 
          style={styles.pillInner}
          hitSlop={Layout.hitSlop}
          onPress={() => {}}
        >
          {({ pressed }) => (
            <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
              <Data size="small" style={{ color: colors.oledWhite }}>BLK</Data>
            </View>
          )}
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  glass: {
    borderWidth: 1,
  },
  backButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Sizes.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
