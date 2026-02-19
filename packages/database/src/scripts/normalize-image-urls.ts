/**
 * Migration Script: Normalize Image URLs to Storage Keys
 * 
 * Strips CDN domain prefixes from thumbnail and images fields,
 * storing only the storage key (e.g., "listings/2026/02/19/.../xxx_full.webp")
 * instead of the full URL ("https://cdn.revvup.ae/listings/...").
 * 
 * This makes the DB domain-agnostic — if the CDN domain changes,
 * no data migration is needed. getPublicUrl() resolves keys at render time.
 * 
 * Usage:
 *   cd packages/database
 *   bun run src/scripts/normalize-image-urls.ts
 * 
 * Options:
 *   --dry-run    Preview changes without writing to DB (default)
 *   --execute    Actually write changes to DB
 */

import { config } from 'dotenv';
config({ path: '../../.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';

const { carListing } = schema;

// Known CDN prefixes to strip
const CDN_PREFIXES = [
  'https://cdn.revvup.ae/',
  'https://cdn.alifh.ae/',
  'https://pub-', // R2 public dev URLs like https://pub-xxx.r2.dev/
];

/**
 * Strip CDN prefix from a URL, returning just the storage key.
 * Returns null if unchanged (already a key or unrecognized URL).
 */
function stripCdnPrefix(urlOrKey: string): string | null {
  if (!urlOrKey) return null;
  
  // Already a storage key (no protocol)
  if (!urlOrKey.startsWith('http://') && !urlOrKey.startsWith('https://')) {
    return null; // No change needed
  }
  
  // Try known prefixes first (fast path)
  for (const prefix of CDN_PREFIXES) {
    if (urlOrKey.startsWith(prefix)) {
      // For pub-xxx.r2.dev URLs, extract path after the domain
      if (prefix === 'https://pub-') {
        try {
          const url = new URL(urlOrKey);
          return url.pathname.replace(/^\//, '');
        } catch {
          return null;
        }
      }
      return urlOrKey.slice(prefix.length);
    }
  }
  
  // Generic fallback: any URL pointing to our storage
  try {
    const url = new URL(urlOrKey);
    const path = url.pathname.replace(/^\//, '');
    // Only strip if it looks like a listing image path
    if (path.startsWith('listings/') || path.startsWith('avatars/') || path.startsWith('partners/')) {
      return path;
    }
  } catch {
    // Not a valid URL, return null (no change)
  }
  
  return null;
}

/**
 * Normalize an array of image URLs to storage keys.
 * Returns [normalizedArray, changeCount] or null if no changes.
 */
function normalizeImageArray(images: string[]): [string[], number] | null {
  let changed = 0;
  const normalized = images.map((img) => {
    const key = stripCdnPrefix(img);
    if (key !== null) {
      changed++;
      return key;
    }
    return img;
  });
  return changed > 0 ? [normalized, changed] : null;
}

async function main() {
  const isDryRun = !process.argv.includes('--execute');
  
  console.log('='.repeat(60));
  console.log('  Normalize Image URLs → Storage Keys');
  console.log(`  Mode: ${isDryRun ? 'DRY RUN (preview only)' : '🔴 EXECUTE (writing to DB)'}`);
  console.log('='.repeat(60));
  console.log();
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set. Create packages/database/.env.local');
    process.exit(1);
  }
  
  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });
  
  // Fetch all listings with thumbnail or images
  console.log('Fetching listings...');
  const listings = await db
    .select({
      id: carListing.id,
      thumbnail: carListing.thumbnail,
      images: carListing.images,
    })
    .from(carListing);
  
  console.log(`Found ${listings.length} listings\n`);
  
  let totalUpdated = 0;
  let thumbnailsFixed = 0;
  let imagesFixed = 0;
  let imageUrlsFixed = 0;
  
  for (const listing of listings) {
    let needsUpdate = false;
    const updates: { thumbnail?: string; images?: string[] } = {};
    
    // Check thumbnail
    if (listing.thumbnail) {
      const key = stripCdnPrefix(listing.thumbnail);
      if (key !== null) {
        updates.thumbnail = key;
        needsUpdate = true;
        thumbnailsFixed++;
      }
    }
    
    // Check images array
    if (listing.images && listing.images.length > 0) {
      const result = normalizeImageArray(listing.images);
      if (result) {
        const [normalizedImages, count] = result;
        updates.images = normalizedImages;
        needsUpdate = true;
        imagesFixed++;
        imageUrlsFixed += count;
      }
    }
    
    if (needsUpdate) {
      totalUpdated++;
      
      if (isDryRun) {
        console.log(`[DRY RUN] ${listing.id}:`);
        if (updates.thumbnail) {
          console.log(`  thumbnail: ${listing.thumbnail}`);
          console.log(`         → ${updates.thumbnail}`);
        }
        if (updates.images) {
          console.log(`  images: ${listing.images?.length} URLs → ${updates.images.length} keys (${imageUrlsFixed} changed)`);
        }
      } else {
        await db
          .update(carListing)
          .set(updates)
          .where(eq(carListing.id, listing.id));
      }
    }
  }
  
  console.log();
  console.log('='.repeat(60));
  console.log('  Summary');
  console.log('='.repeat(60));
  console.log(`  Total listings:     ${listings.length}`);
  console.log(`  Listings updated:   ${totalUpdated}`);
  console.log(`  Thumbnails fixed:   ${thumbnailsFixed}`);
  console.log(`  Image arrays fixed: ${imagesFixed}`);
  console.log(`  Image URLs fixed:   ${imageUrlsFixed}`);
  console.log();
  
  if (isDryRun && totalUpdated > 0) {
    console.log('  Run with --execute to apply changes:');
    console.log('  bun run src/scripts/normalize-image-urls.ts --execute');
  } else if (totalUpdated === 0) {
    console.log('  ✅ All image URLs are already storage keys. Nothing to do.');
  } else {
    console.log('  ✅ All changes applied successfully.');
  }
  console.log();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
