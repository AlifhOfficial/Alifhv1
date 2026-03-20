/**
 * Saved API - Favorites & Superlikes endpoints
 * 
 * Connects to web API for fetching saved listings.
 */

import { getStoredSession } from './auth-api';
import { API_BASE, getAppImageUrl, markDataReady, parseJsonWithPerf } from './config';

// ============================================================================
// RATE LIMIT HANDLING
// ============================================================================

const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff delays in ms
const MAX_RETRIES = 3;

/**
 * Sleep for a given duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a fetch with retry logic for rate limits
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      // Rate limited
      if (attempt < retries) {
        // Get retry delay from header or use exponential backoff
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter 
          ? parseInt(retryAfter, 10) * 1000 
          : RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
        
        console.log(`[SavedAPI] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }
      // Max retries exceeded
      throw new Error('RATE_LIMITED');
    }
    
    return response;
  }
  
  throw lastError || new Error('RATE_LIMITED');
}

// ============================================================================
// TYPES
// ============================================================================

export interface FavoritesStatusData {
  favorites: string[];
  superlikes: string[];
  quota: {
    currentMonthSuperlikesUsed: number;
    maxSuperlikesPerMonth: number;
    premiumSuperlikesBonus: number;
    remaining: number;
    periodEndDate?: string | Date | null;
    periodStartDate?: string | Date | null;
  };
}

export interface SavedListingCard {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  emirate: string | null;
  specs: string | null;
  thumbnail: string | null;
  qiScore: number | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  isBlkListing: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Convert relative path to absolute URL */
function toAbsoluteUrl(path: string | null): string | null {
  return getAppImageUrl(path);
}

/** Transform listing with absolute URLs */
function transformListing(item: SavedListingCard): SavedListingCard {
  return {
    ...item,
    thumbnail: toAbsoluteUrl(item.thumbnail),
    partnerLogo: toAbsoluteUrl(item.partnerLogo),
    sellerAvatarUrl: toAbsoluteUrl(item.sellerAvatarUrl),
  };
}

// ============================================================================
// API METHODS
// ============================================================================

export const savedApi = {
  /**
   * Get favorites status (IDs only)
   * Returns favorites, superlikes arrays and quota info
   */
  async getFavoritesStatus(): Promise<FavoritesStatusData> {
    const session = await getStoredSession();
    if (!session?.token) {
      throw new Error('AUTH_REQUIRED');
    }
    
    const url = `${API_BASE}/api/engagement/favorites-status`;
    
    const requestStartedAt = performance.now();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
        'Authorization': `Bearer ${session.token}`,
      },
    });
    
    if (response.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites status: ${response.status}`);
    }
    
    const { data } = await parseJsonWithPerf<FavoritesStatusData>('saved.status', url, response, requestStartedAt);
    markDataReady('saved:status');
    return data;
  },

  /**
   * Get full listing cards by IDs
   * Used for displaying saved listings with full details
   */
  async getListingCards(ids: string[]): Promise<SavedListingCard[]> {
    if (!ids.length) return [];
    
    const session = await getStoredSession();
    const url = `${API_BASE}/api/listings/car-card?ids=${encodeURIComponent(ids.join(','))}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Origin': API_BASE,
    };
    
    if (session?.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${session.token}`;
    }
    
    const requestStartedAt = performance.now();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch listing cards: ${response.status}`);
    }
    
    const { data } = await parseJsonWithPerf<{ data?: SavedListingCard[] }>('saved.cards', url, response, requestStartedAt, {
      meta: { idsCount: ids.length },
    });
    markDataReady('saved:listings');
    return (data.data || []).map(transformListing);
  },

  /**
   * Toggle favorite on a listing
   */
  async toggleFavorite(listingId: string): Promise<{ isFavorite: boolean }> {
    const session = await getStoredSession();
    if (!session?.token) {
      throw new Error('AUTH_REQUIRED');
    }
    
    const url = `${API_BASE}/api/engagement/favorites`;
    
    const requestStartedAt = performance.now();
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
        'Authorization': `Bearer ${session.token}`,
      },
      body: JSON.stringify({ listingId }),
    });
    
    if (response.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to toggle favorite: ${response.status}`);
    }
    
    const { data } = await parseJsonWithPerf<{ status?: { isFavorite?: boolean } }>('saved.toggle-favorite', url, response, requestStartedAt, {
      meta: { listingId },
    });
    return { isFavorite: data.status?.isFavorite ?? false };
  },

  /**
   * Toggle superlike on a listing
   */
  async toggleSuperlike(listingId: string): Promise<{ 
    isSuperliked: boolean; 
    quota: FavoritesStatusData['quota'];
  }> {
    const session = await getStoredSession();
    if (!session?.token) {
      throw new Error('AUTH_REQUIRED');
    }
    
    const url = `${API_BASE}/api/engagement/superlikes`;
    
    const requestStartedAt = performance.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
        'Authorization': `Bearer ${session.token}`,
      },
      body: JSON.stringify({ listingId }),
    });
    
    if (response.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    
    if (response.status === 429) {
      throw new Error('QUOTA_EXCEEDED');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to toggle superlike: ${response.status}`);
    }
    
    const { data } = await parseJsonWithPerf<{ status?: { isSuperliked?: boolean }; quota: FavoritesStatusData['quota'] }>(
      'saved.toggle-superlike',
      url,
      response,
      requestStartedAt,
      { meta: { listingId } }
    );
    return { 
      isSuperliked: data.status?.isSuperliked ?? false,
      quota: data.quota,
    };
  },
};

export default savedApi;
