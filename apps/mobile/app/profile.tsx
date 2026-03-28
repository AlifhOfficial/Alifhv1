/**
 * Profile Screen - User Profile (Stack Screen with swipe back)
 * Native-feeling, modular profile screen connected to API
 */

import React, { useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Body, Skeleton, SkeletonCircle, AuthRequiredEmptyState, HapticPressable, useAlert } from '@/components/ui';
import { Settings2, LogOut } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout';

import { Layout, Spacing, Radius, Sizes } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import {
  useProfileColors,
  useProfile,
  ProfileIdentity,
  StatsGrid,
  BadgesSection,
  PersonalInfoSection,
  BioSection,
  TagsSection,
  type ProfileStats,
  type ProfileStatus,
} from '@/components/profile';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfileScreen() {
  const colors = useProfileColors();
  const { user, isAuthenticated, refreshSession, signOut } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

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
  } = useProfile({ isAuthenticated, onAvatarChange: refreshSession, showAlert });

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
  const avatarUrl = profile?.avatarUrl || user?.avatarUrl || user?.image;
  const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? user?.useGeneratedAvatar ?? true;

  // Handlers
  const handleBadgesLearnMore = useCallback(() => {
    // TODO: Navigate to badges info
  }, []);

  const handleSignOut = useCallback(() => {
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
  }, [showAlert, signOut]);

  const renderHeaderActions = useCallback(() => (
    <View style={styles.headerActions}>
      <HapticPressable
        onPress={() => router.push('/settings')}
        style={[
          styles.headerActionButton,
          {
            borderColor: colors.glassBorder,
            backgroundColor: colors.glassBg,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
      >
        <Settings2 size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
      </HapticPressable>

      {isAuthenticated && (
        <HapticPressable
          onPress={handleSignOut}
          style={[
            styles.headerActionButton,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBg,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <LogOut size={Sizes.iconSm} color={colors.error} strokeWidth={2} />
        </HapticPressable>
      )}
    </View>
  ), [colors.error, colors.glassBg, colors.glassBorder, colors.label, handleSignOut, isAuthenticated, router]);

  // Unauthenticated - show auth required empty state
  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Profile',
            headerRight: renderHeaderActions,
            headerBackButtonDisplayMode: 'minimal',
            headerBackTitleVisible: false,
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <AuthRequiredEmptyState
          title="Sign in to view profile"
          subtitle="Manage your account and listings on Revvup"
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
            title: 'Profile',
            headerRight: renderHeaderActions,
            headerBackButtonDisplayMode: 'minimal',
            headerBackTitleVisible: false,
          }}
        />
        <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}> 
        <View style={[styles.skeletonContainer, { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg }]}> 
          {/* Avatar */}
          <View style={styles.skeletonIdentity}>
            <SkeletonCircle size={88} />
            <View style={styles.skeletonIdentityText}>
              <Skeleton width={160} height={18} />
              <Skeleton width={120} height={14} />
              <Skeleton width={90} height={12} />
            </View>
          </View>

          {/* Personal Info Section */}
          <View style={styles.skeletonSection}>
            <Skeleton width={140} height={16} />
            <Skeleton width="100%" height={44} borderRadius={Radius.md} />
            <Skeleton width="100%" height={44} borderRadius={Radius.md} />
            <Skeleton width="100%" height={44} borderRadius={Radius.md} />
          </View>

          {/* Bio Section */}
          <View style={styles.skeletonSection}>
            <Skeleton width={50} height={16} />
            <Skeleton width="100%" height={80} borderRadius={Radius.md} />
          </View>

          {/* Tags Section */}
          <View style={styles.skeletonSection}>
            <Skeleton width={80} height={16} />
            <View style={styles.skeletonTagsRow}>
              <Skeleton width={70} height={32} borderRadius={Radius.full} />
              <Skeleton width={90} height={32} borderRadius={Radius.full} />
              <Skeleton width={60} height={32} borderRadius={Radius.full} />
              <Skeleton width={80} height={32} borderRadius={Radius.full} />
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonStatsRow}>
              <Skeleton width="48%" height={70} borderRadius={Radius.md} />
              <Skeleton width="48%" height={70} borderRadius={Radius.md} />
            </View>
            <View style={styles.skeletonStatsRow}>
              <Skeleton width="48%" height={70} borderRadius={Radius.md} />
              <Skeleton width="48%" height={70} borderRadius={Radius.md} />
            </View>
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
            title: 'Profile',
            headerRight: renderHeaderActions,
            headerBackButtonDisplayMode: 'minimal',
            headerBackTitleVisible: false,
          }}
        />
        <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}> 
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}> 
          <Body size="body" tone="error" style={styles.errorText}>
            {error}
          </Body>
          <Body size="body" tone="primary" onPress={refresh}>
            Tap to retry
          </Body>
        </View>
      </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerRight: renderHeaderActions,
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitleVisible: false,
        }}
      />
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScreenContainer
        refreshing={isRefreshing}
        onRefresh={refresh}
        verticalPadding={0}
        contentContainerStyle={{ paddingTop: Spacing.lg }}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerActionButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    justifyContent: 'flex-start',
  },
  skeletonContainer: {
    flex: 1,
    gap: Spacing.xl,
  },
  skeletonIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  skeletonIdentityText: {
    flex: 1,
    gap: Spacing.sm,
  },
  skeletonSection: {
    gap: Spacing.md,
  },
  skeletonTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skeletonStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
