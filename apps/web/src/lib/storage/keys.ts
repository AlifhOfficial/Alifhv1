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
