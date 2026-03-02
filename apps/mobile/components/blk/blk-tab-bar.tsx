/**
 * BlkTabBar - Tab bar for BLK premium screen
 * Shows: BLK-styled back bubble only
 */

import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { TabBarContainer } from '@/components/layout/tab-bar';
import { Colors, Sizes, Shadows, Spacing } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BlkTabBar() {
  const router = useRouter();
  const progress = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withTiming(1, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [0, 1]) }],
    width: interpolate(progress.value, [0, 1], [0, Sizes.bubbleMd]),
    marginRight: interpolate(progress.value, [0, 1], [0, Spacing.sm]),
  }));

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/');
  };

  return (
    <TabBarContainer>
      <AnimatedPressable
        onPress={handleBack}
        style={[
          styles.bubble,
          styles.glass,
          {
            // BLK premium styling
            borderColor: Colors.dark.blkBorder,
            backgroundColor: Colors.dark.oledBlack,
          },
          animatedStyle,
        ]}
      >
        <ChevronLeft
          size={Sizes.iconMd}
          color={Colors.dark.blkText}
          strokeWidth={2}
        />
      </AnimatedPressable>
    </TabBarContainer>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: Sizes.bubbleMd,
    height: Sizes.bubbleMd,
    borderRadius: Sizes.bubbleMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 1,
    ...Shadows.md,
  },
});
