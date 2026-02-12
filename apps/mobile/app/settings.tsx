/**
 * Settings Screen - Account Settings (Stack Screen with swipe back)
 * Native-feeling, modular settings screen connected to API
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { Body, Skeleton } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import {
  useSettingsColors,
  useSettings,
  SettingsHeader,
  PrivacySection,
  SellingSection,
  IdentitySection,
  SecuritySection,
  SupportSection,
  DangerZone,
  DeleteAccountModal,
  type KYCStatus,
} from '@/components/settings';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SettingsScreen() {
  const colors = useSettingsColors();
  const { colorScheme, setThemeMode } = useTheme();
  const { signOut, isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();

  // Settings data from hook
  const {
    isLoading,
    profile,
    savingField,
    isDeleting,
    showPhone,
    useGeneratedAvatar,
    consignmentMode,
    pushNotifications,
    emailNotifications,
    passkeys,
    addingPasskey,
    saveToggle,
    deleteAccount,
    handleAddPasskey,
    handleDeletePasskey,
    setPushNotifications,
    setEmailNotifications,
    setIsDeleting,
  } = useSettings({ isAuthenticated });

  const kycStatus: KYCStatus = {
    kycVerified: profile?.kycVerified ?? false,
    kycStatus: profile?.kycStatus ?? 'none',
    kycExpiryDate: profile?.kycExpiresAt ? new Date(profile.kycExpiresAt) : null,
  };

  // Local UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = useCallback(() => {
    deleteAccount(() => {
      setShowDeleteModal(false);
      Alert.alert(
        'Account Deletion Requested',
        'Your account will be permanently deleted after 6 months.',
        [{ text: 'OK', onPress: () => signOut() }]
      );
    });
  }, [deleteAccount, signOut]);

  const handleHelpPress = useCallback(() => {
    // TODO: Navigate to help
  }, []);

  const handleFeedbackPress = useCallback(() => {
    // TODO: Navigate to feedback
  }, []);

  // Loading state — skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SettingsHeader colors={colors} topInset={insets.top} />
        <View style={[styles.skeletonContainer, { paddingHorizontal: Layout.screenPadding }]}>
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
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SettingsHeader 
        colors={colors} 
        topInset={insets.top}
      />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Layout.tabBarHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy */}
        <PrivacySection
          showPhone={showPhone}
          useGeneratedAvatar={useGeneratedAvatar}
          savingField={savingField}
          colors={colors}
          onToggleShowPhone={() => saveToggle('showPhone', showPhone)}
          onToggleGeneratedAvatar={() =>
            saveToggle('useGeneratedAvatar', useGeneratedAvatar)
          }
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
          onAction={() => {
            // TODO: Navigate to KYC flow
            Alert.alert('Coming Soon', 'Identity verification will be available soon.');
          }}
        />

        {/* Security */}
        <SecuritySection
          passkeys={passkeys}
          addingPasskey={addingPasskey}
          colors={colors}
          onAddPasskey={handleAddPasskey}
          onDeletePasskey={handleDeletePasskey}
        />

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
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        isDeleting={isDeleting}
        colors={colors}
        onClose={() => {
          setShowDeleteModal(false);
          setIsDeleting(false);
        }}
        onConfirm={handleDeleteAccount}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: Spacing['2xl'],
    gap: Spacing.xl,
  },
  skeletonSection: {
    gap: Spacing.md,
  },
});
