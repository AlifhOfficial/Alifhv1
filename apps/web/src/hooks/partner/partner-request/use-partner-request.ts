/**
 * Partner Request Hook - User Operations
 * 
 * Simplified partner application workflow for logged-in users:
 * - Submit new applications (required fields only)
 * - Check application status
 * - Cancel pending applications
 * 
 * Usage:
 * ```tsx
 * const { request, isLoading } = usePartnerRequest();
 * const { submit, isSubmitting } = usePartnerRequestSubmit();
 * const { cancel, isCancelling } = usePartnerRequestCancel();
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface PartnerRequest {
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
}

export interface CreatePartnerRequestInput {
  companyNameLegal: string;
  tradeLicense: string;
  tradeLicenseExpiry: string; // ISO date string
  tradeLicenseDocumentUrl: string;
  vatNumber: string;
  partnerType: 'car_dealer' | 'showroom';
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
}

interface AuthState {
  show: boolean;
  message: string;
}

const DEFAULT_AUTH_STATE: AuthState = { show: false, message: '' };

// ============================================================================
// API Functions
// ============================================================================

async function fetchPartnerRequest(): Promise<PartnerRequest | null> {
  const res = await fetch('/api/partners/request', {
    credentials: 'include',
  });

  if (res.status === 401) {
    return null; // Not authenticated
  }

  if (!res.ok) {
    throw new Error('Failed to fetch partner request');
  }

  const data = await res.json();
  return data.request ?? null;
}

async function submitPartnerRequestAPI(input: CreatePartnerRequestInput): Promise<PartnerRequest> {
  const res = await fetch('/api/partners/request', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (res.status === 401) {
    const data = await res.json();
    throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to submit partner request');
  }

  const data = await res.json();
  return data.request;
}

async function cancelPartnerRequestAPI(): Promise<void> {
  const res = await fetch('/api/partners/request', {
    method: 'DELETE',
    credentials: 'include',
  });

  if (res.status === 401) {
    const data = await res.json();
    throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to cancel partner request');
  }
}

// ============================================================================
// Main Hook: Get Partner Request Status
// ============================================================================

export function usePartnerRequest() {
  return useQuery<PartnerRequest | null>({
    queryKey: ['partner-request'],
    queryFn: fetchPartnerRequest,
    staleTime: 30000, // 30s
    refetchOnWindowFocus: true,
  });
}

// ============================================================================
// Submit Partner Request Hook
// ============================================================================

export function usePartnerRequestSubmit() {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const mutation = useMutation({
    mutationFn: (input: CreatePartnerRequestInput) => submitPartnerRequestAPI(input),
    onError: (error: Error) => {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
    onSuccess: () => {
      // Invalidate to fetch the new request
      queryClient.invalidateQueries({ queryKey: ['partner-request'] });
    },
  });

  return {
    submit: mutation.mutate,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
    reset: mutation.reset,
  };
}

// ============================================================================
// Cancel Partner Request Hook
// ============================================================================

export function usePartnerRequestCancel() {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const mutation = useMutation({
    mutationFn: () => cancelPartnerRequestAPI(),
    onError: (error: Error) => {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
    onSuccess: () => {
      // Clear the request from cache
      queryClient.setQueryData(['partner-request'], null);
      queryClient.invalidateQueries({ queryKey: ['partner-request'] });
    },
  });

  return {
    cancel: mutation.mutate,
    isCancelling: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
    reset: mutation.reset,
  };
}

// ============================================================================
// Dismiss Rejected Partner Request Hook
// ============================================================================

export function usePartnerRequestDismiss() {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const mutation = useMutation({
    mutationFn: () => cancelPartnerRequestAPI(), // Same DELETE endpoint works for dismissed rejected applications
    onError: (error: Error) => {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
    onSuccess: () => {
      // Clear the request from cache
      queryClient.setQueryData(['partner-request'], null);
      queryClient.invalidateQueries({ queryKey: ['partner-request'] });
    },
  });

  return {
    dismiss: mutation.mutate,
    isDismissing: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
    reset: mutation.reset,
  };
}


