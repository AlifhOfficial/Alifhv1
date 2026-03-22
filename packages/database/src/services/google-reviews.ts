/**
 * Google Reviews Sync Service
 * 
 * Extracts place_id from Google Maps URLs and syncs reviews via Places API
 */

import { db } from '../index';
import { partner, partnerShowroom } from '../schema/partner';
import type { ShowroomTestimonial } from '../schema/partner';
import { eq, isNotNull, or, lt, sql } from 'drizzle-orm';

// ============================================================================
// Types
// ============================================================================

interface GoogleReviewItem {
  author_name: string;
  author_url: string;
  profile_photo_url?: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

interface GooglePlacesResponse {
  result: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleReviewItem[];
  };
  status: string;
  error_message?: string;
}

interface SyncResult {
  success: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: ShowroomTestimonial[];
  error?: string;
}

// ============================================================================
// Place ID Extraction
// ============================================================================

/**
 * Extract Google Place ID from various URL formats
 * 
 * Supported formats:
 * - https://maps.google.com/?cid=12345678901234567890
 * - https://www.google.com/maps/place/.../@lat,lng,zoom/data=!4m5!3m4!1s0x123:0xabc...
 * - https://goo.gl/maps/ShortCode
 * - https://maps.app.goo.gl/ShortCode (will be expanded)
 * - https://share.google/ShortCode (will be expanded)
 * - Direct place_id: ChIJN1t_tDeuEmsRUsoyG83frY4
 */
export async function extractPlaceId(url: string): Promise<string | null> {
  if (!url) return null;
  
  url = url.trim();
  
  // Already a place_id (starts with ChIJ)
  if (url.startsWith('ChIJ') || url.match(/^[A-Za-z0-9_-]{20,}$/)) {
    return url;
  }
  
  // Handle short URLs - need to expand them first
  if (url.includes('share.google') || url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
    try {
      const response = await fetch(url, { 
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      // Get the final URL after all redirects
      url = response.url;
    } catch (error) {
      console.error('[GoogleReviews] Failed to expand short URL:', error);
      return null;
    }
  }
  
  // Extract from cid parameter
  const cidMatch = url.match(/[?&]cid=(\d+)/);
  if (cidMatch) {
    return cidMatch[1];
  }
  
  // Extract ChIJ-style place_id from the URL path (most reliable for direct links)
  // Match /place/ChIJ... or /place/Name/ChIJ...
  const pathPlaceIdMatch = url.match(/\/place\/(?:[^/]+\/)?(ChIJ[A-Za-z0-9_-]+)/);
  if (pathPlaceIdMatch) {
    return pathPlaceIdMatch[1];
  }
  
  // Extract ChIJ-style place_id from data parameter
  const dataPlaceIdMatch = url.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
  if (dataPlaceIdMatch) {
    return dataPlaceIdMatch[1];
  }
  
  // Extract from query parameter
  const queryPlaceIdMatch = url.match(/[?&]place_id=(ChIJ[A-Za-z0-9_-]+)/);
  if (queryPlaceIdMatch) {
    return queryPlaceIdMatch[1];
  }
  
  // Last resort: any ChIJ pattern in the URL
  const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]+)/);
  if (chijMatch) {
    return chijMatch[1];
  }
  
  // Extract from data parameter (encoded place_id) - hex format
  // Need to use Text Search to convert to ChIJ format
  const dataMatch = url.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/);
  if (dataMatch) {
    // Extract business name from URL
    const nameMatch = url.match(/\/place\/([^/@]+)/);
    // Extract coordinates from the URL - try both @lat,lng and more specific patterns
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    if (nameMatch) {
      const name = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
      const lat = coordMatch?.[1];
      const lng = coordMatch?.[2];
      
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        console.error('[GoogleReviews] GOOGLE_PLACES_API_KEY not set - cannot convert hex place_id');
        throw new Error('Google Places API key not configured');
      }
      
      try {
        // Use Find Place API for more reliable results
        const findPlaceUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
        findPlaceUrl.searchParams.set('input', name);
        findPlaceUrl.searchParams.set('inputtype', 'textquery');
        findPlaceUrl.searchParams.set('fields', 'place_id,name');
        if (lat && lng) {
          findPlaceUrl.searchParams.set('locationbias', `point:${lat},${lng}`);
        }
        findPlaceUrl.searchParams.set('key', apiKey);
        
        const response = await fetch(findPlaceUrl.toString());
        const data = await response.json();
        
        if (data.status === 'OK' && data.candidates?.[0]?.place_id) {
          console.log('[GoogleReviews] Found place_id via Find Place:', data.candidates[0].place_id);
          return data.candidates[0].place_id;
        }
        
        // Fallback to Text Search with larger radius
        const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
        searchUrl.searchParams.set('query', name);
        if (lat && lng) {
          searchUrl.searchParams.set('location', `${lat},${lng}`);
          searchUrl.searchParams.set('radius', '5000'); // 5km radius for better matching
        }
        searchUrl.searchParams.set('key', apiKey);
        
        const searchResponse = await fetch(searchUrl.toString());
        const searchData = await searchResponse.json();
        
        if (searchData.status === 'OK' && searchData.results?.[0]?.place_id) {
          console.log('[GoogleReviews] Found place_id via Text Search:', searchData.results[0].place_id);
          return searchData.results[0].place_id;
        }
        
        console.error('[GoogleReviews] Text Search failed:', searchData.status, searchData.error_message);
        throw new Error(`Could not find business "${name}" in Google Places`);
      } catch (error) {
        console.error('[GoogleReviews] Failed to convert hex to place_id:', error);
        throw error;
      }
    }
    
    console.warn('[GoogleReviews] Found hex-encoded place_id, but no business name in URL');
    throw new Error('Could not extract business name from URL');
  }
  
  console.warn('[GoogleReviews] Could not extract place_id from URL:', url);
  throw new Error('Invalid Google Maps URL format - could not extract place ID');
}

