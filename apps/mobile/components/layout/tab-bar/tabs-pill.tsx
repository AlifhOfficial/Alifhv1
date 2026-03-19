/**
 * TabsPill - Main 3-tab navigation pill (home, messages, browse)
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Home, MessageCircle, LayoutGrid } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { useAuth } from '@/context/auth-context';
import { Colors, Sizes, Shadows, Spacing } from '@/constants/theme';
import { fetchConversations } from '@/lib/messaging-api';
import { queryKeys } from '@/lib/query-client';

type TabRoute = {
  name: string;
  path: string;
  icon: typeof Home;
};

const TABS: TabRoute[] = [
  { name: 'index', path: '/', icon: Home },
  { name: 'messages', path: '/messages', icon: MessageCircle },
  { name: 'browse', path: '/browse', icon: LayoutGrid },
];

export function TabsPill() {
  const { colorScheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { triggerScrollToTop } = useSearch();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const pathname = usePathname();
  
  const lastBrowseTapRef = React.useRef<number>(0);

  // Derive hasUnread from conversations (no separate API call)
  const { data: conversationsData } = useQuery({
    queryKey: queryKeys.conversations('personal'),
    queryFn: () => fetchConversations({ scope: 'personal', limit: 50 }),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const hasUnread = useMemo(
    () => conversationsData?.conversations?.some(c => c.unreadCount > 0) ?? false,
    [conversationsData]
  );

  const getIsActive = (tab: TabRoute) => {
    if (tab.name === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname === tab.path;
  };

  const handleTabPress = (tab: TabRoute) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Double-tap detection for browse tab
    if (tab.name === 'browse') {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastBrowseTapRef.current < DOUBLE_TAP_DELAY) {
        triggerScrollToTop();
        lastBrowseTapRef.current = 0;
        return;
      }
      
      lastBrowseTapRef.current = now;
    }
    
    router.push(tab.path as any);
  };

  return (
    <View style={[
      styles.pillWrapper,
      styles.glass,
      {
        borderColor: colors.glassBorder,
        backgroundColor: colorScheme === 'dark' ? colors.oledBlack : colors.oledWhite,
      },
    ]}>
      <View style={styles.pillContent}>
        {TABS.map((tab) => {
          const isActive = getIsActive(tab);
          const Icon = tab.icon;
          const iconColor = isActive ? colors.text : colors.iconMuted;

          return (
            <MotiPressable
              key={tab.name}
              onPress={() => handleTabPress(tab)}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed ? 0.88 : 1,
                };
              }}
              transition={{
                type: 'timing',
                duration: 100,
              }}
              style={styles.pillTab}
            >
              <Icon
                size={Sizes.iconLg}
                color={iconColor}
                fill={isActive ? iconColor : 'none'}
                strokeWidth={2}
              />
              {tab.name === 'messages' && hasUnread && (
                <View style={[styles.unreadDot, { backgroundColor: '#3B82F6' }]} />
              )}
            </MotiPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pillWrapper: {
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    ...Shadows.lg,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  pillTab: {
    width: Sizes.actionButtonMd,
    height: Sizes.bubbleMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 1,
    ...Shadows.md,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.xs,
  },
});
