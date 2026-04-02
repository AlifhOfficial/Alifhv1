/**
 * Profile Screen - User Profile (Stack Screen with swipe back)
 * Native-feeling, modular profile screen connected to API
 */

import { Text, Skeleton, SkeletonCircle, Bubble, HapticPressable, useAlert, RequireAuthSheet } from '@/components/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  StyleSheet, View } from 'react-native';
import { Settings2 } from 'lucide-react-native';
import { ScreenContainer, MobileHeader, getMobileHeaderContentInset } from '@/components/layout';

import { Layout, Spacing, Radius, Sizes } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import {
  useProfileColors,
  useProfile,
  ProfileIdentity,
  PersonalInfoSection,
  BioSection,
  TagsSection,
  type ProfileStatus,
} from '@/components/profile';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfileScreen() {
  const colors = useProfileColors();
  const { user, isAuthenticated, refreshSession, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const headerInset = getMobileHeaderContentInset(insets.top);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const hasTriggeredAutoSignOutRef = useRef(false);

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
    removePhone,
    onPhoneVerified,
    error,
  } = useProfile({ isAuthenticated, userId: user?.id, onAvatarChange: refreshSession, showAlert });

  const isUnauthorizedError =
    !!error &&
    (error.toLowerCase().includes('unauthorized') ||
      error.toLowerCase().includes('please sign in'));

  const forceSignOut = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      router.replace('/(tabs)/(browse)');
      setIsSigningOut(false);
    }
  }, [isSigningOut, signOut, router]);

  useEffect(() => {
    if (!isUnauthorizedError || hasTriggeredAutoSignOutRef.current) return;
    hasTriggeredAutoSignOutRef.current = true;
    forceSignOut();
  }, [isUnauthorizedError, forceSignOut]);

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
      ? `${profile.firstName.trim()} ${profile.lastName.trim()}`
      : (profile?.firstName?.trim() || user?.firstName?.trim() || user?.name?.trim() || 'User');

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
  const avatarUrl = profile?.avatarUrl || user?.avatarUrl;
  const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? user?.useGeneratedAvatar ?? true;

  // Handlers
  const handleSignOut = useCallback(() => {
    router.push('/sign-out');
  }, [router]);

  const renderHeaderRight = useCallback(() => (
    <Bubble
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel="Open settings"
    >
      <Settings2 size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
    </Bubble>
  ), [colors.label, router]);

  const nativeHeaderOptions = {
    headerShown: false,
  };
  if (!isAuthenticated) {
    return <RequireAuthSheet context="profile" />;
  }

  // Loading state — skeleton
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            ...nativeHeaderOptions,
            title: 'Profile',
            headerTintColor: colors.label,
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <MobileHeader title="Profile" showBackButton />
        <View style={[styles.skeletonContainer, { paddingHorizontal: Layout.screenPadding, paddingTop: headerInset }]}> 
          {/* Profile Identity - Centered vertically */}
          <View style={styles.skeletonIdentity}>
            <SkeletonCircle size={88} />
            <View style={styles.skeletonIdentityText}>
              <Skeleton width={160} height={20} />
              <Skeleton width={180} height={16} />
              <Skeleton width={100} height={14} />
            </View>
          </View>

          {/* Personal Info Section */}
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={200} borderRadius={Radius.xl} />
          </View>

          {/* Bio Section */}
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={100} borderRadius={Radius.xl} />
          </View>

          {/* Tags Section */}
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={180} borderRadius={Radius.xl} />
          </View>

          {/* Sign Out Button */}
          <View style={styles.skeletonSection}>
            <Skeleton width="100%" height={52} borderRadius={Radius.xl} />
          </View>
        </View>
      </View>
      </>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <>
        <Stack.Screen
          options={{
            ...nativeHeaderOptions,
            title: 'Profile',
            headerTintColor: colors.label,
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MobileHeader title="Profile" showBackButton />
        <View style={[styles.errorContainer, styles.centered, { backgroundColor: colors.background, paddingTop: headerInset }]}> 
          <Text variant="body" tone="error" style={styles.errorText}>
            {isUnauthorizedError
              ? 'Session expired. Signing you out...'
              : error}
          </Text>
          {isUnauthorizedError ? (
            <HapticPressable
              onPress={forceSignOut}
              style={[styles.errorActionButton, { backgroundColor: colors.surface }]}
              disabled={isSigningOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out now"
            >
              <Text variant="body" style={{ color: colors.error }}>
                {isSigningOut ? 'Signing out...' : 'Sign out now'}
              </Text>
            </HapticPressable>
          ) : (
            <Text variant="body" tone="primary" onPress={refresh}>
              Tap to retry
            </Text>
          )}
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
          title: 'Profile',
          headerTintColor: colors.label,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenContainer
          header={({ titleHidden }) => (
            <MobileHeader
              title="Profile"
              showBackButton
              titleHidden={titleHidden}
              right={renderHeaderRight()}
            />
          )}
          refreshing={isRefreshing}
          onRefresh={refresh}
          verticalPadding={0}
          horizontalPadding={Layout.screenPadding}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{ paddingTop: headerInset }}
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
        onPhoneRemove={removePhone}
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

      {/* Sign Out */}
      <HapticPressable
        onPress={handleSignOut}
        style={[styles.signOutRow, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Text variant="body" style={{ color: colors.error }}>Sign Out</Text>
      </HapticPressable>

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
  centered: {
    justifyContent: 'flex-start',
  },
  skeletonContainer: {
    flex: 1,
    gap: Spacing.xl,
  },
  skeletonIdentity: {
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing['3xl'],
    marginBottom: Spacing.xl,
  },
  skeletonIdentityText: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  skeletonSection: {
    marginBottom: Spacing.xl,
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
  errorActionButton: {
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
});
