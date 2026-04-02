import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Bubble, EdgeFade, Text } from '@/components/ui';
import { Colors, Layout, Sizes, Spacing, ZIndex } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export const MOBILE_HEADER_BAR_HEIGHT = Sizes.actionButtonLg;

export const getMobileHeaderHeight = (
  topInset: number,
  barHeight: number = MOBILE_HEADER_BAR_HEIGHT,
) =>
  topInset + barHeight + Spacing.xs;

export const getMobileHeaderContentInset = (
  topInset: number,
  barHeight: number = MOBILE_HEADER_BAR_HEIGHT,
) =>
  getMobileHeaderHeight(topInset, barHeight);

interface MobileHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  titleHidden?: boolean;
  barHeight?: number;
  sideSlotWidth?: number;
  showBackButton?: boolean;
  onBackPress?: () => void;
  border?: boolean;
  fadeHeight?: number;
  /** 0–1: solid portion of the header fade before it transitions to transparent. Default 0. */
  fadeIntensity?: number;
}

export function MobileHeader({
  title,
  subtitle,
  left,
  right,
  titleHidden = false,
  barHeight = MOBILE_HEADER_BAR_HEIGHT,
  sideSlotWidth = Sizes.actionButtonLg + Spacing.lg,
  showBackButton = false,
  onBackPress,
  border = false,
  fadeHeight,
  fadeIntensity = 0,
}: MobileHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const titleVisibility = useSharedValue(titleHidden ? 0 : 1);

  useEffect(() => {
    titleVisibility.value = withTiming(titleHidden ? 0 : 1, {
      duration: titleHidden ? 140 : 220,
    });
  }, [titleHidden, titleVisibility]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleVisibility.value,
    transform: [
      { translateY: (1 - titleVisibility.value) * -6 },
      { scale: 0.97 + titleVisibility.value * 0.03 },
    ],
  }));

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/(browse)');
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: border ? StyleSheet.hairlineWidth : 0,
          paddingTop: insets.top,
        },
      ]}
    >
      <EdgeFade edge="top" height={fadeHeight ?? insets.top + barHeight} intensity={fadeIntensity} />
      <View style={[styles.row, { minHeight: barHeight }]}>
        <View style={[styles.leftSlot, { width: sideSlotWidth }]}>
          {showBackButton ? (
            <Bubble
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
                <ArrowLeft size={Sizes.iconSm} color={colors.label} strokeWidth={2.4} />
            </Bubble>
          ) : left}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.titleSlot,
            { left: sideSlotWidth, right: sideSlotWidth },
            titleAnimatedStyle,
          ]}
        >
          <>
            {typeof title === 'string' ? (
              <Text variant="headline" numberOfLines={1} style={{ color: colors.label }}>
                {title}
              </Text>
            ) : (
              title
            )}
            {subtitle ? (
              typeof subtitle === 'string' ? (
                <Text variant="subhead" tone="secondary" numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : (
                subtitle
              )
            ) : null}
          </>
        </Animated.View>

        <View style={[styles.rightSlot, { width: sideSlotWidth }]}>{right}</View>
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
    zIndex: ZIndex.overlay,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlot: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2,
  },
  titleSlot: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    gap: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSlot: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 2,
  },
});
