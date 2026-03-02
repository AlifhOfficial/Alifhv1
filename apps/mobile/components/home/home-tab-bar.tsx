/**
 * HomeTabBar - Tab bar for home screen
 * Shows: tabs pill + create bubble
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';

import { TabBarContainer, TabsPill } from '@/components/layout/tab-bar';
import { CreateListingFlow } from '@/components/sheets';
import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Shadows, Spacing } from '@/constants/theme';

const GAP = Spacing.md;

export function HomeTabBar() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreatePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsCreateOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setIsCreateOpen(false);
  }, []);

  const handleCreateSuccess = useCallback((listingId: string) => {
    setIsCreateOpen(false);
    router.push(`/listing/${listingId}` as any);
  }, [router]);

  return (
    <>
      <TabBarContainer>
        <TabsPill />
        
        {/* Create bubble */}
        <MotiPressable
          onPress={handleCreatePress}
          animate={({ pressed }) => {
            'worklet';
            return {
              scale: pressed ? 0.92 : 1,
            };
          }}
          transition={{
            type: 'timing',
            duration: 150,
          }}
          style={[
            styles.bubble,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colorScheme === 'dark' ? colors.oledBlack : colors.oledWhite,
              marginLeft: GAP,
            },
          ]}
        >
          <Plus
            size={Sizes.iconXl}
            color={colors.text}
            strokeWidth={2.5}
          />
        </MotiPressable>
      </TabBarContainer>

      <CreateListingFlow
        visible={isCreateOpen}
        onClose={handleCreateClose}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
