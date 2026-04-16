'use client';

import { useRouter } from 'next/navigation';
import { useAsyncMutation } from '@/hooks/use-async-mutation';

export interface UpdateListingInput {
  id: string;
  data: Partial<{
    price: number;
    description: string;
    mileage: number;
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

export function useDeleteListing() {
  const router = useRouter();
  const mutation = useAsyncMutation({
    mutationFn: deleteListingAPI,
    onSuccess: () => {
      router.refresh();
    },
  });

  return {
    deleteListing: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    deleteError: mutation.error,
  };
}

export function useExtendListing() {
  const router = useRouter();
  const mutation = useAsyncMutation({
    mutationFn: extendListingAPI,
    onSuccess: () => {
      router.refresh();
    },
  });

  return {
    extendListing: mutation.mutateAsync,
    isExtending: mutation.isPending,
    extendError: mutation.error,
  };
}

export function useMarkSold() {
  const router = useRouter();
  const mutation = useAsyncMutation({
    mutationFn: markSoldAPI,
    onSuccess: () => {
      router.refresh();
    },
  });

  return {
    markSold: mutation.mutateAsync,
    isMarkingSold: mutation.isPending,
    markSoldError: mutation.error,
  };
}

export function useArchiveListing() {
  const router = useRouter();
  const mutation = useAsyncMutation({
    mutationFn: archiveListingAPI,
    onSuccess: () => {
      router.refresh();
    },
  });

  return {
    archiveListing: mutation.mutateAsync,
    isArchiving: mutation.isPending,
    archiveError: mutation.error,
  };
}

export function useUnarchiveListing() {
  const router = useRouter();
  const mutation = useAsyncMutation({
    mutationFn: unarchiveListingAPI,
    onSuccess: () => {
      router.refresh();
    },
  });

  return {
    unarchiveListing: mutation.mutateAsync,
    isUnarchiving: mutation.isPending,
    unarchiveError: mutation.error,
  };
}

export function useListingActions() {
  const deleteHook = useDeleteListing();
  const extendHook = useExtendListing();
  const markSoldHook = useMarkSold();
  const archiveHook = useArchiveListing();
  const unarchiveHook = useUnarchiveListing();

  return {
    deleteListing: deleteHook.deleteListing,
    isDeleting: deleteHook.isDeleting,
    extendListing: extendHook.extendListing,
    isExtending: extendHook.isExtending,
    markSold: markSoldHook.markSold,
    isMarkingSold: markSoldHook.isMarkingSold,
    archiveListing: archiveHook.archiveListing,
    isArchiving: archiveHook.isArchiving,
    unarchiveListing: unarchiveHook.unarchiveListing,
    isUnarchiving: unarchiveHook.isUnarchiving,
  };
}
