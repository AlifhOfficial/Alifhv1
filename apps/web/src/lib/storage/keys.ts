/**
 * Storage Key Generator
 * 
 * Generates organized storage keys with date-based directory structure.
 * Format: {category}/{id}/{YYYY}/{MM}/{DD}/{filename}
 * 
 * Directory Structure:
 * - users/{userId}/{YYYY}/{MM}/{DD}/avatar-{timestamp}.webp
 * - brands/{partnerId}/{YYYY}/{MM}/{DD}/logo-{timestamp}.webp
 * - brands/{partnerId}/{YYYY}/{MM}/{DD}/hero-{timestamp}.webp
 * - brands/{partnerId}/showroom/{YYYY}/{MM}/{DD}/{type}-{timestamp}.webp
 */

/**
 * Get date parts for path generation
 */
function getDatePath(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Generate a unique timestamp-based filename
 */
function generateTimestampFilename(prefix: string, extension: string = 'webp'): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}.${extension}`;
}

// ============================================================================
// User Avatar Keys
// ============================================================================

export interface UserAvatarKeyOptions {
  userId: string;
  date?: Date;
}

/**
 * Generate storage key for user avatar
 * Format: users/{userId}/{YYYY}/{MM}/{DD}/avatar-{timestamp}.webp
 * 
 * @example
 * generateUserAvatarKey({ userId: 'abc123' })
 * // => "users/abc123/2026/01/18/avatar-1737234567890.webp"
 */
export function generateUserAvatarKey(options: UserAvatarKeyOptions): string {
  const { userId, date = new Date() } = options;
  const datePath = getDatePath(date);
  const filename = generateTimestampFilename('avatar');
  return `users/${userId}/${datePath}/${filename}`;
}

// ============================================================================
// Brand/Partner Image Keys
// ============================================================================

export type BrandImageType = 'logo' | 'hero';

export interface BrandImageKeyOptions {
  partnerId: string;
  type: BrandImageType;
  date?: Date;
}

/**
 * Generate storage key for brand/partner images (logo or hero)
 * Format: brands/{partnerId}/{YYYY}/{MM}/{DD}/{type}-{timestamp}.webp
 * 
 * @example
 * generateBrandImageKey({ partnerId: 'xyz789', type: 'logo' })
 * // => "brands/xyz789/2026/01/18/logo-1737234567890.webp"
 * 
 * generateBrandImageKey({ partnerId: 'xyz789', type: 'hero' })
 * // => "brands/xyz789/2026/01/18/hero-1737234567890.webp"
 */
export function generateBrandImageKey(options: BrandImageKeyOptions): string {
  const { partnerId, type, date = new Date() } = options;
  const datePath = getDatePath(date);
  const filename = generateTimestampFilename(type);
  return `brands/${partnerId}/${datePath}/${filename}`;
}

// ============================================================================
// Showroom Asset Keys (Black Tier)
// ============================================================================

export type ShowroomAssetType = 
  | 'hero-video-thumb'     // Hero video thumbnail
  | 'hero-image'           // Hero background image
  | 'hero-video'           // Hero background video (MP4/WebM)
  | 'brand-story-video-thumb' // Brand story video thumbnail
  | 'brand-story-video'    // Brand story video (MP4/WebM)
  | 'showroom-tour-video'  // Virtual tour / showroom video
  | 'founder-image'        // Founder headshot
  | 'gallery'              // Showroom gallery images
  | 'exterior'             // Showroom exterior photos
  | 'team-member'          // Team member photos
  | 'achievement'          // Achievement badges/images
  | 'client-logo'          // Client logo images
  | 'testimonial'          // Customer testimonial photos
  | 'press-logo'           // Press/media publication logos
  | 'seo-image';           // OG/SEO image

export interface ShowroomAssetKeyOptions {
  partnerId: string;
  type: ShowroomAssetType;
  index?: number; // For arrays (gallery, team, etc.)
  date?: Date;
  extension?: string; // File extension (webp, mp4, webm)
}

/**
 * Generate storage key for showroom assets (Black tier exclusive)
 * Format: brands/{partnerId}/showroom/{YYYY}/{MM}/{DD}/{type}-{index?}-{timestamp}.{ext}
 * 
 * All showroom assets are stored under the partner's brand directory for easy management.
 * 
 * @example
 * generateShowroomAssetKey({ partnerId: 'xyz789', type: 'hero-image' })
 * // => "brands/xyz789/showroom/2026/01/19/hero-image-1737234567890.webp"
 * 
 * generateShowroomAssetKey({ partnerId: 'xyz789', type: 'hero-video', extension: 'mp4' })
 * // => "brands/xyz789/showroom/2026/01/19/hero-video-1737234567890.mp4"
 * 
 * generateShowroomAssetKey({ partnerId: 'xyz789', type: 'gallery', index: 3 })
 * // => "brands/xyz789/showroom/2026/01/19/gallery-3-1737234567890.webp"
 */
export function generateShowroomAssetKey(options: ShowroomAssetKeyOptions): string {
  const { partnerId, type, index, date = new Date(), extension = 'webp' } = options;
  const datePath = getDatePath(date);
  const prefix = index !== undefined ? `${type}-${index}` : type;
  const filename = generateTimestampFilename(prefix, extension);
  return `brands/${partnerId}/showroom/${datePath}/${filename}`;
}
