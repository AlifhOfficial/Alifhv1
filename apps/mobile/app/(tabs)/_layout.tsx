/**
 * Tab Layout - Revvup Mobile App
 * 3 tabs: Home, Browse, Messages
 * Floating individual pill chips — no outer wrapper shell.
 */

import { HapticPressable } from '@/components/ui';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router/tabs';
import { usePathname } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store, MessageCircle, LayoutGrid } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/theme-context';
import { useAuth, type AuthSheetContext } from '@/context/auth-context';
import { useSearch } from '@/context/search-context';
import { useConversations } from '@/components/messages/hooks/useConversations';
import { nativeSheetVisibility } from '@/lib/native-sheet-visibility';
import { AppFontFamilies, BorderWidths, Colors, Radius, Shadows, Sizes, Spacing, Typography, ZIndex } from '@/constants/theme';

type TabConfigItem = {
  name: '(home)' | '(messages)' | '(browse)';
  icon: LucideIcon;
  label: string;
  fillActive?: boolean;
};

const TAB_CONFIG = [
  { name: '(home)', icon: Store, label: 'Home', fillActive: false },
  { name: '(browse)', icon: LayoutGrid, label: 'Browse', fillActive: false },
  { name: '(messages)', icon: MessageCircle, label: 'Chats', fillActive: false },
] as const satisfies readonly TabConfigItem[];

const ACTIVE_ICON_STROKE = 2.5;
const INACTIVE_ICON_STROKE = 2.5;
const TAB_SPRING_CONFIG = { damping: 20, stiffness: 260, mass: 0.6 };
const TAB_FADE_DURATION_MS = 210;

const AnimatedText = Animated.createAnimatedComponent(Text);

type AnimatedTabChipProps = {
  label: string;
  Icon: LucideIcon;
  focused: boolean;
  unreadCount?: number;
  activeColor: string;
  inactiveColor: string;
  transparentActiveColor: string;
  activeFillColor?: string;
  onPress: () => void;
  onLayout: (x: number, width: number) => void;
};

const toRgbaColor = (hex: string, alpha: number) => {
  'worklet';

  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized;

  if (expanded.length !== 6) {
    return hex;
  }

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function AnimatedTabChip({
  label,
  Icon,
  focused,
  unreadCount = 0,
  activeColor,
  inactiveColor,
  transparentActiveColor,
  activeFillColor,
  onPress,
  onLayout,
}: AnimatedTabChipProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: TAB_FADE_DURATION_MS });
  }, [focused, progress]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.98, 1.04]) }],
  }));

  const activeLayerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const inactiveLayerStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  return (
    <HapticPressable
      onPress={onPress}
      onLayout={(event) => {
        const { x, width } = event.nativeEvent.layout;
        onLayout(x, width);
      }}
      style={styles.chip}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.chipContent, contentAnimatedStyle]}>
        <View style={styles.iconStack}>
          <Animated.View style={[styles.overlayLayer, inactiveLayerStyle]}>
            <Icon
              size={Sizes.iconMd}
              color={inactiveColor}
              strokeWidth={INACTIVE_ICON_STROKE}
              fill={transparentActiveColor}
            />
          </Animated.View>
          <Animated.View style={[styles.overlayLayer, activeLayerStyle]}>
            <Icon
              size={Sizes.iconMd}
              color={activeColor}
              strokeWidth={ACTIVE_ICON_STROKE}
              fill={activeFillColor ?? activeColor}
            />
          </Animated.View>
          {unreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
            </View>
          )}
        </View>

        <View style={styles.labelStack}>
          <AnimatedText
            style={[
              Typography.subheadEmphasized,
              styles.chipLabel,
              styles.labelBase,
              { color: inactiveColor, fontFamily: AppFontFamilies.bold },
              inactiveLayerStyle,
            ]}
          >
            {label}
          </AnimatedText>
          <AnimatedText
            style={[
              Typography.subheadEmphasized,
              styles.chipLabel,
              styles.labelOverlay,
              { color: activeColor, fontFamily: AppFontFamilies.bold },
              activeLayerStyle,
            ]}
          >
            {label}
          </AnimatedText>
        </View>
      </Animated.View>
    </HapticPressable>
  );
}

