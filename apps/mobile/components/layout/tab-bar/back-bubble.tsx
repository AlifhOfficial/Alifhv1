/**
 * BackBubble - Animated back navigation bubble with micro-animation
 */

import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Shadows, Spacing } from '@/constants/theme';

const GAP = Spacing.sm;

interface BackBubbleProps {
  visible: boolean;
  variant?: 'default' | 'blk';
}

export function BackBubble({ visible, variant = 'default' }: BackBubbleProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/');
  };

  const isBlk = variant === 'blk';

  return (
    <MotiView
      animate={{
        scale: visible ? 1 : 0,
        width: visible ? Sizes.actionButtonLg : 0,
        marginRight: visible ? GAP : 0,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        type: 'timing',
        duration: 200,
      }}
      style={styles.wrapper}
    >
      <MotiPressable
        onPress={handleBack}
        animate={({ pressed }) => {
          'worklet';
          return {
            scale: pressed ? 0.92 : 1,
          };
        }}
        transition={{
          type: 'timing',
          duration: 120,
        }}
        style={[
          styles.bubble,
          styles.glass,
          isBlk ? {
            borderColor: Colors.dark.blkBorder,
            backgroundColor: Colors.dark.oledBlack,
          } : {
            borderColor: colors.glassBorder,
            backgroundColor: colorScheme === 'dark' ? colors.oledBlack : colors.oledWhite,
          },
        ]}
        disabled={!visible}
      >
        <ChevronLeft
          size={Sizes.iconMd}
          color={isBlk ? Colors.dark.blkText : colors.text}
          strokeWidth={2}
        />
      </MotiPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  bubble: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 1,
    ...Shadows.md,
  },
});
