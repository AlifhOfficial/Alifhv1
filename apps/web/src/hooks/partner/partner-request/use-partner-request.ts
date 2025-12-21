/**
 * Partner Request Hook - User Operations
 * 
 * Handles partner application workflow for users
 * - Submit new applications
 * - Check application status
 * - Update pending applications
 * - Cancel applications
 * - Validate before submission
 * 
 * Usage:
 * ```tsx
 * const { request, isLoading } = usePartnerRequest();
 * const { submit, isSubmitting } = usePartnerRequestSubmit();
 * const { update, isUpdating } = usePartnerRequestUpdate();
 * const { validate } = usePartnerRequestValidate();
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
  email: string;
  phone: string;
  tradeLicense: string;
  tradeLicenseExpiry: Date | string;
  partnerType: 'dealer' | 'showroom' | 'multi_brand' | 'rental' | 'broker' | 'other';
  vatNumber?: string | null;
  brandName?: string | null;
  tradeLicenseDocumentUrl?: string | null;
  website?: string | null;
  address?: string | null;
  emirate?: string | null;
  description?: string | null;
  experienceYears?: number | null;
  specialties?: string[];
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
  email: string;
  phone: string;
  tradeLicense: string;
  tradeLicenseExpiry: string; // ISO date string
  partnerType: 'dealer' | 'showroom' | 'multi_brand' | 'rental' | 'broker' | 'other';
  vatNumber?: string;
  brandName?: string;
  tradeLicenseDocumentUrl?: string;
  website?: string;
  address?: string;
  emirate?: string;
  description?: string;
  experienceYears?: number;
  specialties?: string[];
}

export interface UpdatePartnerRequestInput {
  brandName?: string;
  tradeLicenseDocumentUrl?: string;
  website?: string;
  address?: string;
  emirate?: string;
  description?: string;
  experienceYears?: number;
  specialties?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  checks: {
    hasActiveRequest: boolean;
    licenseInUse: boolean;
  };
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

async function updatePartnerRequestAPI(input: UpdatePartnerRequestInput): Promise<PartnerRequest> {
  const res = await fetch('/api/partners/request', {
    method: 'PATCH',
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
    throw new Error(data.error || 'Failed to update partner request');
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

async function validatePartnerRequestAPI(
  tradeLicense: string,
  checkType: 'user' | 'license' | 'both' = 'both'
): Promise<ValidationResult> {
  const res = await fetch('/api/partners/request/validate', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tradeLicense, checkType }),
  });

  if (res.status === 401) {
    const data = await res.json();
    throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
  }

  if (!res.ok) {
    throw new Error('Validation failed');
  }

  return res.json();
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
// Update Partner Request Hook
// ============================================================================

export function usePartnerRequestUpdate() {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const mutation = useMutation({
    mutationFn: (input: UpdatePartnerRequestInput) => updatePartnerRequestAPI(input),
    onMutate: async (input) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['partner-request'] });
      const previous = queryClient.getQueryData<PartnerRequest | null>(['partner-request']);

      if (previous) {
        queryClient.setQueryData<PartnerRequest>(['partner-request'], {
          ...previous,
          ...input,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previous };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['partner-request'], context.previous);
      }

      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-request'] });
    },
  });

  return {
    update: mutation.mutate,
    isUpdating: mutation.isPending,
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
// Validate Partner Request Hook
// ============================================================================

export function usePartnerRequestValidate() {
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const mutation = useMutation({
    mutationFn: ({ tradeLicense, checkType }: { 
      tradeLicense: string; 
      checkType?: 'user' | 'license' | 'both' 
    }) => validatePartnerRequestAPI(tradeLicense, checkType),
    onError: (error: Error) => {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
  });

  return {
    validate: mutation.mutate,
    isValidating: mutation.isPending,
    validationResult: mutation.data,
    error: mutation.error,
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
    reset: mutation.reset,
  };
}
