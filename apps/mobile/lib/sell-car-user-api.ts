/**
 * Sell Car User API — Mobile
 *
 * Consolidated API layer for the user "Sell My Car" flow:
 *   • Create listing   (multi-step form → POST /api/listings)
 *   • Edit listing      (PUT /api/listings/[id])
 *   • My Listings       (GET /api/listings/my-listings + stats)
 *   • Lifecycle actions (mark-sold, extend, archive, delete)
 *   • Image upload      (client-side compression + direct R2 upload)
 *   • VIN check         (GET /api/listings/check-vin)
 *
 * Each public function returns data already transformed for native UI
 * consumption — absolute image URLs, normalised statuses, etc.
 *
 * @module lib/sell-car-user-api
 */

import { API_BASE, getAppImageUrl } from './config';
import { getStoredSession, type AuthSession } from './auth-api';

// ============================================================================
// TYPES — Create / Edit Listing Form
// ============================================================================

/** Status a user can set when submitting a listing */
export type UserListingSubmitStatus = 'draft' | 'published';

/** The full payload accepted by POST /api/listings and PUT /api/listings/[id] */
export interface ListingFormPayload {
  // ── Step 1: VIN & Identity ──────────────────────────────────────────
  vin?: string | null;
  vinVisibility?: 'public' | 'private'; // Controls if VIN shown publicly (default: public)
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  condition?: 'new' | 'used';

  // ── Step 2: Vehicle Details ─────────────────────────────────────────
  price: number;
  currency?: string;            // default AED
  isNegotiable?: boolean;
  mileage: number;
  specs: string;                // gcc | us | european | japanese | korean | chinese | canadian | other
  steeringSide: string;         // left | right
  emirate: string;              // Abu Dhabi, Dubai, …
  city?: string | null;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineSize?: string | null;
  engineType?: string | null;
  cylinders?: number | null;
  powerRange?: string | null;
  torque?: string | null;
  fuelEconomy?: string | null;
  doors?: string | null;
  seatingCapacity?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  description?: string | null;

  // ── Step 3: Media & Publish ─────────────────────────────────────────
  thumbnail?: string | null;
  images?: string[];
  videoUrl?: string | null;
  technicalFeatures?: Record<string, boolean | number | string>;
  extras?: string[];
  specialNotes?: Record<string, any>;
  tags?: string[];
  badges?: string[];
  exportStatus?: string | null;
  warrantyType?: string | null;

  // ── Submission ──────────────────────────────────────────────────────
  status?: UserListingSubmitStatus;
}

// ============================================================================
// TYPES — My Listings
// ============================================================================

/** Moderation workflow status */
export type ModerationStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'approved'
  | 'rejected';

/** Lifecycle status after approval */
export type LifecycleStatus =
  | 'active'
  | 'archived'
  | 'sold'
  | 'expired'
  | 'deleted';

/** Aggregate filter used in the My Listings tab bar */
export type MyListingsFilter =
  | 'all'
  | 'public'
  | 'published'
  | 'pending'
  | 'draft'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'archived'
  | 'suspended'
  | 'sold'
  | 'expired'
  | 'deleted'
  | 'deep_inventory'
  | 'in_review';

/** Sort options for My Listings */
export type MyListingsSort = 'newest' | 'oldest' | 'updated' | 'expiring';

/** Query params for GET /api/listings/my-listings */
export interface MyListingsParams {
  status?: MyListingsFilter;
  moderationStatus?: ModerationStatus;
  lifecycleStatus?: LifecycleStatus;
  listingType?: 'personal' | 'work';
  sort?: MyListingsSort;
  q?: string;
  includeStats?: boolean;
  limit?: number;   // max 100, default 50
  offset?: number;
}

/** A single card from the my-listings response */
export interface MyListingCard {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  currency: string;
  mileage: number;
  emirate: string;
  specs: string;
  thumbnail: string | null;
  images: string[];
  // Statuses
  moderationStatus: ModerationStatus;
  lifecycleStatus: LifecycleStatus;
  isArchived: boolean;
  // Engagement
  viewCount: number;
  impressionCount: number;
  favouriteCount: number;
  superlikeCount: number;
  // Timestamps
  createdAt: string;
  updatedAt: string | null;
  expiresAt: string | null;
  approvedAt: string | null;
  // Flags
  isBlkListing: boolean;
  partnerId: string | null;
  rejectionReason: string | null;
  /** AI moderation info for pending review listings */
  aiModeration?: {
    reasoning?: string;
    flags?: Array<string | { code: string; severity?: string; message?: string }>;
    confidence?: number;
  } | null;
}

