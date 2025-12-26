/**
 * Listing Mutations Hook - Create, Update, Delete Operations
 * 
 * React Query mutations for listing management with optimistic updates.
 * Handles all CRUD operations and lifecycle changes.
 * 
 * Usage:
 * ```tsx
 * const { deleteListing, isDeleting } = useDeleteListing();
 * const { updateListing, isUpdating } = useUpdateListing();
 * const { extendListing, isExtending } = useExtendListing();
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ListingData, ListingsResponse } from './use-my-listings';

// ============================================================================
// Types
// ============================================================================

export interface UpdateListingInput {
  id: string;
  data: Partial<{
    price: number;
    description: string;
    mileage: number;
    // Add more fields as needed
  }>;
}

export interface DeleteListingResult {
  success: boolean;
  message?: string;
}

export interface ExtendListingResult {
  success: boolean;
  newExpiresAt: string;
  extensionCount: number;
}

export interface MarkSoldResult {
  success: boolean;
}

export interface ArchiveResult {
  success: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

async function deleteListingAPI(listingId: string): Promise<DeleteListingResult> {
  const res = await fetch(`/api/listings/${listingId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) throw new Error('Not authorized to delete this listing');
  if (res.status === 404) throw new Error('Listing not found');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete listing');
  }

  return res.json();
}

async function extendListingAPI(listingId: string): Promise<ExtendListingResult> {
  const res = await fetch(`/api/listings/${listingId}/extend`, {
    method: 'POST',
    credentials: 'include',
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) throw new Error('Not authorized to extend this listing');
  if (res.status === 400) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Cannot extend listing yet');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to extend listing');
  }

  return res.json();
}

async function markSoldAPI(listingId: string): Promise<MarkSoldResult> {
  const res = await fetch(`/api/listings/${listingId}/sold`, {
    method: 'POST',
    credentials: 'include',
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) throw new Error('Not authorized to mark this listing as sold');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to mark listing as sold');
  }

  return res.json();
}

async function archiveListingAPI(listingId: string): Promise<ArchiveResult> {
  const res = await fetch(`/api/listings/${listingId}/archive`, {
    method: 'POST',
    credentials: 'include',
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) throw new Error('Not authorized to archive this listing');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to archive listing');
  }

  return res.json();
}

async function unarchiveListingAPI(listingId: string): Promise<ArchiveResult> {
  const res = await fetch(`/api/listings/${listingId}/unarchive`, {
    method: 'POST',
    credentials: 'include',
  });

  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) throw new Error('Not authorized to unarchive this listing');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to unarchive listing');
  }

  return res.json();
}

// ============================================================================
// Optimistic Update Helper
// ============================================================================

function removeListingFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  listingId: string
) {
  // Update all my-listings queries
  queryClient.setQueriesData<ListingsResponse>(
    { queryKey: ['my-listings'], exact: false },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.filter((l) => l.id !== listingId),
        listings: old.listings.filter((l) => l.id !== listingId),
        meta: old.meta ? { ...old.meta, count: Math.max(0, old.meta.count - 1) } : old.meta,
      };
    }
  );
}

function updateListingInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  listingId: string,
  updates: Partial<ListingData>
) {
  queryClient.setQueriesData<ListingsResponse>(
    { queryKey: ['my-listings'], exact: false },
    (old) => {
      if (!old) return old;
      const updater = (l: ListingData) =>
        l.id === listingId ? { ...l, ...updates } : l;
      return {
        ...old,
        data: old.data.map(updater),
        listings: old.listings.map(updater),
      };
    }
  );
}

// ============================================================================
// Delete Hook
// ============================================================================

export function useDeleteListing() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteListingAPI,
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: ['my-listings'] });
      removeListingFromCache(queryClient, listingId);
    },
    onSuccess: () => {
      // Refetch to get accurate stats
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  return {
    deleteListing: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    deleteError: mutation.error,
  };
}

// ============================================================================
// Extend Hook
// ============================================================================

export function useExtendListing() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: extendListingAPI,
    onSuccess: (result, listingId) => {
      updateListingInCache(queryClient, listingId, {
        expiresAt: result.newExpiresAt,
        extensionCount: result.extensionCount,
        lastExtendedAt: new Date().toISOString(),
      });
      // Also invalidate to get fresh stats
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  return {
    extendListing: mutation.mutateAsync,
    isExtending: mutation.isPending,
    extendError: mutation.error,
  };
}

// ============================================================================
// Mark Sold Hook
// ============================================================================

export function useMarkSold() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: markSoldAPI,
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: ['my-listings'] });
      updateListingInCache(queryClient, listingId, {
        lifecycleStatus: 'sold',
        isPublic: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  return {
    markSold: mutation.mutateAsync,
    isMarkingSold: mutation.isPending,
    markSoldError: mutation.error,
  };
}

// ============================================================================
// Archive/Unarchive Hooks
// ============================================================================

export function useArchiveListing() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: archiveListingAPI,
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: ['my-listings'] });
      updateListingInCache(queryClient, listingId, {
        lifecycleStatus: 'archived',
        isPublic: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  return {
    archiveListing: mutation.mutateAsync,
    isArchiving: mutation.isPending,
    archiveError: mutation.error,
  };
}

export function useUnarchiveListing() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: unarchiveListingAPI,
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: ['my-listings'] });
      updateListingInCache(queryClient, listingId, {
        lifecycleStatus: 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  return {
    unarchiveListing: mutation.mutateAsync,
    isUnarchiving: mutation.isPending,
    unarchiveError: mutation.error,
  };
}

// ============================================================================
// Combined Actions Hook (convenience)
// ============================================================================

export function useListingActions() {
  const deleteHook = useDeleteListing();
  const extendHook = useExtendListing();
  const markSoldHook = useMarkSold();
  const archiveHook = useArchiveListing();
  const unarchiveHook = useUnarchiveListing();

  return {
    // Delete
    deleteListing: deleteHook.deleteListing,
    isDeleting: deleteHook.isDeleting,

    // Extend
    extendListing: extendHook.extendListing,
    isExtending: extendHook.isExtending,

    // Mark Sold
    markSold: markSoldHook.markSold,
    isMarkingSold: markSoldHook.isMarkingSold,

    // Archive
    archiveListing: archiveHook.archiveListing,
    isArchiving: archiveHook.isArchiving,

    // Unarchive
    unarchiveListing: unarchiveHook.unarchiveListing,
    isUnarchiving: unarchiveHook.isUnarchiving,

    // Combined loading state
    isAnyLoading:
      deleteHook.isDeleting ||
      extendHook.isExtending ||
      markSoldHook.isMarkingSold ||
      archiveHook.isArchiving ||
      unarchiveHook.isUnarchiving,
  };
}
