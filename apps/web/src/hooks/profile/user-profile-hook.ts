/**
 * User Profile Hook
 * 
 * Manages user profile data with shared state and deduplication.
 * Implements caching to prevent redundant API calls.
 * 
 * @param options - Configuration for fetching behavior
 * @returns Profile data, loading states, and update functions
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

const CACHE_DURATION = 30000; // 30 seconds

// User profile with fields used in ProfileView
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

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refresh: () => Promise<UserProfile | null>;
  updateProfile: (input: UserProfileUpdate) => Promise<UserProfile | null>;
}

interface StoreState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastFetchTime: number | null;
}

let store: StoreState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  lastFetchTime: null,
};

let pendingRequest: Promise<UserProfile | null> | null = null;
const listeners = new Set<(state: StoreState) => void>();

const notify = () => listeners.forEach(listener => listener(store));

const updateStore = (partial: Partial<StoreState>) => {
  store = { ...store, ...partial };
  notify();
};

const resetStore = () => {
  store = { profile: null, isLoading: false, isUpdating: false, error: null, lastFetchTime: null };
  pendingRequest = null;
  notify();
};

const isCacheFresh = () => {
  return store.profile && store.lastFetchTime && (Date.now() - store.lastFetchTime < CACHE_DURATION);
};

async function refreshProfileFromServer(): Promise<UserProfile | null> {
  if (pendingRequest) return pendingRequest;
  if (isCacheFresh()) return store.profile;

  updateStore({ isLoading: true });

  pendingRequest = (async () => {
    try {
      const res = await fetch('/api/profile/user-profile', {
        credentials: 'include',
        cache: 'default',
      });

      if (!res.ok) {
        if (res.status === 401) {
          resetStore();
          return null;
        }
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const profile = data.profile ?? null;
      
      updateStore({ profile, error: null, lastFetchTime: Date.now() });
      return profile;
    } catch (err) {
      updateStore({ error: err instanceof Error ? err.message : 'Failed to load profile' });
      return null;
    } finally {
      updateStore({ isLoading: false });
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

async function patchProfileOnServer(input: UserProfileUpdate): Promise<UserProfile | null> {
  updateStore({ isUpdating: true });

  try {
    const res = await fetch('/api/profile/user-profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      if (res.status === 401) {
        resetStore();
        return null;
      }
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    const profile = data.profile ?? null;
    
    updateStore({ profile, error: null });
    return profile;
  } catch (err) {
    updateStore({ error: err instanceof Error ? err.message : 'Failed to update profile' });
    return null;
  } finally {
    updateStore({ isUpdating: false });
  }
}

export function useUserProfile(options: { fetchOnMount?: boolean; userId?: string | null } = {}): UseUserProfileResult {
  const { fetchOnMount = true, userId = undefined } = options;
  const [state, setState] = useState(store);

  useEffect(() => {
    const listener = (nextState: StoreState) => setState(nextState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      resetStore();
      return;
    }
    if (store.profile && store.profile.userId !== userId) {
      resetStore();
    }
  }, [userId]);

  const refresh = useCallback(() => refreshProfileFromServer(), []);
  const updateProfile = useCallback((input: UserProfileUpdate) => patchProfileOnServer(input), []);

  useEffect(() => {
    if (!fetchOnMount || store.profile || store.isLoading || isCacheFresh()) return;
    void refreshProfileFromServer();
  }, [fetchOnMount]);

  return {
    profile: state.profile,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    refresh,
    updateProfile,
  };
}
