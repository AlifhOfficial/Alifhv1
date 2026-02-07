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
} from '@/lib/profile-api';

interface UseSettingsOptions {
  isAuthenticated: boolean;
}

export function useSettings({ isAuthenticated }: UseSettingsOptions) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return {
    // State
    profile,
    isLoading,
    savingField,
    isDeleting,

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
    setPushNotifications,
    setEmailNotifications,
    setIsDeleting,
  };
}
