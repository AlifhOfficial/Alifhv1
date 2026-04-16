/**
 * User Profile Hook - Unified with React Query
 * 
 * Clean implementation following the same pattern as favorites.
 * UI/UX → Hook → API → Query → DB
 */

'use client';

import { useEffect } from 'react';
import { useAsyncMutation } from '@/hooks/use-async-mutation';
import { useAsyncQuery } from '@/hooks/use-async-query';
import { useAuth } from '@/providers/auth-provider';
import type { ExtendedUser } from '@/types/auth';

// ============================================================================
// Types
// ============================================================================

export interface UserStats {
  listingsCount: number;
  soldCount: number;
  responseTime: number | null; // Minutes (business hours only)
  responseRate: number | null; // Percentage (0-100)
}

export interface UserPasskey {
  id: string;
  name: string | null;
  createdAt: Date | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  updatedAt?: Date | string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  description?: string | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  preferences?: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  kycVerified?: boolean;
  kycVerifiedAt?: Date | string | null;
  kycExpiryDate?: Date | string | null;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  kycRejectionReason?: string | null;
  badges?: string[];
  platformRating?: number | null;
  memberSince?: Date | string;
  avatar?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  phoneNumberVerified?: boolean;
}

export interface UserProfileResponse {
  profile: UserProfile | null;
  stats: UserStats;
  passkeys: UserPasskey[];
}

export interface UserProfileUpdate {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  description?: string | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  preferences?: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  avatar?: string | null;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchUserProfile(): Promise<UserProfileResponse | null> {
  const res = await fetch('/api/profile/user/user-profile', {
    credentials: 'include',
    cache: 'no-store', // Bypass browser cache
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  if (res.status === 401) {
    return null; // Not authenticated
  }

  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }

  const data = await res.json();
  return data;
}

async function updateUserProfileAPI(updates: UserProfileUpdate): Promise<UserProfile> {
  const res = await fetch('/api/profile/user/user-profile', {
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

export function useUserProfile(initialData?: UserProfileResponse | null) {
  const { session, setSessionUser, isAuthenticated } = useAuth();
  const shouldFetch = isAuthenticated && initialData === undefined;

  const query = useAsyncQuery<UserProfileResponse | null>({
    queryFn: fetchUserProfile,
    enabled: shouldFetch,
    initialData: initialData ?? undefined,
  });

  const mutation = useAsyncMutation({
    mutationFn: updateUserProfileAPI,
    onSuccess: async (updatedProfile, variables) => {
      query.setData((old) => {
        if (!old) return { profile: updatedProfile, stats: { listingsCount: 0, soldCount: 0, responseTime: null, responseRate: null }, passkeys: [] };
        return { ...old, profile: updatedProfile };
      });

      const touchesSession =
        'avatar' in variables ||
        'firstName' in variables ||
        'lastName' in variables ||
        'preferences' in variables;

      if (touchesSession && session) {
        const currentSession = session as ExtendedUser;
        const nextFirstName = updatedProfile.firstName ?? currentSession.firstName ?? null;
        const nextLastName = updatedProfile.lastName ?? currentSession.lastName ?? null;
        const nextName =
          [nextFirstName, nextLastName].filter(Boolean).join(' ').trim() ||
          currentSession.name;

        setSessionUser({
          ...currentSession,
          name: nextName,
          firstName: nextFirstName,
          lastName: nextLastName,
          avatar: updatedProfile.avatar ?? currentSession.avatar ?? null,
          avatarUrl: updatedProfile.avatarUrl ?? currentSession.avatarUrl ?? null,
          useGeneratedAvatar:
            updatedProfile.preferences?.useGeneratedAvatar ??
            (currentSession as ExtendedUser & { useGeneratedAvatar?: boolean }).useGeneratedAvatar ??
            true,
        } as ExtendedUser);
      }
    },
  });

  useEffect(() => {
    const handleRefresh = () => {
      void query.refetch();
    };

    window.addEventListener('user-profile-refresh', handleRefresh);
    return () => window.removeEventListener('user-profile-refresh', handleRefresh);
  }, [query]);

  return {
    profile: query.data?.profile ?? null,
    stats: query.data?.stats ?? null,
    passkeys: query.data?.passkeys ?? [],
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    error: query.error?.message || mutation.error?.message || null,
    refresh: query.refetch,
    updateProfile: (updates: UserProfileUpdate) => mutation.mutateAsync(updates),
    invalidateCache: query.refetch,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Invalidate user profile cache globally
 * Use this when profile is updated outside of the hook
 */
export function invalidateUserProfileCache() {
  return;
}
