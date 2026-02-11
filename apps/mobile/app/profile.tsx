/**
 * Profile Screen - User Profile (Stack Screen with swipe back)
 * Native-feeling, modular profile screen connected to API
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { LogoPulse, Body, Supporting } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import {
  useProfileColors,
  useProfile,
  ProfileHeader,
  ProfileIdentity,
  StatsGrid,
  BadgesSection,
  PersonalInfoSection,
  BioSection,
  TagsSection,
  NotAuthenticatedView,
  SignOutButton,
  type ProfileStats,
  type ProfileStatus,
} from '@/components/profile';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfileScreen() {
  const colors = useProfileColors();
  const { user, isAuthenticated, openAuthFlow } = useAuth();
  const insets = useSafeAreaInsets();

  // Profile data from API
  const {
    isLoading,
    isRefreshing,
    isSaving,
    isUploadingAvatar,
    profile,
    stats: apiStats,
    form,
    editingField,
    setEditingField,
    refresh,
    updateField,
    saveField,
    cancelEdit,
    toggleTag,
    uploadPhoto,
    removePhoto,
    onPhoneVerified,
    error,
  } = useProfile({ isAuthenticated });

  // Transform API stats to component format
  const stats: ProfileStats = {
    listings: apiStats?.activeListings ?? null,
    sold: apiStats?.soldListings ?? null,
    responseRate: apiStats?.responseRate ?? null,
    rating: apiStats?.avgRating ?? null,
  };

  // Transform profile to status format
  const profileStatus: ProfileStatus = {
    kycVerified: profile?.kycVerified ?? false,
    kycStatus: profile?.kycStatus ?? 'none',
    kycExpiryDate: profile?.kycExpiresAt ? new Date(profile.kycExpiresAt) : null,
    emailVerified: user?.emailVerified ?? false,
    phoneNumberVerified: profile?.phoneNumberVerified ?? false,
    badges: profile?.badges ?? [],
    platformRating: apiStats?.avgRating ?? null,
  };

  // Computed values
  const memberSinceYear = user?.createdAt
    ? new Date(user.createdAt as string).getFullYear()
    : new Date().getFullYear();

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName || user?.firstName || user?.name || 'User';

  const isKycExpired = profileStatus.kycExpiryDate
    ? new Date() > profileStatus.kycExpiryDate
    : false;

  const daysUntilExpiry = profileStatus.kycExpiryDate
    ? Math.ceil(
        (profileStatus.kycExpiryDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  // Use profile avatar if available, fallback to user session avatar
  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || user?.image;
  const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? user?.useGeneratedAvatar ?? true;

  // Handlers
  const handleBadgesLearnMore = useCallback(() => {
    // TODO: Navigate to badges info
  }, []);

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <NotAuthenticatedView
        colors={colors}
        topInset={insets.top}
        onSignIn={openAuthFlow}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ProfileHeader colors={colors} topInset={insets.top} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <LogoPulse size={56} />
          <Body size="medium" tone="secondary">
            Loading profile...
          </Body>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ProfileHeader colors={colors} topInset={insets.top} />
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Body size="medium" tone="error" style={styles.errorText}>
            {error}
          </Body>
          <Body size="medium" tone="primary" onPress={refresh}>
            Tap to retry
          </Body>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ProfileHeader colors={colors} topInset={insets.top} />

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Layout.tabBarHeight },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Profile Identity */}
          <ProfileIdentity
            displayName={displayName}
            email={user?.email}
            memberSince={memberSinceYear}
            avatarUrl={avatarUrl}
            useGeneratedAvatar={useGeneratedAvatar}
            isVerified={profileStatus.kycVerified && !isKycExpired}
            isExpiringSoon={isExpiringSoon}
            isUploading={isUploadingAvatar}
            colors={colors}
            onPhotoSelected={uploadPhoto}
            onRemovePhoto={removePhoto}
          />

          {/* Personal Information */}
          <PersonalInfoSection
            form={form}
            user={user}
            profile={profileStatus}
            editingField={editingField}
            saving={isSaving}
            colors={colors}
            onEdit={setEditingField}
            onSave={saveField}
            onCancel={cancelEdit}
            onUpdateField={updateField}
            onPhoneVerified={onPhoneVerified}
          />

          {/* Bio */}
          <BioSection
            bio={form.bio}
            isEditing={editingField === 'bio'}
            saving={isSaving}
            colors={colors}
            onEdit={() => setEditingField('bio')}
            onSave={() => saveField('bio')}
            onCancel={cancelEdit}
            onChange={(text) => updateField('bio', text)}
          />

          {/* Tags */}
          <TagsSection
            selectedTags={form.tags}
            colors={colors}
            onToggle={toggleTag}
          />

          {/* Stats Grid - Only shows when data exists */}
          <StatsGrid
            stats={stats}
            platformRating={profileStatus.platformRating}
            colors={colors}
          />

          {/* Badges */}
          <BadgesSection
            badges={profileStatus.badges}
            colors={colors}
            onLearnMore={handleBadgesLearnMore}
          />

          {/* Sign Out */}
          <SignOutButton colors={colors} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  centered: {
    justifyContent: 'flex-start',
  },
  keyboardView: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing['4xl'],
  },
  errorText: {
    textAlign: 'center',
  },
});
