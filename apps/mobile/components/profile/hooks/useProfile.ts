/**
 * useProfile Hook
 * 
 * Manages profile state and API interactions.
 * Fetches profile data and provides update functions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  type ProfileData,
  type UserProfile,
  type UserStats,
  type ProfileUpdatePayload,
} from '@/lib/profile-api';
import type { EditingField, ProfileFormData } from '../types';

interface UseProfileOptions {
  isAuthenticated: boolean;
}

interface UseProfileReturn {
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;

  // Data
  profile: UserProfile | null;
  stats: UserStats | null;
  form: ProfileFormData;
  
  // Editing
  editingField: EditingField;
  setEditingField: (field: EditingField) => void;

  // Actions
  refresh: () => Promise<void>;
  updateField: (field: keyof ProfileFormData, value: string | string[]) => void;
  saveField: (field: EditingField) => Promise<void>;
  cancelEdit: () => void;
  toggleTag: (tag: string) => void;
  uploadPhoto: (uri: string) => Promise<void>;
  removePhoto: () => Promise<void>;
  removePhone: () => Promise<void>;
  onPhoneVerified: () => void;
  
  // Error
  error: string | null;
}

export function useProfile({ isAuthenticated }: UseProfileOptions): UseProfileReturn {
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Data
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField>(null);

  // Form state for editing
  const [form, setForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    tags: [],
  });

  // Track original values for cancel
  const originalFormRef = useRef<ProfileFormData>(form);

  // Derived data
  const profile = profileData?.profile ?? null;
  const stats = profileData?.stats ?? null;

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      // Strip +971 prefix from phone for form (we add it back when saving)
      const cleanPhone = profile.phone?.replace(/^\+971/, '') ?? '';
      
      const formData: ProfileFormData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: cleanPhone,
        bio: profile.description || '',
        tags: profile.tags || [],
      };
      setForm(formData);
      originalFormRef.current = formData;
    }
  }, [profile]);

  // Fetch profile data
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setError(null);
    const result = await fetchProfile();

    if (result.success && result.data) {
      setProfileData(result.data);
    } else {
      setError(result.error || 'Failed to load profile');
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refresh handler
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  }, [loadProfile]);

  // Update local form field
  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string | string[]) => {
      setForm((f: ProfileFormData) => ({ ...f, [field]: value }));
    },
    []
  );

  // Save field to API
  const saveField = useCallback(
    async (field: EditingField) => {
      if (!field) return;

      setIsSaving(true);
      
      try {
        // Map form fields to API payload
        const payload: ProfileUpdatePayload = {};
        
        switch (field) {
          case 'firstName':
            payload.firstName = form.firstName || null;
            break;
          case 'lastName':
            payload.lastName = form.lastName || null;
            break;
          case 'phone':
            // Add +971 prefix when saving, allow null to clear phone
            const cleanPhone = form.phone?.replace(/[^\d]/g, '') || '';
            payload.phone = cleanPhone ? `+971${cleanPhone}` : null;
            break;
          case 'bio':
            payload.description = form.bio || null;
            break;
        }

        const result = await updateProfile(payload);

        if (result.success && result.profile) {
          // Update profile data
          setProfileData((prev) =>
            prev ? { ...prev, profile: result.profile! } : null
          );
          
          // Update original form ref
          originalFormRef.current = { ...form };
          
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          setEditingField(null);
        } else {
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          Alert.alert('Error', result.error || 'Failed to save. Please try again.');
        }
      } catch {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert('Error', 'Failed to save. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [form]
  );

  // Cancel edit and restore original values
  const cancelEdit = useCallback(() => {
    setForm(originalFormRef.current);
    setEditingField(null);
  }, []);

  // Toggle tag selection and save immediately
  const toggleTag = useCallback(
    async (tag: string) => {
      const newTags = form.tags.includes(tag)
        ? form.tags.filter((t: string) => t !== tag)
        : [...form.tags, tag];

      // Update local state immediately
      setForm((f: ProfileFormData) => ({ ...f, tags: newTags }));

      // Save to API
      const result = await updateProfile({ tags: newTags });

      if (result.success && result.profile) {
        // Update profile data
        setProfileData((prev) =>
          prev ? { ...prev, profile: result.profile! } : null
        );
        originalFormRef.current = { ...form, tags: newTags };
        
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        // Revert on error
        setForm((f: ProfileFormData) => ({ ...f, tags: form.tags }));
        Alert.alert('Error', result.error || 'Failed to save tag.');
      }
    },
    [form]
  );

  // Upload avatar photo
  const uploadPhoto = useCallback(async (uri: string) => {
    setIsUploadingAvatar(true);
    
    try {
      // Get current avatar key for replacement
      const previousKey = profile?.avatar;
      
      const result = await uploadAvatar(uri, previousKey);
      
      if (result.success && result.key) {
        // Update profile with new avatar key
        const updateResult = await updateProfile({ avatar: result.key });
        
        if (updateResult.success && updateResult.profile) {
          setProfileData((prev) =>
            prev ? { ...prev, profile: updateResult.profile! } : null
          );
          
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          Alert.alert('Error', 'Failed to update profile photo.');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to upload photo.');
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [profile?.avatar]);

  // Remove avatar photo
  const removePhoto = useCallback(async () => {
    setIsUploadingAvatar(true);
    
    try {
      const result = await removeAvatar();
      
      if (result.success && result.profile) {
        setProfileData((prev) =>
          prev ? { ...prev, profile: result.profile! } : null
        );
        
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to remove photo.');
      }
    } catch {
      Alert.alert('Error', 'Failed to remove photo. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, []);

  // Remove phone number
  const removePhone = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({ phone: null });
      if (result.success && result.profile) {
        setProfileData((prev) =>
          prev ? { ...prev, profile: result.profile! } : null
        );
        setForm((f: ProfileFormData) => ({ ...f, phone: '' }));
        originalFormRef.current = { ...originalFormRef.current, phone: '' };
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert('Error', result.error || 'Failed to remove phone number.');
      }
    } catch {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Failed to remove phone number. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Called when phone is verified via OTP
  const onPhoneVerified = useCallback(() => {
    // Refresh profile to get updated verification status
    refresh();
  }, [refresh]);

  return {
    isLoading,
    isRefreshing,
    isSaving,
    isUploadingAvatar,
    profile,
    stats,
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
  };
}
