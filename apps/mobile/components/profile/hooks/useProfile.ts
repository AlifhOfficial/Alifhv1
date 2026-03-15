/**
 * useProfile Hook
 * 
 * React Query powered profile management.
 * Fetches profile data with caching and provides mutation functions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { queryKeys } from '@/lib/query-client';
import type { EditingField, ProfileFormData } from '../types';

interface UseProfileOptions {
  isAuthenticated: boolean;
  /** Callback to refresh auth context session (syncs avatar across app) */
  onAvatarChange?: () => Promise<void>;
  /** Themed alert function */
  showAlert: (title: string, message?: string) => void;
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

export function useProfile({ isAuthenticated, onAvatarChange, showAlert }: UseProfileOptions): UseProfileReturn {
  const queryClient = useQueryClient();
  
  // Local UI states (not cached)
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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

  // React Query for profile data
  const {
    data: profileData,
    isLoading: isQueryLoading,
    isFetching,
    isRefetching,
    error: queryError,
    refetch,
  } = useQuery<ProfileData>({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const result = await fetchProfile();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to load profile');
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile is relatively stable
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Derived data
  const profile = profileData?.profile ?? null;
  const stats = profileData?.stats ?? null;

  // Helper to update cache
  const updateProfileCache = useCallback((updatedProfile: UserProfile) => {
    queryClient.setQueryData<ProfileData>(queryKeys.profile(), (old) => 
      old ? { ...old, profile: updatedProfile } : old
    );
  }, [queryClient]);

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

  // Reset form when editing field changes (cancel unsaved edits when switching fields)
  const prevEditingField = useRef<EditingField>(null);
  useEffect(() => {
    if (prevEditingField.current !== null && prevEditingField.current !== editingField && profile) {
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
    prevEditingField.current = editingField;
  }, [editingField, profile]);

  // Refresh handler
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Update local form field
  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string | string[]) => {
      setForm((f: ProfileFormData) => ({ ...f, [field]: value }));
    },
    []
  );

  // Save field mutation
  const { mutateAsync: saveFieldMutation } = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const result = await updateProfile(payload);
      if (!result.success || !result.profile) {
        throw new Error(result.error || 'Failed to save');
      }
      return result.profile;
    },
    onSuccess: (updatedProfile) => {
      updateProfileCache(updatedProfile);
      originalFormRef.current = { ...form };
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: () => {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
  });

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

        await saveFieldMutation(payload);
        setEditingField(null);
      } catch (err) {
        showAlert('Error', err instanceof Error ? err.message : 'Failed to save. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [form, saveFieldMutation, showAlert]
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

      try {
        const result = await updateProfile({ tags: newTags });

        if (result.success && result.profile) {
          updateProfileCache(result.profile);
          originalFormRef.current = { ...form, tags: newTags };
          
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } else {
          // Revert on error
          setForm((f: ProfileFormData) => ({ ...f, tags: form.tags }));
          showAlert('Error', result.error || 'Failed to save tag.');
        }
      } catch {
        setForm((f: ProfileFormData) => ({ ...f, tags: form.tags }));
        showAlert('Error', 'Failed to save tag.');
      }
    },
    [form, updateProfileCache, showAlert]
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
          updateProfileCache(updateResult.profile);
          
          // Sync auth context so avatar updates across the app
          await onAvatarChange?.();
          
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          showAlert('Error', 'Failed to update profile photo.');
        }
      } else {
        showAlert('Error', result.error || 'Failed to upload photo.');
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch {
      showAlert('Error', 'Failed to upload photo. Please try again.');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [profile?.avatar, onAvatarChange, updateProfileCache, showAlert]);

  // Remove avatar photo
  const removePhoto = useCallback(async () => {
    setIsUploadingAvatar(true);
    
    try {
      const result = await removeAvatar();
      
      if (result.success && result.profile) {
        updateProfileCache(result.profile);
        
        // Sync auth context so avatar updates across the app
        await onAvatarChange?.();
        
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        showAlert('Error', result.error || 'Failed to remove photo.');
      }
    } catch {
      showAlert('Error', 'Failed to remove photo. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [onAvatarChange, updateProfileCache, showAlert]);

  // Remove phone number
  const removePhone = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({ phone: null });
      if (result.success && result.profile) {
        updateProfileCache(result.profile);
        setForm((f: ProfileFormData) => ({ ...f, phone: '' }));
        originalFormRef.current = { ...originalFormRef.current, phone: '' };
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        showAlert('Error', result.error || 'Failed to remove phone number.');
      }
    } catch {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      showAlert('Error', 'Failed to remove phone number. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [updateProfileCache, showAlert]);

  // Called when phone is verified via OTP
  const onPhoneVerified = useCallback(() => {
    // Refresh profile to get updated verification status
    refresh();
  }, [refresh]);

  return {
    // Only show loading when no cached data
    isLoading: isQueryLoading && !profileData,
    isRefreshing: isRefetching || (isFetching && !!profileData),
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
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load profile') : null,
  };
}
