/**
 * Custom Tab Bar - Shop-style UI
 * Left pill with grouped tabs, right circular search button
 * Shows back bubble when on nested screens (profile, settings)
 */

import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
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

const TAB_ICONS = {
  index: Home,
  messages: MessageCircle,
  saved: LayoutGrid,
  search: LayoutGrid,
};

// Main tabs - back button shows when NOT on these screens
const MAIN_TABS = ['index', 'messages', 'saved', 'search'];

// Back bubble size (matches pill height: 44 + padding 4*2 = 52)
const BACK_BUBBLE_SIZE = 52;
const GAP = 8;
const BACK_BUBBLE_OFFSET = BACK_BUBBLE_SIZE + GAP;

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  // Check if current screen is NOT a main tab (show back button)
  const currentRoute = state.routes[state.index];
  const showBackButton = !MAIN_TABS.includes(currentRoute.name);

  // Animation values
  const progress = useSharedValue(0);

  useEffect(() => {
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

  // Pill stays centered, the whole group shifts together
  const pillStyle = useAnimatedStyle(() => {
    return {
      // No transform needed - flexbox handles it naturally
    };
  });

  const handlePress = (route: typeof state.routes[0], index: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Always navigate back to home
    navigation.navigate('index');
  };

  return (
    <View style={styles.container}>
      {/* Tab bar content */}
      <View style={[styles.tabBarContent, { paddingBottom: insets.bottom + 6 }]}>
        {/* Animated container for back bubble + pill */}
        <View style={styles.navGroup}>
          {/* Back bubble - width animates from 0 */}
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

          {/* Pill Group with 3 tabs: Home, Messages, Browse */}
          <AnimatedView style={[
            styles.pillWrapper, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }, 
            pillStyle
          ]}>
            <View style={styles.pillContent}>
              {[state.routes[0], state.routes[1], state.routes[3]].map((route, idx) => {
                const actualIndex = idx === 2 ? 3 : idx;
                const isFocused = state.index === actualIndex;
                const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS] || Home;

                // Active: contrasting color (white on dark, black on light) with fill
                // Inactive: grey tone with surface fill
                const iconColor = isFocused 
                  ? (isDark ? '#FFFFFF' : '#000000')
                  : (isDark ? '#666666' : '#999999');

                return (
                  <Pressable
                    key={route.key}
                    onPress={() => handlePress(route, actualIndex)}
                    style={styles.pillTab}
                  >
                    <Icon
                      size={22}
                      color={iconColor}
                      fill={isFocused ? iconColor : colors.surface}
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

  // Tab bar content wrapper
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  // Navigation group - contains back bubble + pill
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Back bubble - circular button (matches pill height)
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

  // Pill Group
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

  // Individual pill tab
  pillTab: {
    width: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
