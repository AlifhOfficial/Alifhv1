/**
 * Public Showroom Hook
 * 
 * React Query hook for fetching public showroom data via API.
 * No direct database calls - uses /api/showroom/[partnerId] endpoint.
 * 
 * Usage:
 * ```tsx
 * const { showroom, isLoading, error } = usePublicShowroom(partnerId);
 * ```
 */

'use client';

import { useAsyncQuery } from '@/hooks/use-async-query';
import { queryKeys } from '@/lib/query-keys';
import type { ShowroomData } from '@/components/pages/showroom/types';

// ============================================================================
// Types
// ============================================================================

interface ShowroomApiResponse {
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
}

export interface UsePublicShowroomOptions {
  /**
   * Disable the query (for conditional fetching)
   */
  enabled?: boolean;
  /**
   * Initial showroom data from server-side fetch.
   * When provided, content renders immediately without client fetch.
   */
  initialShowroom?: ShowroomData | null;
}

export interface UsePublicShowroomReturn {
  showroom: ShowroomData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Fetch public showroom by partner ID
 * 
 * @param partnerId - Partner ID (guaranteed unique)
 * @param options - Hook configuration
 * @returns Showroom data, loading state, and error
 */
export function usePublicShowroom(
  partnerId: string | null | undefined,
  options: UsePublicShowroomOptions = {}
): UsePublicShowroomReturn {
  const { enabled = true, initialShowroom } = options;
  const shouldFetch = enabled && !!partnerId && partnerId.length >= 3 && initialShowroom === undefined;
  
  const query = useAsyncQuery<ShowroomApiResponse>({
    queryFn: async () => {
      const response = await fetch(`/api/showroom/${encodeURIComponent(partnerId!)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Showroom not found');
        }
        throw new Error('Failed to fetch showroom');
      }
      
      return response.json();
    },
    enabled: shouldFetch,
    initialData: initialShowroom ? { showroom: initialShowroom as ShowroomApiResponse['showroom'] } : undefined,
  });
  
  return {
    showroom: query.data?.showroom || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