const PROTECTED_TABS: Partial<Record<TabConfigItem['name'], AuthSheetContext>> = {
  '(messages)': 'messages',
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const pathname = usePathname();
  const { colorScheme } = useTheme();
  const { triggerScrollToTop } = useSearch();
  const { isAuthenticated, user, showAuthSheet } = useAuth();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [chipLayouts, setChipLayouts] = React.useState<Record<number, { x: number; width: number }>>({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  // Light: white shell, slightly elevated white chip (bg on surface)
  // Dark:  black shell, slightly elevated black chip (background on surface)
  const shellBg = toRgbaColor(colors.background, colorScheme === 'dark' ? 0.84 : 0.92);
  const shellBorder = colorScheme === 'dark' ? toRgbaColor(colors.border, 0.58) : colors.border;

  const chipActiveBg = colorScheme === 'dark' ? toRgbaColor(colors.background, 0.8) : colors.background;
  const chipActiveBorder = colorScheme === 'dark' ? toRgbaColor(colors.border, 0.52) : colors.border;
  const chipActiveContent = colors.label;
  const chipInactiveContent = colors.labelTertiary;
  const chipTransparentActiveContent = React.useMemo(
    () => toRgbaColor(chipActiveContent, 0),
    [chipActiveContent],
  );

  // Mobile tabs only show user chats (personal scope), never staff.
  const { totalUnread: personalUnreadChats } = useConversations({
    isAuthenticated,
    userId: user?.id,
    scope: 'personal',
  });

  const unreadChats = isAuthenticated ? personalUnreadChats : 0;

  React.useEffect(() => {
    const activeLayout = chipLayouts[state.index];

    if (!activeLayout) {
      return;
    }

    indicatorX.value = withSpring(activeLayout.x, TAB_SPRING_CONFIG);
    indicatorWidth.value = withSpring(activeLayout.width, TAB_SPRING_CONFIG);
    indicatorOpacity.value = withTiming(1, { duration: 140 });
  }, [chipLayouts, indicatorOpacity, indicatorWidth, indicatorX, state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const hideForSheet = nativeSheetVisibility.hideOverlays(pathname.split('/').filter(Boolean));

  // Hide the custom tab bar on native sheets for cross-platform stability.
  // Must be AFTER all hook calls to satisfy Rules of Hooks.
  if (hideForSheet) {
    return null;
  }

  return (
    <View
      style={[styles.wrapper, { paddingBottom: insets.bottom }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.shell,
          {
            backgroundColor: shellBg,
            borderColor: shellBorder,
            shadowColor: colors.black,
          },
        ]}
      >
        <View style={styles.row}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicator,
              {
                backgroundColor: chipActiveBg,
                borderColor: chipActiveBorder,
              },
              animatedIndicatorStyle,
            ]}
          />
          {TAB_CONFIG.map((tab, index) => {
            const focused = state.index === index;

            return (
              <AnimatedTabChip
                key={tab.name}
                label={tab.label}
                Icon={tab.icon}
                focused={focused}
                unreadCount={tab.name === '(messages)' ? unreadChats : 0}
                activeColor={chipActiveContent}
                inactiveColor={chipInactiveContent}
                transparentActiveColor={chipTransparentActiveContent}
                activeFillColor={tab.fillActive ? chipActiveContent : chipTransparentActiveContent}
                onPress={() => {
                  const requiredAuthContext = PROTECTED_TABS[tab.name];
                  if (requiredAuthContext && !isAuthenticated) {
                    showAuthSheet(requiredAuthContext);
                    return;
                  }

                  if (focused) {
                    triggerScrollToTop();
                    return;
                  }

                  const event = navigation.emit({
                    type: 'tabPress',
                    target: state.routes[index].key,
                    canPreventDefault: true,
                  });
                  if (!event.defaultPrevented) {
                    navigation.navigate(state.routes[index].name);
                  }
                }}
                onLayout={(x, width) => {
                  setChipLayouts((prev) => {
                    const current = prev[index];
                    if (current && current.x === x && current.width === width) {
                      return prev;
                    }

                    return {
                      ...prev,
                      [index]: { x, width },
                    };
                  });
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(browse)" />
      <Tabs.Screen name="(messages)" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: ZIndex.modal,
    elevation: ZIndex.modal,
  },
  shell: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    borderWidth: BorderWidths.thin,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    ...Shadows.lg,
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: Radius.full,
    borderWidth: BorderWidths.thin,
  },
  chip: {
    zIndex: 1,
    borderRadius: Radius.full,
    minWidth: Sizes.actionButtonLg + Spacing.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  chipContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconStack: {
    width: Sizes.iconMd,
    height: Sizes.iconMd,
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 16,
    height: 16,
    borderRadius: Radius.full,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 9,
    lineHeight: 11,
    color: '#FFFFFF',
    fontFamily: AppFontFamilies.bold,
  },
  overlayLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelStack: {
    position: 'relative',
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  chipLabel: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 14,
  },
  labelBase: {
    opacity: 1,
  },
  labelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
