/**
 * Settings Hook
 * Manages settings data and API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  fetchProfile,
  updateProfile,
  requestAccountDeletion,
  type UserProfile,
  type ProfileUpdatePayload,
  type Passkey,
} from '@/lib/profile-api';
import {
  addPasskey as apiAddPasskey,
  deletePasskey as apiDeletePasskey,
} from '@/lib/auth-api';

interface UseSettingsOptions {
  isAuthenticated: boolean;
}

export function useSettings({ isAuthenticated }: UseSettingsOptions) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Passkey state
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);

  // Notification settings (local state - not in API yet)
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Derived settings from profile
  const showPhone = profile?.privacySettings?.showPhone ?? true;
  const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? true;
  const consignmentMode = profile?.consignmentMode ?? true;

  // Load profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchProfile();
    if (result.success && result.data) {
      setProfile(result.data.profile);
      setPasskeys(
        (result.data.passkeys || []).map((pk) => ({
          ...pk,
          name: pk.name || 'Passkey',
        }))
      );
    }
    setIsLoading(false);
  }, []);

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
        const payload: ProfileUpdatePayload = {};

        if (field === 'showPhone') {
          payload.privacySettings = { showPhone: newValue };
        } else if (field === 'useGeneratedAvatar') {
          payload.preferences = { useGeneratedAvatar: newValue };
        } else if (field === 'consignmentMode') {
          payload.consignmentMode = newValue;
        }

        const result = await updateProfile(payload);

        if (result.success && result.profile) {
          setProfile(result.profile);
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          Alert.alert('Error', result.error || 'Failed to save');
        }
      } catch {
        Alert.alert('Error', 'Failed to save. Please try again.');
      } finally {
        setSavingField(null);
      }
    },
    []
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
        Alert.alert('Error', result.error || 'Failed to add passkey');
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
        // Optimistically remove from local state
        setPasskeys((prev) => prev.filter((pk) => pk.id !== id));
      } else {
        Alert.alert('Error', result.error || 'Failed to delete passkey');
      }
    } catch {
      Alert.alert('Error', 'Failed to delete passkey. Please try again.');
    } finally {
      setDeletingPasskeyId(null);
    }
  }, []);

  return {
    // State
    profile,
    isLoading,
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
