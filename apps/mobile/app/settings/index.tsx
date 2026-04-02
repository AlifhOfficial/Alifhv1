/**
 * Settings Screen - Account Settings (Stack Screen with swipe back)
 * Native-feeling, modular settings screen connected to API
 */

import { Skeleton } from '@/components/ui';
import React, { useCallback } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer, MobileHeader, getMobileHeaderContentInset } from '@/components/layout';

import { Layout, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import {
  useSettingsColors,
  useSettings,
  PrivacySection,
  SellingSection,
  IdentitySection,
  SupportSection,
  DangerZone,
  type KYCStatus,
} from '@/components/settings';

export default function SettingsScreen() {
  const colors = useSettingsColors();
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  const router = useRouter();

  const {
    isLoading,
    profile,
    savingField,
    showPhone,
    consignmentMode,
    saveToggle,
  } = useSettings({ isAuthenticated, userId: user?.id });

  const kycStatus: KYCStatus = {
    kycVerified: profile?.kycVerified ?? false,
    kycStatus: profile?.kycStatus ?? 'none',
    kycExpiryDate: profile?.kycExpiresAt ? new Date(profile.kycExpiresAt) : null,
  };

  const handleHelpPress = useCallback(() => {
    Linking.openURL('https://revvup.ae/faq');
  }, []);

  const handleFeedbackPress = useCallback(() => {
    Linking.openURL('https://revvup.ae/contact');
  }, []);

  if (!isAuthenticated) {
    return <Redirect href={{ pathname: '/auth-prompt', params: { context: 'profile' } }} />;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <MobileHeader title="Settings" showBackButton />
        <View style={[styles.skeletonContainer, { paddingHorizontal: Layout.screenPadding, paddingTop: headerInset }]}> 
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={72} borderRadius={Radius.xl} />
          </View>
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={72} borderRadius={Radius.xl} />
          </View>
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={72} borderRadius={Radius.xl} />
          </View>
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={110} borderRadius={Radius.xl} />
          </View>
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={52} borderRadius={Radius.xl} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScreenContainer
        header={({ titleHidden }) => (
          <MobileHeader
            title="Settings"
            showBackButton
            titleHidden={titleHidden}
          />
        )}
        keyboardAvoiding={false}
        verticalPadding={0}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingTop: headerInset }}
      >
        <PrivacySection
          showPhone={showPhone}
          savingField={savingField}
          colors={colors}
          onToggleShowPhone={() => saveToggle('showPhone', showPhone)}
        />

        <SellingSection
          consignmentMode={consignmentMode}
          savingField={savingField}
          colors={colors}
          onToggleConsignment={() => saveToggle('consignmentMode', consignmentMode)}
        />

        <IdentitySection
          status={kycStatus}
          colors={colors}
          onAction={() => router.push('/settings/verify-identity')}
        />

        <SupportSection
          colors={colors}
          onHelpPress={handleHelpPress}
          onFeedbackPress={handleFeedbackPress}
        />

        <DangerZone
          colors={colors}
          onDeletePress={() => router.push('/settings/delete-account')}
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonSection: {
    marginBottom: Spacing.xl,
  },
});