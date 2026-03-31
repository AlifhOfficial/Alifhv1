/**
 * Settings Screen - Account Settings (Stack Screen with swipe back)
 * Native-feeling, modular settings screen connected to API
 */

import { Skeleton, AuthRequiredEmptyState, useAlert } from '@/components/ui';
import React, { useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import {
  StyleSheet, View, Linking } from 'react-native';
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
  // SecuritySection, // TODO: Enable passkeys in v2
  SupportSection,
  DangerZone,
  DeleteAccountSheet,
  KycVerificationSheet,
  type KYCStatus,
} from '@/components/settings';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SettingsScreen() {
  const colors = useSettingsColors();
  const { signOut, isAuthenticated, user } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);

  // Settings data from hook
  const {
    isLoading,
    profile,
    savingField,
    isDeleting,
    showPhone,
    consignmentMode,
    loadProfile,
    saveToggle,
    deleteAccount,
    setIsDeleting,
  } = useSettings({ isAuthenticated, userId: user?.id });

  const kycStatus: KYCStatus = {
    kycVerified: profile?.kycVerified ?? false,
    kycStatus: profile?.kycStatus ?? 'none',
    kycExpiryDate: profile?.kycExpiresAt ? new Date(profile.kycExpiresAt) : null,
  };

  // Local UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showKycSheet, setShowKycSheet] = useState(false);

  const handleDeleteAccount = useCallback(() => {
    deleteAccount(() => {
      setShowDeleteModal(false);
      showAlert(
        'Account Deletion Requested',
        'Your account has been deactivated and will be permanently deleted after 6 months. We retain your data during this period to comply with UAE regulations.',
        [{ text: 'OK', onPress: () => signOut() }]
      );
    });
  }, [deleteAccount, signOut, showAlert]);

  const handleHelpPress = useCallback(() => {
    Linking.openURL('https://revvup.ae/faq');
  }, []);

  const handleFeedbackPress = useCallback(() => {
    Linking.openURL('https://revvup.ae/contact');
  }, []);

  const nativeHeaderOptions = {
    headerShown: false,
  };

  // Unauthenticated - show auth required empty state
  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen
          options={{
            ...nativeHeaderOptions,
            title: 'Settings',
            headerTintColor: colors.label,
          }}
        />
        <MobileHeader title="Settings" showBackButton />
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: headerInset }]}> 
          <AuthRequiredEmptyState
            title="Sign in to settings"
            subtitle="Manage your account preferences on Revvup"
          />
        </View>
      </>
    );
  }

  // Loading state — skeleton
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            ...nativeHeaderOptions,
            title: 'Settings',
            headerTintColor: colors.label,
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
          <MobileHeader title="Settings" showBackButton />
          <View style={[styles.skeletonContainer, { paddingHorizontal: Layout.screenPadding, paddingTop: headerInset }]}> 
            {/* Privacy Section - 1 row */}
            <View style={styles.skeletonSection}>
              <Skeleton width="100%" height={72} borderRadius={Radius.xl} />
            </View>

            {/* Selling Section - 1 row */}
            <View style={styles.skeletonSection}>
              <Skeleton width="100%" height={72} borderRadius={Radius.xl} />
            </View>

            {/* Identity Section - 1 row with status */}
            <View style={styles.skeletonSection}>
              <Skeleton width="100%" height={72} borderRadius={Radius.xl} />
            </View>

            {/* Support Section - 2 rows */}
            <View style={styles.skeletonSection}>
              <Skeleton width="100%" height={110} borderRadius={Radius.xl} />
            </View>

            {/* Danger Zone - Delete button */}
            <View style={styles.skeletonSection}>
              <Skeleton width="100%" height={52} borderRadius={Radius.xl} />
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          ...nativeHeaderOptions,
          title: 'Settings',
          headerTintColor: colors.label,
        }}
      />
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
      {/* Privacy */}
      <PrivacySection
          showPhone={showPhone}
          savingField={savingField}
          colors={colors}
          onToggleShowPhone={() => saveToggle('showPhone', showPhone)}
        />

        {/* Selling */}
        <SellingSection
          consignmentMode={consignmentMode}
          savingField={savingField}
          colors={colors}
          onToggleConsignment={() => saveToggle('consignmentMode', consignmentMode)}
        />

        {/* Identity Verification */}
        <IdentitySection
          status={kycStatus}
          colors={colors}
          onAction={() => setShowKycSheet(true)}
        />

        {/* KYC Verification Sheet */}
        <KycVerificationSheet
          visible={showKycSheet}
          onClose={() => setShowKycSheet(false)}
          onVerified={() => {
            loadProfile();
          }}
          onRefreshProfile={() => {
            loadProfile();
          }}
        />

        {/* Security - TODO: Enable passkeys in v2
        <SecuritySection
          passkeys={passkeys}
          addingPasskey={addingPasskey}
          colors={colors}
          onAddPasskey={handleAddPasskey}
          onDeletePasskey={handleDeletePasskey}
        />
        */}

        {/* Support */}
        <SupportSection
          colors={colors}
          onHelpPress={handleHelpPress}
          onFeedbackPress={handleFeedbackPress}
        />

      {/* Danger Zone */}
      <DangerZone
        colors={colors}
        onDeletePress={() => setShowDeleteModal(true)}
      />

      {/* Delete Account Sheet */}
      <DeleteAccountSheet
        visible={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => {
          setShowDeleteModal(false);
          setIsDeleting(false);
        }}
        onConfirm={handleDeleteAccount}
      />
        </ScreenContainer>
      </View>
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

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
