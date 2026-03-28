/**
 * Settings Screen - Account Settings (Stack Screen with swipe back)
 * Native-feeling, modular settings screen connected to API
 */

import React, { useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import {
  StyleSheet,
  View,
  Linking,
} from 'react-native';
import { Body, Skeleton, AuthRequiredEmptyState, useAlert } from '@/components/ui';
import { ScreenContainer } from '@/components/layout';

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
  const { signOut, isAuthenticated } = useAuth();
  const { showAlert } = useAlert();

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
  } = useSettings({ isAuthenticated });

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

  // Unauthenticated - show auth required empty state
  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Settings',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
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
            title: 'Settings',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
          <View style={[styles.skeletonContainer, { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg }]}> 
            {/* Section skeletons */}
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={styles.skeletonSection}>
                <Skeleton width={120} height={14} />
                <Skeleton width="100%" height={48} borderRadius={Radius.md} />
                <Skeleton width="100%" height={48} borderRadius={Radius.md} />
              </View>
            ))}
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <ScreenContainer
          keyboardAvoiding={false}
          verticalPadding={0}
          contentContainerStyle={{ paddingTop: Spacing.lg }}
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
    gap: Spacing.xl,
  },
  skeletonSection: {
    gap: Spacing.md,
  },
});
