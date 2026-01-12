/**
 * Admin KYC Management Hooks
 * 
 * Hooks for managing KYC records in the admin dashboard
 * - List KYC records with filtering
 * - Get single KYC record details
 * - Approve/Reject KYC records
 * - Get KYC statistics
 * 
 * Usage:
 * ```tsx
 * const { records, stats, isLoading, refetch } = useAdminKyc({ status: 'pending' });
 * const { record, isLoading } = useAdminKycRecord(id);
 * const { approve, reject } = useAdminKycActions();
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface KycRecordData {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  type: string;
  
  // User info
  userName: string | null;
  userEmail: string;
  userAvatar: string | null;
  
  // Document info
  documentType: string | null;
  documentNumber: string | null;
  documentCountry: string | null;
  documentCountryCode: string | null;
  documentExpiryDate: string | null;
  documentIssueDate: string | null;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
  selfieUrl: string | null;
  
  // Didit session
  diditSessionId: string | null;
  diditSessionUrl: string | null;
  diditSessionNumber: number | null;
  
  // Extracted personal data from Didit
  extractedFirstName: string | null;
  extractedLastName: string | null;
  extractedFullName: string | null;
  extractedDateOfBirth: string | null;
  extractedAge: number | null;
  extractedGender: string | null;
  extractedNationality: string | null;
  extractedNationalityCode: string | null;
  
  // Face match verification
  faceMatchScore: number | null;
  faceMatchStatus: string | null;
  faceSourceImage: string | null;
  faceTargetImage: string | null;
  
  // Liveness verification
  livenessScore: number | null;
  livenessStatus: string | null;
  livenessMethod: string | null;
  livenessAgeEstimation: number | null;
  livenessReferenceImage: string | null;
  
  // IP Analysis
  ipAddress: string | null;
  ipCity: string | null;
  ipCountry: string | null;
  ipCountryCode: string | null;
  ipLatitude: number | null;
  ipLongitude: number | null;
  isVpnOrTor: boolean | null;
  isDataCenter: boolean | null;
  devicePlatform: string | null;
  deviceBrand: string | null;
  deviceBrowser: string | null;
  
  // Didit decision
  diditDecision: Record<string, any> | null;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  
  // Warnings
  warnings: Array<{ risk: string; description: string }> | null;
  
  // Metadata
  metadata: Record<string, any> | null;
  
  // Signed URLs for images (populated by API)
  signedDocumentFrontUrl?: string | null;
  signedDocumentBackUrl?: string | null;
  signedSelfieUrl?: string | null;
  signedFaceSourceImage?: string | null;
  signedFaceTargetImage?: string | null;
  signedLivenessReferenceImage?: string | null;
}

export interface KycStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface UseAdminKycOptions {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  limit?: number;
  page?: number;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch KYC records list with filtering and stats
 */
export function useAdminKyc(options: UseAdminKycOptions = {}) {
  const { status = 'all', limit = 20, page = 1 } = options;
  
  const query = useQuery({
    queryKey: ['admin-kyc', { status, limit, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        status,
        limit: String(limit),
        page: String(page),
      });
      
      const res = await fetch(`/api/admin/kyc?${params}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch KYC records');
      }
      
      return res.json() as Promise<{
        records: KycRecordData[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
        stats: KycStats;
      }>;
    },
  });

  return {
    records: query.data?.records ?? [],
    pagination: query.data?.pagination,
    stats: query.data?.stats,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Fetch single KYC record details
 */
export function useAdminKycRecord(id: string | null) {
  const query = useQuery({
    queryKey: ['admin-kyc-record', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const res = await fetch(`/api/admin/kyc/${id}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch KYC record');
      }
      
      const data = await res.json();
      return data.record as KycRecordData;
    },
    enabled: !!id,
  });

  return {
    record: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * KYC admin actions - approve and reject
 */
export function useAdminKycActions() {
  const queryClient = useQueryClient();
  
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/kyc/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-record'] });
    },
  });
  
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/kyc/${id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reject');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-record'] });
    },
  });

  return {
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
