/**
 * Superlikes Hook - Simple Separated Implementation
 * 
 * Completely separate from favorites for cleaner state management.
 * Has its own cache, mutations, queries, and quota tracking.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface SuperlikesData {
  superlikes: string[];
}

export interface SuperlikeQuota {
  currentMonthSuperlikesUsed: number;
  maxSuperlikesPerMonth: number;
  premiumSuperlikesBonus: number;
  totalSuperlikesUsed: number;
  periodEndDate?: string | Date | null;
  periodStartDate?: string | Date | null;
  remaining: number;
}

interface AuthState {
  show: boolean;
  message: string;
}

const DEFAULT_AUTH_STATE: AuthState = { show: false, message: '' };

// Fetch user superlikes only
async function fetchSuperlikes(): Promise<SuperlikesData> {
  const res = await fetch('/api/superlikes?includeStatuses=true', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch superlikes');
  const data = await res.json();
  return { superlikes: data.superlikes || [] };
}

// Fetch superlike quota
async function fetchQuota(): Promise<SuperlikeQuota> {
  const res = await fetch('/api/superlikes?quotaOnly=true', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch quota');
  const data = await res.json();
  const quota = data.quota;
  if (!quota) throw new Error('No quota data');
  
  return {
    ...quota,
    remaining: (quota.maxSuperlikesPerMonth + quota.premiumSuperlikesBonus) - quota.currentMonthSuperlikesUsed,
  };
}

// Hook to get all superlikes
export function useSuperlikesOnly() {
  return useQuery({
    queryKey: ['superlikes-only'],
    queryFn: fetchSuperlikes,
    staleTime: 30000, // 30s - matches API revalidation
  });
}

// Hook to get quota
export function useSuperlikeQuota() {
  return useQuery({
    queryKey: ['superlike-quota-only'],
    queryFn: fetchQuota,
    staleTime: 30000,
  });
}

// Hook for individual listing superlike status
export function useSuperlike(listingId: string) {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const { data } = useQuery({
    queryKey: ['superlikes-only'],
    queryFn: fetchSuperlikes,
    staleTime: 30000,
  });

  const { data: quotaData } = useQuery({
    queryKey: ['superlike-quota-only'],
    queryFn: fetchQuota,
    staleTime: 30000,
  });

  const isSuperliked = data?.superlikes.includes(listingId) || false;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/superlikes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, addedFrom: 'car-card' }),
      });

      if (res.status === 401) {
        const data = await res.json();
        throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
      }

      if (!res.ok) throw new Error('Failed to update superlike');
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['superlikes-only'] });
      const previous = queryClient.getQueryData<SuperlikesData>(['superlikes-only']);
      
      if (previous) {
        const willBeAdded = !isSuperliked;
        queryClient.setQueryData<SuperlikesData>(['superlikes-only'], {
          superlikes: willBeAdded
            ? [...previous.superlikes, listingId]
            : previous.superlikes.filter(id => id !== listingId),
        });
      }
      
      return { previous };
    },
    onError: (error: Error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['superlikes-only'], context.previous);
      }
      
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superlikes-only'] });
      queryClient.invalidateQueries({ queryKey: ['superlike-quota-only'] });
    },
  });

  return {
    isSuperliked,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    quota: quotaData || null,
    toggle: () => mutation.mutate(),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    closeAuthDialog: () => setAuthRequired(DEFAULT_AUTH_STATE),
  };
}
