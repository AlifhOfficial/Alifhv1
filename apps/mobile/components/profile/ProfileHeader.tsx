/**
 * Profile Header Component
 * Glass pill style matching other headers
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable, Data, useAlert } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Settings2, User, LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Layout, Sizes, ZIndex} from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import type { ThemeColors } from './types';

interface ProfileHeaderProps {
  colors: ThemeColors;
  topInset: number;
}

export function ProfileHeader({ colors, topInset }: ProfileHeaderProps) {
  const router = useRouter();
  const { signOut, isAuthenticated } = useAuth();
  const { showAlert } = useAlert();

  const handleSignOut = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    showAlert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <View style={[styles.header, { paddingTop: topInset + Layout.headerPadding }]}>
      {/* Left: Profile Title Pill */}
      <View
        style={[
          styles.pillButton,
          styles.glass,
          {
            borderColor: colors.glassBorder,
            backgroundColor: colors.glassBg,
          },
        ]}
      >
        <View style={styles.pillContent}>
          <User size={Sizes.iconXs} color={colors.icon} strokeWidth={2} />
          <Data size="bodySm">Profile</Data>
        </View>
      </View>

      {/* Right: Action Bubbles */}
      <View style={styles.rightSection}>
        {/* Settings Bubble */}
        <HapticPressable
          onPress={() => router.push('/settings')}
          style={[
            styles.bubble,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBg,
            },
          ]}
        >
          {({ pressed }) => (
            <Settings2
              size={Sizes.iconXs}
              color={colors.icon}
              strokeWidth={2}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </HapticPressable>

        {/* Sign Out Bubble - only show when authenticated */}
        {isAuthenticated && (
          <HapticPressable
            onPress={handleSignOut}
            style={[
              styles.bubble,
              styles.glass,
              {
                borderColor: colors.glassBorder,
                backgroundColor: colors.glassBg,
              },
            ]}
          >
            {({ pressed }) => (
              <LogOut
                size={Sizes.iconXs}
                color={colors.error}
                strokeWidth={2}
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
            )}
          </HapticPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
  },
  glass: {
    borderWidth: 1,
  },
  pillButton: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Sizes.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bubble: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
