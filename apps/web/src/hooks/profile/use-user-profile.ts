/**
 * User Profile Hook - Unified with React Query
 * 
 * Clean implementation following the same pattern as favorites.
 * UI/UX → Hook → API → Query → DB
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  description?: string | null;
  locationCity?: string | null;
  locationEmirate?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  kycVerified?: boolean;
  badges?: string[];
  inventoryCount?: number;
  rating?: number;
  avgResponseTime?: number;
  memberSince?: Date | string;
  status?: string;
  createdAt?: Date | string;
  avatar?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  description?: string;
  locationCity?: string;
  locationEmirate?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  avatar?: string | null;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchUserProfile(): Promise<UserProfile | null> {
  const res = await fetch('/api/profile/user-profile', {
    credentials: 'include',
  });

  if (res.status === 401) {
    return null; // Not authenticated
  }

  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }

  const data = await res.json();
  return data.profile ?? null;
}

async function updateUserProfileAPI(updates: UserProfileUpdate): Promise<UserProfile> {
  const res = await fetch('/api/profile/user-profile', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update profile');
  }

  const data = await res.json();
  return data.profile;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useUserProfile() {
  const queryClient = useQueryClient();

  // Fetch profile data
  const query = useQuery<UserProfile | null>({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: 30000, // 30s - profile doesn't change often
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on 401
  });

  // Update profile mutation
  const mutation = useMutation({
    mutationFn: updateUserProfileAPI,
    onSuccess: (updatedProfile) => {
      // Update cache with new data
      queryClient.setQueryData(['user-profile'], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    error: query.error?.message || mutation.error?.message || null,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
    updateProfile: (updates: UserProfileUpdate) => mutation.mutateAsync(updates),
  };
}