/** Stats returned when includeStats=true */
export interface MyListingsStats {
  total: number;
  active: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  sold: number;
  expired: number;
  archived: number;
}

/** Full response from GET /api/listings/my-listings */
export interface MyListingsResponse {
  listings: MyListingCard[];
  stats: MyListingsStats | null;
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// TYPES — VIN Check
// ============================================================================

export interface VinCheckResult {
  isUnique: boolean;
  existingListingId?: string | null;
  nhtsa?: {
    make?: string | null;
    model?: string | null;
    year?: string | null;
    trim?: string | null;
    bodyType?: string | null;
    fuelType?: string | null;
    engineSize?: string | null;
    cylinders?: string | null;
    transmission?: string | null;
    doors?: string | null;
    errorCode?: string;
    errorText?: string;
  } | null;
}

// ============================================================================
// TYPES — Image Upload
// ============================================================================

export interface ImageUploadResult {
  url: string;       // Relative CDN key
  absoluteUrl: string; // Full URL (transformed for native <Image/>)
}

/** Result from direct listing upload (thumb + full pair) */
export interface DirectListingUploadResult {
  thumbKey: string;
  thumbUrl: string;
  fullKey: string;
  fullUrl: string;
}

/** Result from direct single image upload (avatar, showroom) */
export interface DirectSingleUploadResult {
  key: string;
  url: string;
}

// ============================================================================
// TYPES — API Responses (raw → transformed)
// ============================================================================

/** AI moderation result returned with new listings */
export interface AIModerationResult {
  decision: 'approve' | 'flag';
  approved: boolean;
}

export interface CreateListingResponse {
  id: string;
  slug: string | null;
  moderationStatus: ModerationStatus;
  lifecycleStatus: LifecycleStatus;
  /** AI moderation result (only for user-posted published listings) */
  moderation: AIModerationResult | null;
}

export interface UpdateListingResponse {
  id: string;
  slug: string | null;
  moderationStatus: ModerationStatus;
  lifecycleStatus: LifecycleStatus;
  updatedAt: string;
  /** AI moderation result (only when publishing a draft) */
  moderation?: AIModerationResult | null;
}

export interface DeleteListingResponse {
  success: boolean;
  id: string;
  action: 'soft_deleted' | 'hard_deleted';
}

export interface MarkSoldResponse {
  success: boolean;
  id: string;
  lifecycleStatus: 'sold';
}

export interface ExtendListingResponse {
  success: boolean;
  id: string;
  newExpiresAt: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Convert relative CDN path → absolute URL for native <Image/> */
function toAbsoluteUrl(path: string | null | undefined): string | null {
  return getAppImageUrl(path);
}

/**
 * Authenticated fetch wrapper.
 * Automatically injects Bearer token + Origin header.
 * Supports timeout for long-running requests.
 */
async function authFetch(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 30000, ...fetchOptions } = options;
  const session = await getStoredSession();

