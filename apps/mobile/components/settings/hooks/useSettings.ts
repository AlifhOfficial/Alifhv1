/**
 * Settings Hook
 * React Query powered settings management.
 * Shares profile cache with useProfile hook.
 */

import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfile,
  updateProfile,
  requestAccountDeletion,
  type UserProfile,
  type ProfileUpdatePayload,
  type Passkey,
  type ProfileData,
} from '@/lib/profile-api';
import {
  addPasskey as apiAddPasskey,
  deletePasskey as apiDeletePasskey,
} from '@/lib/auth-api';
import { queryKeys } from '@/lib/query-client';

interface UseSettingsOptions {
  isAuthenticated: boolean;
  userId?: string;
}

export function useSettings({ isAuthenticated, userId }: UseSettingsOptions) {
  const queryClient = useQueryClient();
  
  // Local UI states
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);

  // Notification settings (local state - not in API yet)
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // React Query for profile data (shares cache with useProfile)
  const {
    data: profileData,
    isLoading: isQueryLoading,
    refetch,
  } = useQuery<ProfileData>({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => {
      const result = await fetchProfile();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to load profile');
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const profile = profileData?.profile ?? null;
  const passkeys = (profileData?.passkeys || []).map((pk) => ({
    ...pk,
    name: pk.name || 'Passkey',
  }));

  // Derived settings from profile
  const showPhone = profile?.privacySettings?.showPhone ?? true;
  const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? true;
  const consignmentMode = profile?.consignmentMode ?? true;

  // Helper to update cache
  const updateProfileCache = useCallback((updatedProfile: UserProfile) => {
    queryClient.setQueryData<ProfileData>(queryKeys.profile(userId), (old) =>
      old ? { ...old, profile: updatedProfile } : old
    );
  }, [queryClient, userId]);

  const loadProfile = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Toggle mutation
  const { mutateAsync: saveToggleMutation } = useMutation({
    mutationFn: async ({ field, newValue }: { field: string; newValue: boolean }) => {
      const payload: ProfileUpdatePayload = {};

      if (field === 'showPhone') {
        payload.privacySettings = { showPhone: newValue };
      } else if (field === 'useGeneratedAvatar') {
        payload.preferences = { useGeneratedAvatar: newValue };
      } else if (field === 'consignmentMode') {
        payload.consignmentMode = newValue;
      }

      const result = await updateProfile(payload);
      if (!result.success || !result.profile) {
        throw new Error(result.error || 'Failed to save');
      }
      return result.profile;
    },
    onSuccess: (updatedProfile) => {
      updateProfileCache(updatedProfile);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: (error) => {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save');
    },
  });

  const saveToggle = useCallback(
    async (
      field: 'showPhone' | 'useGeneratedAvatar' | 'consignmentMode',
      currentValue: boolean
    ) => {
      const newValue = !currentValue;
      setSavingField(field);

      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      try {
        await saveToggleMutation({ field, newValue });
      } finally {
        setSavingField(null);
      }
    },
    [saveToggleMutation]
  );

  const deleteAccount = useCallback(async (onSuccess: () => void) => {
    setIsDeleting(true);

    const result = await requestAccountDeletion();

    if (result.success) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onSuccess();
    } else {
      Alert.alert('Error', result.error || 'Failed to request deletion');
      setIsDeleting(false);
    }
  }, []);

  const handleAddPasskey = useCallback(async () => {
    setAddingPasskey(true);
    try {
      const name = `Passkey ${new Date().toLocaleDateString()}`;
      const result = await apiAddPasskey(name);

      if (result.success) {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Passkey Added', 'You can now sign in with this device.');
        // Refresh profile to get updated passkeys list
        await loadProfile();
      } else {
        // Handle user cancellation gracefully - don't show alert
        const errorMsg = result.error?.toLowerCase() || '';
        if (errorMsg.includes('cancel') || errorMsg.includes('abort') || errorMsg.includes('dismiss')) {
          // User cancelled - no alert needed
        } else {
          Alert.alert('Error', result.error || 'Failed to add passkey');
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to add passkey. Please try again.');
    } finally {
      setAddingPasskey(false);
    }
  }, [loadProfile]);

  const handleDeletePasskey = useCallback(async (id: string) => {
    setDeletingPasskeyId(id);
    try {
      const result = await apiDeletePasskey(id);

      if (result.success) {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        // Invalidate cache to refetch passkeys
        await queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
      } else {
        Alert.alert('Error', result.error || 'Failed to delete passkey');
      }
    } catch {
      Alert.alert('Error', 'Failed to delete passkey. Please try again.');
    } finally {
      setDeletingPasskeyId(null);
    }
  }, [queryClient, userId]);

  return {
    // State - only loading when no cached data
    profile,
    isLoading: isQueryLoading && !profileData,
    savingField,
    isDeleting,

    // Passkey state
    passkeys,
    addingPasskey,
    deletingPasskeyId,

    // Settings values
    showPhone,
    useGeneratedAvatar,
    consignmentMode,
    pushNotifications,
    emailNotifications,

    // Actions
    loadProfile,
    saveToggle,
    deleteAccount,
    handleAddPasskey,
    handleDeletePasskey,
    setPushNotifications,
    setEmailNotifications,
    setIsDeleting,
  };
}