// ============================================================================
// Google Places API
// ============================================================================

/**
 * Fetch reviews from Google Places API
 */
export async function fetchGoogleReviews(placeId: string): Promise<SyncResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.error('[GoogleReviews] GOOGLE_PLACES_API_KEY not set');
    return { success: false, error: 'API key not configured' };
  }
  
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'rating,user_ratings_total,reviews');
    url.searchParams.set('key', apiKey);
    
    const response = await fetch(url.toString());
    const data: GooglePlacesResponse = await response.json();
    
    if (data.status !== 'OK') {
      console.error('[GoogleReviews] API error:', data.status, data.error_message);
      return { 
        success: false, 
        error: data.error_message || `API returned status: ${data.status}` 
      };
    }
    
    const rating = data.result.rating;
    const reviewCount = data.result.user_ratings_total;
    
    if (rating === undefined || reviewCount === undefined) {
      return { success: false, error: 'No review data found' };
    }
    
    // Parse individual reviews (up to 5, Google's limit)
    const reviews: ShowroomTestimonial[] = (data.result.reviews || []).map((r, i) => ({
      id: `google-${r.time}-${Buffer.from(r.author_url || r.author_name).toString('base64').slice(0, 8)}`,
      customerName: r.author_name,
      customerTitle: null,
      customerImage: null,
      customerImageUrl: r.profile_photo_url || null,
      content: r.text,
      rating: r.rating,
      vehiclePurchased: null,
      videoUrl: null,
      source: 'google' as const,
      sourceUrl: r.author_url || null,
      reviewedAt: new Date(r.time * 1000).toISOString(),
      order: i,
    }));
    
    return {
      success: true,
      rating,
      reviewCount,
      reviews,
    };
  } catch (error) {
    console.error('[GoogleReviews] Fetch failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ============================================================================
// Sync Operations
// ============================================================================

/**
 * Sync reviews for a single partner
 * Always extracts place_id fresh from URL to ensure accuracy
 */
export async function syncPartnerReviews(partnerId: string, options?: { onlyFiveStar?: boolean }): Promise<SyncResult> {
  try {
    // Get partner
    const [partnerData] = await db
      .select({
        id: partner.id,
        tier: partner.tier,
        googleReviewUrl: partner.googleReviewUrl,
        googlePlaceId: partner.googlePlaceId,
      })
      .from(partner)
      .where(eq(partner.id, partnerId))
      .limit(1);
    
    if (!partnerData) {
      return { success: false, error: 'Partner not found' };
    }
    
    if (!partnerData.googleReviewUrl) {
      return { success: false, error: 'No Google Maps URL configured' };
    }
    
    // Always extract place_id fresh from URL to ensure we have the correct one
    // This handles cases where URL was changed but old place_id is still stored
    let placeId: string | null;
    try {
      placeId = await extractPlaceId(partnerData.googleReviewUrl);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Could not extract place_id from URL' };
    }
    
    if (!placeId) {
      return { success: false, error: 'Could not extract place_id from URL' };
    }
    
    // Fetch reviews from Google
    const result = await fetchGoogleReviews(placeId);
    
    if (!result.success) {
      return result;
    }
    
    // Update partner with new place_id and review data
    await db
      .update(partner)
      .set({
        googlePlaceId: placeId,
        googleRating: result.rating,
        googleReviewCount: result.reviewCount,
        googleReviewsSyncedAt: new Date(),
      })
      .where(eq(partner.id, partnerId));
    
    // For Black tier partners: sync individual reviews into showroom featuredTestimonials
    if (partnerData.tier === 'black' && result.reviews?.length) {
      const candidates = options?.onlyFiveStar
        ? result.reviews.filter(r => r.rating === 5)
        : result.reviews;
      const [showroomData] = await db
        .select({ id: partnerShowroom.id, featuredTestimonials: partnerShowroom.featuredTestimonials })
        .from(partnerShowroom)
        .where(eq(partnerShowroom.partnerId, partnerId))
        .limit(1);
      
      if (showroomData) {
        const existing = (showroomData.featuredTestimonials || []) as ShowroomTestimonial[];
        const manual = existing.filter(t => t.source !== 'google');
        const googleSlots = Math.max(0, 5 - manual.length);
        const merged = [
          ...manual,
          ...candidates.slice(0, googleSlots),
        ].map((t, i) => ({ ...t, order: i }));
        
        await db
          .update(partnerShowroom)
          .set({ featuredTestimonials: merged })
          .where(eq(partnerShowroom.id, showroomData.id));
        
        console.log(`[GoogleReviews] Synced ${candidates.slice(0, googleSlots).length} reviews to showroom for partner ${partnerId}${options?.onlyFiveStar ? ' (5★ only)' : ''}`);
      }
    }
    
    return {
      ...result,
      reviews: options?.onlyFiveStar ? result.reviews?.filter(r => r.rating === 5) : result.reviews,
    };
  } catch (error) {
    console.error('[GoogleReviews] Sync failed for partner:', partnerId, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Sync reviews for all partners with Google Maps URLs
 * Used by cron job
 */
export async function syncAllPartnerReviews(options: {
  delayMs?: number;
  onProgress?: (completed: number, total: number, current: string) => void;
} = {}): Promise<{ success: number; failed: number; total: number }> {
  const { delayMs = 100, onProgress } = options;
  
  // Get all partners with googleReviewUrl or googlePlaceId
  const partners = await db
    .select({
      id: partner.id,
      brandName: partner.brandName,
      googleReviewUrl: partner.googleReviewUrl,
      googlePlaceId: partner.googlePlaceId,
    })
    .from(partner)
    .where(
      or(
        isNotNull(partner.googleReviewUrl),
        isNotNull(partner.googlePlaceId)
      )
    );
  
  console.log(`[GoogleReviews] Syncing ${partners.length} partners`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < partners.length; i++) {
    const p = partners[i];
    
    if (onProgress) {
      onProgress(i + 1, partners.length, p.brandName);
    }
    
    const result = await syncPartnerReviews(p.id);
    
    if (result.success) {
      success++;
    } else {
      failed++;
      console.error(`[GoogleReviews] Failed to sync ${p.brandName}:`, result.error);
    }
    
    // Rate limiting delay
    if (i < partners.length - 1 && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log(`[GoogleReviews] Sync complete: ${success} success, ${failed} failed`);
  
  return { success, failed, total: partners.length };
}

/**
 * Sync reviews for partners that haven't been synced in X days
 */
export async function syncStalePartnerReviews(staleDays: number = 15): Promise<{ success: number; failed: number; total: number }> {
  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - staleDays);
  
  // Get partners with URLs that are stale or never synced
  const partners = await db
    .select({
      id: partner.id,
      brandName: partner.brandName,
    })
    .from(partner)
    .where(
      sql`(
        ${partner.googleReviewUrl} IS NOT NULL OR ${partner.googlePlaceId} IS NOT NULL
      ) AND (
        ${partner.googleReviewsSyncedAt} IS NULL OR 
        ${partner.googleReviewsSyncedAt} < ${staleDate.toISOString()}
      )`
    );
  
  console.log(`[GoogleReviews] Found ${partners.length} stale partners (>${staleDays} days)`);
  
  let success = 0;
  let failed = 0;
  
  for (const p of partners) {
    const result = await syncPartnerReviews(p.id);
    
    if (result.success) {
      success++;
    } else {
      failed++;
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { success, failed, total: partners.length };
}