  const headers: Record<string, string> = {
    'Origin': API_BASE,
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  // Only set Content-Type for JSON bodies (not for FormData/multipart)
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Throw a descriptive error from a failed response */
async function handleError(res: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const body = await res.json();
    message = body.error || body.message || fallback;
  } catch {
    /* body wasn't JSON */
  }
  throw new Error(message);
}

/**
 * Transform a raw my-listing card — resolve all image URLs.
 */
function transformMyListingCard(raw: any): MyListingCard {
  return {
    id: raw.id,
    make: raw.make,
    model: raw.model,
    year: raw.year,
    trim: raw.trim ?? null,
    price: raw.price,
    currency: raw.currency ?? 'AED',
    mileage: raw.mileage,
    emirate: raw.emirate,
    specs: raw.specs,
    thumbnail: toAbsoluteUrl(raw.thumbnail),
    images: (raw.images ?? []).map((img: string) => toAbsoluteUrl(img)).filter(Boolean),
    moderationStatus: raw.moderationStatus ?? 'draft',
    lifecycleStatus: raw.lifecycleStatus ?? 'active',
    isArchived: raw.isArchived ?? raw.lifecycleStatus === 'archived',
    viewCount: raw.viewCount ?? 0,
    impressionCount: raw.impressionCount ?? 0,
    favouriteCount: raw.favouriteCount ?? 0,
    superlikeCount: raw.superlikeCount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? null,
    expiresAt: raw.expiresAt ?? null,
    approvedAt: raw.approvedAt ?? null,
    isBlkListing: raw.isBlkListing ?? false,
    partnerId: raw.partnerId ?? null,
    rejectionReason: raw.rejectionReason ?? null,
    aiModeration: raw.aiModeration ?? null,
  };
}

// ============================================================================
// API — VIN CHECK
// ============================================================================

/**
 * Check VIN uniqueness + NHTSA decode.
 * GET /api/listings/check-vin?vin=...&excludeId=...
 *
 * @param vin        17-char VIN
 * @param excludeId  (optional) listing ID to exclude (edit mode)
 */
export async function checkVin(
  vin: string,
  excludeId?: string,
): Promise<VinCheckResult> {
  const params = new URLSearchParams({ vin });
  if (excludeId) params.append('excludeId', excludeId);

  const res = await authFetch(`/api/listings/check-vin?${params.toString()}`);
  if (!res.ok) await handleError(res, 'VIN check failed');

  const data = await res.json();

  // API returns { available, decoded, existingListing } — map to VinCheckResult
  return {
    isUnique: data.available === true,
    existingListingId: data.existingListing?.id ?? null,
    nhtsa: data.decoded ?? null,
  };
}

// ============================================================================
// API — IMAGE UPLOAD (via preprocessing server)
//
// Pipeline:
//   1. preshrinkForUpload()           →  1600px JPEG, ~100-200KB  (client)
//   2. POST /api/storage/upload-token →  HMAC token + uploadUrl   (Vercel edge)
//   3. POST uploadUrl (multipart)     →  Sharp → R2, returns keys (Fly/pre.revvup.ae)
// ============================================================================

/**
 * Delete a listing image from R2.
 * DELETE /api/storage/delete
 *
 * @param key  R2 object key (e.g. "listings/2026/02/xxx_full.webp")
 */
export async function deleteListingImage(key: string): Promise<void> {
  const res = await authFetch('/api/storage/delete', {
    method: 'DELETE',
    body: JSON.stringify({ key }),
  });

  if (!res.ok) await handleError(res, 'Image delete failed');
}

/**
 * Get a short-lived HMAC upload token from the Vercel edge.
 * Returns the token AND the preprocessing server URL to POST to.
 * Token TTL: 5 minutes — call once per upload session and reuse.
 */
async function getUploadToken(body: Record<string, string>): Promise<{ token: string; uploadUrl: string }> {
  const res = await authFetch('/api/storage/upload-token', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get upload token');
  }

  return res.json();
}

/**
 * POST a single preshrunk image to the preprocessing server as multipart.
 * Server authenticates via HMAC Bearer token, runs Sharp, uploads to R2.
 */
async function postToPreprocessing(
  uploadUrl: string,
  token: string,
  uri: string,
): Promise<any> {
  const form = new FormData();
  // React Native FormData accepts { uri, type, name } objects directly
  form.append('file', { uri, type: 'image/jpeg', name: 'image.jpg' } as any);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed. Please try again.');
  }

