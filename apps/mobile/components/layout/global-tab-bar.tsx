/**
 * Global Tab Bar - Renders on all screens
 * Uses expo-router navigation
 */

import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Home, MessageCircle, LayoutGrid, ChevronLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.View;

type TabRoute = {
  name: string;
  path: string;
  icon: typeof Home;
};

const TABS: TabRoute[] = [
  { name: 'index', path: '/', icon: Home },
  { name: 'messages', path: '/messages', icon: MessageCircle },
  { name: 'search', path: '/search', icon: LayoutGrid },
];

// Main tab paths
const MAIN_TAB_PATHS = ['/', '/messages', '/search', '/(tabs)', '/(tabs)/index', '/(tabs)/messages', '/(tabs)/search'];

// Back bubble size (matches pill height: 44 + padding 4*2 = 52)
const BACK_BUBBLE_SIZE = 52;
const GAP = 8;

export function GlobalTabBar() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const pathname = usePathname();

  // Check if current screen is NOT a main tab (show back button)
  const showBackButton = !MAIN_TAB_PATHS.includes(pathname);

  // Animation values
  const progress = useSharedValue(showBackButton ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(showBackButton ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [showBackButton]);

  // Back bubble animates in from left
  const backBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        { scale: interpolate(progress.value, [0, 1], [0.9, 1]) },
      ],
      width: interpolate(progress.value, [0, 1], [0, BACK_BUBBLE_SIZE]),
      marginRight: interpolate(progress.value, [0, 1], [0, GAP]),
    };
  });

  const pillStyle = useAnimatedStyle(() => {
    return {};
  });

  const handleTabPress = (tab: TabRoute) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(tab.path as any);
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/');
  };

  // Determine which tab is active
  const getIsActive = (tab: TabRoute) => {
    if (tab.name === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname === tab.path || pathname === `/(tabs)/${tab.name}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.tabBarContent, { paddingBottom: insets.bottom + 6 }]}>
        <View style={styles.navGroup}>
          {/* Back bubble */}
          <AnimatedPressable
            onPress={handleBack}
            style={[
              styles.backBubble,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              backBubbleStyle,
            ]}
            pointerEvents={showBackButton ? 'auto' : 'none'}
          >
            <ChevronLeft
              size={22}
              color={isDark ? '#FFFFFF' : '#000000'}
              strokeWidth={2}
            />
          </AnimatedPressable>

          {/* Pill Group */}
          <AnimatedView style={[
            styles.pillWrapper, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }, 
            pillStyle
          ]}>
            <View style={styles.pillContent}>
              {TABS.map((tab) => {
                const isActive = getIsActive(tab);
                const Icon = tab.icon;

                const iconColor = isActive 
                  ? (isDark ? '#FFFFFF' : '#000000')
                  : (isDark ? '#666666' : '#999999');

                return (
                  <Pressable
                    key={tab.name}
                    onPress={() => handleTabPress(tab)}
                    style={styles.pillTab}
                  >
                    <Icon
                      size={22}
                      color={iconColor}
                      fill={isActive ? iconColor : colors.surface}
                      strokeWidth={2}
                    />
                  </Pressable>
                );
              })}
            </View>
          </AnimatedView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pillWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 4,
  },
  pillTab: {
    width: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
