/**
 * Partner Request Admin Hook
 * 
 * Admin operations for managing partner applications
 * - List all requests with filtering
 * - View request details
 * - Approve/reject requests
 * - Get statistics
 * 
 * Usage:
 * ```tsx
 * const { requests, counts } = usePartnerRequestsAdmin({ status: 'pending' });
 * const { request } = usePartnerRequestById(requestId);
 * const { review } = usePartnerRequestReview();
 * ```
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAsyncMutation } from '@/hooks/use-async-mutation';
import { useAsyncQuery } from '@/hooks/use-async-query';

// ============================================================================
// Types
// ============================================================================

export interface PartnerRequestWithUser {
  request: {
    id: string;
    userId: string;
    companyNameLegal: string;
    tradeLicense: string;
    tradeLicenseExpiry: Date | string;
    tradeLicenseDocumentUrl: string;
    vatNumber: string;
    partnerType: 'car_dealer' | 'showroom';
    companySize: 'small' | 'medium' | 'large' | 'enterprise';
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string | null;
    reviewedAt?: Date | string | null;
    rejectionReason?: string | null;
    internalNotes?: string | null;
    partnerId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

export interface PartnerRequestCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface ListPartnerRequestsOptions {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
  includeCounts?: boolean;
}

export interface ReviewPartnerRequestInput {
  requestId: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  internalNotes?: string;
  trialMonths?: number; // Number of trial months to grant (for approved requests)
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchPartnerRequestsAdmin(
  options: ListPartnerRequestsOptions = {}
): Promise<{
  requests: PartnerRequestWithUser[];
  counts: PartnerRequestCounts | null;
  pagination: { limit: number; offset: number; total: number };
}> {
  const params = new URLSearchParams();
  
  if (options.status) params.append('status', options.status);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  if (options.includeCounts) params.append('counts', 'true');

  const res = await fetch(`/api/partners/request/admin?${params.toString()}`, {
    credentials: 'include',
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (res.status === 403) {
    throw new Error('Forbidden: Admin access required');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch partner requests');
  }

  return res.json();
}

async function fetchPartnerRequestById(requestId: string): Promise<PartnerRequestWithUser> {
  const res = await fetch(`/api/partners/request/${requestId}`, {
    credentials: 'include',
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (res.status === 403) {
    throw new Error('Forbidden');
  }

  if (res.status === 404) {
    throw new Error('Partner request not found');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch partner request');
  }

  const data = await res.json();
  return data.request;
}

async function reviewPartnerRequestAPI(input: ReviewPartnerRequestInput): Promise<PartnerRequestWithUser['request']> {
  const res = await fetch('/api/partners/request/admin', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (res.status === 403) {
    throw new Error('Forbidden: Admin access required');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to review partner request');
  }

  const data = await res.json();
  return data.request;
}

// ============================================================================
// Admin List Hook
// ============================================================================

export function usePartnerRequestsAdmin(options: ListPartnerRequestsOptions = {}) {
  return useAsyncQuery({
    queryFn: () => fetchPartnerRequestsAdmin(options),
  });
}

// ============================================================================
// Single Request by ID Hook
// ============================================================================

export function usePartnerRequestById(requestId: string | null) {
  return useAsyncQuery({
    queryFn: () => {
      if (!requestId) throw new Error('Request ID is required');
      return fetchPartnerRequestById(requestId);
    },
    enabled: !!requestId,
  });
}

// ============================================================================
// Review Partner Request Hook (Admin)
// ============================================================================

export function usePartnerRequestReview() {
  const router = useRouter();

  const mutation = useAsyncMutation({
    mutationFn: (input: ReviewPartnerRequestInput) => reviewPartnerRequestAPI(input),
    onSuccess: () => {
      router.refresh();
    },
  });

  return {
    review: mutation.mutate,
    isReviewing: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
    reset: mutation.reset,
  };
}

// ============================================================================
// Get Counts Hook (Standalone)
// ============================================================================

export function usePartnerRequestCounts() {
  const query = useAsyncQuery({
    queryFn: () => fetchPartnerRequestsAdmin({ includeCounts: true, limit: 1 }),
  });

  return {
    ...query,
    data: query.data?.counts ?? null,
  };
}
