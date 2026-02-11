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
import { LogoPulse, Body } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import {
  useSettingsColors,
  useSettings,
  SettingsHeader,
  PrivacySection,
  NotificationsSection,
  SellingSection,
  SecuritySection,
  SupportSection,
  DangerZone,
  DeleteAccountModal,
  type Passkey,
} from '@/components/settings';

import { KYCStatusCard, type ProfileStatus } from '@/components/profile';

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
    saveToggle,
    deleteAccount,
    setPushNotifications,
    setEmailNotifications,
    setIsDeleting,
  } = useSettings({ isAuthenticated });

  const profileStatus: ProfileStatus = {
    kycVerified: profile?.kycVerified ?? false,
    kycStatus: profile?.kycStatus ?? 'none',
    kycExpiryDate: profile?.kycExpiresAt ? new Date(profile.kycExpiresAt) : null,
    emailVerified: user?.emailVerified ?? false,
    phoneNumberVerified: profile?.phoneNumberVerified ?? false,
    badges: profile?.badges ?? [],
    platformRating: null,
  };

  // Local UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);

  // Passkeys (placeholder - will come from API)
  const passkeys: Passkey[] = [];

  // Handlers
  const handleAddPasskey = useCallback(async () => {
    setAddingPasskey(true);
    // TODO: Implement passkey addition via Better Auth
    Alert.alert('Coming Soon', 'Passkey support will be available soon.');
    setAddingPasskey(false);
  }, []);

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

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SettingsHeader colors={colors} topInset={insets.top} />
        <View style={styles.loadingContainer}>
          <LogoPulse size={56} />
          <Body size="medium" tone="secondary">
            Loading settings...
          </Body>
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

        {/* Notifications */}
        <NotificationsSection
          pushEnabled={pushNotifications}
          emailEnabled={emailNotifications}
          colors={colors}
          onTogglePush={() => setPushNotifications(!pushNotifications)}
          onToggleEmail={() => setEmailNotifications(!emailNotifications)}
        />

        {/* Selling */}
        <SellingSection
          consignmentMode={consignmentMode}
          savingField={savingField}
          colors={colors}
          onToggleConsignment={() => saveToggle('consignmentMode', consignmentMode)}
        />

        {/* Identity Verification */}
        <KYCStatusCard
          status={profileStatus}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