  return res.json();
}

/**
 * Get an upload token for a listing session.
 * Call ONCE per listing upload session, then pass token + uploadUrl to
 * uploadListingImageDirect() for each image.
 *
 * @param vin - VIN string (min 11 chars)
 */
export async function getListingUploadToken(vin: string): Promise<{ token: string; uploadUrl: string }> {
  return getUploadToken({ type: 'listing', vin });
}

/**
 * Upload a single listing image via the preprocessing server.
 *
 * The caller is responsible for preshrinking first via preshrinkForUpload().
 * Server produces thumb (480px) + full (1400px) WebP with sharpening applied.
 * All images in a batch share the same token — fire in parallel.
 *
 * @param uri       - Preshrunk image URI (from preshrinkForUpload)
 * @param token     - Token from getListingUploadToken()
 * @param uploadUrl - URL from getListingUploadToken()
 */
export async function uploadListingImageDirect(
  uri: string,
  token: string,
  uploadUrl: string,
): Promise<DirectListingUploadResult> {
  const data = await postToPreprocessing(uploadUrl, token, uri);
  const result = data.results?.[0];
  if (!result || result.error) throw new Error(result?.error || 'Processing failed');

  return {
    thumbKey: result.thumbKey,
    thumbUrl: result.thumbUrl,
    fullKey: result.fullKey,
    fullUrl: result.fullUrl,
  };
}

/**
 * Upload an avatar via the preprocessing server.
 * Server produces a 512px WebP output with sharpening applied.
 *
 * @param uri - Preshrunk image URI (from preshrinkForUpload)
 */
export async function uploadAvatarDirect(uri: string): Promise<DirectSingleUploadResult> {
  const { token, uploadUrl } = await getUploadToken({ type: 'avatar' });
  const data = await postToPreprocessing(uploadUrl, token, uri);
  const result = data.results?.[0];
  if (!result || result.error) throw new Error(result?.error || 'Processing failed');

  return { key: result.key, url: result.url };
}

// ============================================================================
// API — CREATE LISTING
// ============================================================================

/**
 * Create a new car listing.
 * POST /api/listings
 *
 * For regular users the listing enters moderation (moderationStatus = 'submitted').
 * Drafts (status = 'draft') stay in draft without moderation.
 * 
 * Returns moderation result for published user listings:
 * - approved: true → listing is live, navigate to detail page
 * - approved: false → listing flagged for review, navigate to inventory
 */
export async function createListing(
  payload: ListingFormPayload,
): Promise<CreateListingResponse> {
  const res = await authFetch('/api/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) await handleError(res, 'Failed to create listing');

  const data = await res.json();
  const listingData = data.data || data;
  
  return {
    id: listingData.id,
    slug: listingData.slug ?? null,
    moderationStatus: listingData.moderationStatus ?? 'submitted',
    lifecycleStatus: listingData.lifecycleStatus ?? 'active',
    moderation: listingData.moderation ?? null,
  };
}

// ============================================================================
// API — UPDATE / EDIT LISTING
// ============================================================================

/**
 * Fetch a single listing for editing (owner/admin only, includes drafts).
 * GET /api/listings/[id]
 */
export async function getListingForEdit(
  listingId: string,
): Promise<ListingFormPayload & { id: string; moderationStatus: ModerationStatus; lifecycleStatus: LifecycleStatus; images: string[] }> {
  const res = await authFetch(`/api/listings/${listingId}`);
  if (!res.ok) await handleError(res, 'Failed to load listing for editing');

  const data = await res.json();

  // Resolve image URLs for display in the native form
  return {
    ...data,
    thumbnail: toAbsoluteUrl(data.thumbnail),
    images: (data.images ?? []).map((img: string) => toAbsoluteUrl(img)).filter(Boolean),
  };
}

/**
 * Update an existing listing.
 * PUT /api/listings/[id]
 *
 * Accepts partial updates — send only the fields that changed.
 * Content edits re-trigger AI moderation for user-posted listings.
 * Rate limited: 20 updates / hour.
 */
export async function updateListing(
  listingId: string,
  payload: Partial<ListingFormPayload>,
): Promise<UpdateListingResponse> {
  const res = await authFetch(`/api/listings/${listingId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!res.ok) await handleError(res, 'Failed to update listing');

  const data = await res.json();
  // Server wraps response in { success, data: { ... } }
  const d = data.data || data;
  return {
    id: d.id,
    slug: d.slug ?? null,
    moderationStatus: d.moderationStatus,
    lifecycleStatus: d.lifecycleStatus,
    updatedAt: d.updatedAt,
    moderation: d.moderation ?? null,
  };
}

// ============================================================================
// API — MY LISTINGS
// ============================================================================

/**
 * Fetch the current user's listings with optional filtering & stats.
 * GET /api/listings/my-listings
 */
export async function getMyListings(
  params: MyListingsParams = {},
): Promise<MyListingsResponse> {
  const query = new URLSearchParams();

  if (params.status)           query.append('status', params.status);
  if (params.moderationStatus) query.append('moderationStatus', params.moderationStatus);
  if (params.lifecycleStatus)  query.append('lifecycleStatus', params.lifecycleStatus);
  if (params.listingType)      query.append('listingType', params.listingType ?? 'personal');
  if (params.sort)             query.append('sort', params.sort);
  if (params.q)                query.append('q', params.q);
  if (params.includeStats)     query.append('includeStats', '1');
  if (params.limit != null)    query.append('limit', String(params.limit));
  if (params.offset != null)   query.append('offset', String(params.offset));

  const qs = query.toString();
  const res = await authFetch(`/api/listings/my-listings${qs ? `?${qs}` : ''}`);
  if (!res.ok) await handleError(res, 'Failed to fetch your listings');

  const data = await res.json();

  return {
    listings: (data.listings ?? []).map(transformMyListingCard),
    stats: data.stats ?? null,
    total: data.total ?? data.listings?.length ?? 0,
    limit: data.limit ?? params.limit ?? 50,
    offset: data.offset ?? params.offset ?? 0,
  };
}

// ============================================================================
// API — LIFECYCLE ACTIONS
// ============================================================================

/**
 * Mark a listing as sold.
 * POST /api/listings/[id]/mark-sold
 */
export async function markListingSold(
  listingId: string,
): Promise<MarkSoldResponse> {
  const res = await authFetch(`/api/listings/${listingId}/mark-sold`, {
    method: 'POST',
  });

  if (!res.ok) await handleError(res, 'Failed to mark listing as sold');

  return { success: true, id: listingId, lifecycleStatus: 'sold' };
}

/**
 * Extend a listing's expiry by 7 or 14 days.
 * POST /api/listings/[id]/extend
 * Can only extend within the last 2 days before expiry.
 */
export async function extendListing(
  listingId: string,
  days: 7 | 14 = 7,
): Promise<ExtendListingResponse> {
  const res = await authFetch(`/api/listings/${listingId}/extend`, {
    method: 'POST',
    body: JSON.stringify({ days }),
  });

  if (!res.ok) await handleError(res, 'Failed to extend listing');

  const data = await res.json();
  return {
    success: true,
    id: listingId,
    newExpiresAt: data.expiresAt ?? data.newExpiresAt,
  };
}

/**
 * Archive or unarchive a listing.
 * PUT /api/listings/[id]  (sets lifecycleStatus = 'archived' | 'active')
 */
export async function toggleArchiveListing(
  listingId: string,
  archive: boolean,
): Promise<UpdateListingResponse> {
  return updateListing(listingId, {
    lifecycleStatus: archive ? 'archived' : 'active',
  } as any);
}

// ============================================================================
// API — DELETE LISTING
// ============================================================================

/**
 * Soft-delete a listing (moves to "deleted" state, recoverable by admin).
 * DELETE /api/listings/[id]
 */
export async function deleteListing(
  listingId: string,
): Promise<DeleteListingResponse> {
  const res = await authFetch(`/api/listings/${listingId}`, {
    method: 'DELETE',
  });

  if (!res.ok) await handleError(res, 'Failed to delete listing');

  return { success: true, id: listingId, action: 'soft_deleted' };
}

/**
 * Permanently delete a listing and its R2 images.
 * DELETE /api/listings/[id]/hard-delete
 */
export async function hardDeleteListing(
  listingId: string,
): Promise<DeleteListingResponse> {
  const res = await authFetch(`/api/listings/${listingId}/hard-delete`, {
    method: 'DELETE',
  });

  if (!res.ok) await handleError(res, 'Failed to permanently delete listing');

  return { success: true, id: listingId, action: 'hard_deleted' };
}

/**
 * Bulk soft-delete multiple listings (max 100).
 * POST /api/listings/bulk-delete
 */
export async function bulkDeleteListings(
  listingIds: string[],
): Promise<{ success: boolean; deletedCount: number }> {
  const res = await authFetch('/api/listings/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids: listingIds }),
  });

  if (!res.ok) await handleError(res, 'Bulk delete failed');

  const data = await res.json();
  return { success: true, deletedCount: data.deletedCount ?? listingIds.length };
}

// ============================================================================
// CONSOLIDATED EXPORT
// ============================================================================

export const sellCarUserApi = {
  // VIN
  checkVin,

  // Images (via preprocessing server — token → pre.revvup.ae/process → R2)
  getUploadToken: getListingUploadToken,
  uploadImage: uploadListingImageDirect,
  deleteImage: deleteListingImage,

  // CRUD
  create: createListing,
  getForEdit: getListingForEdit,
  update: updateListing,

  // My Listings
  getMyListings,

  // Lifecycle
  markSold: markListingSold,
  extend: extendListing,
  toggleArchive: toggleArchiveListing,

  // Delete
  delete: deleteListing,
  hardDelete: hardDeleteListing,
  bulkDelete: bulkDeleteListings,
} as const;

export default sellCarUserApi;
