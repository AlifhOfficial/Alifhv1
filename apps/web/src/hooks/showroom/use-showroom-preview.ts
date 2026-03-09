/**
 * Showroom Preview Hook
 * 
 * React Query hook for fetching showroom preview data via authenticated API.
 * Used by partner owners/admins to preview their showroom before publishing.
 * 
 * Usage:
 * ```tsx
 * const { showroom, isLoading, error } = useShowroomPreview();
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { ShowroomData } from '@/components/pages/showroom/types';

// ============================================================================
// Types
// ============================================================================

interface ShowroomPreviewApiResponse {
  showroom: ShowroomData & {
    // URL fields computed by API
    heroVideoThumbnailUrl?: string | null;
    heroImageUrl?: string | null;
    founderImageUrl?: string | null;
    showroomImagesUrls?: string[];
    showroomExteriorImagesUrls?: string[];
    clientLogosUrls?: string[];
    seoImageUrl?: string | null;
  };
  isPreview: boolean;
}

export interface UseShowroomPreviewReturn {
  showroom: ShowroomData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Fetch showroom preview for authenticated partner owner/admin
 * 
 * @returns Showroom data, loading state, and error
 */
export function useShowroomPreview(): UseShowroomPreviewReturn {
  const query = useQuery<ShowroomPreviewApiResponse, Error>({
    queryKey: ['showroom', 'preview'],
    queryFn: async () => {
      const response = await fetch('/api/partner/showroom/preview');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to preview your showroom');
        }
        if (response.status === 403) {
          throw new Error('You don\'t have permission to preview this showroom');
        }
        if (response.status === 404) {
          throw new Error('Showroom not found');
        }
        throw new Error('Failed to fetch showroom preview');
      }
      
      return response.json();
    },
    retry: 1,
  });
  
  return {
    showroom: query.data?.showroom || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
