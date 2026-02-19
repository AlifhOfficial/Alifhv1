/**
 * Migration Script: Backfill qiScore for existing listings
 * 
 * Computes qiScore for all listings that don't have one set.
 * qiScore is used for lightweight relevance sorting instead of
 * expensive runtime calculations.
 * 
 * Usage:
 *   cd packages/database
 *   bun run src/scripts/backfill-qi-scores.ts
 * 
 * Options:
 *   --dry-run    Preview changes without writing to DB (default)
 *   --execute    Actually write changes to DB
 */

import { config } from 'dotenv';
config({ path: '../../.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, isNull, sql } from 'drizzle-orm';
import * as schema from '../schema';
import { computeQiScore } from '../queries/listings/car-listings/mutations/helpers';

const { carListing } = schema;

const BATCH_SIZE = 500;

interface ListingRow {
  id: string;
  images: string[] | null;
  description: string | null;
  extras: string[] | null;
  tags: string[] | null;
  videoUrl: string | null;
  partnerVerified: boolean;
}

async function main() {
  const isDryRun = !process.argv.includes('--execute');
  
  console.log(`\n=== Backfill qiScore for Listings ===`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'EXECUTE (writing to DB)'}\n`);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Create .env.local with DATABASE_URL.');
    process.exit(1);
  }

  const client = neon(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  // Count listings without qiScore
  const [{ count: totalWithoutScore }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(carListing)
    .where(isNull(carListing.qiScore));

  console.log(`Found ${totalWithoutScore} listings without qiScore`);

  if (totalWithoutScore === 0) {
    console.log('Nothing to do!');
    return;
  }

  let processed = 0;
  let updated = 0;
  let offset = 0;

  while (offset < totalWithoutScore) {
    // Fetch batch of listings without qiScore
    const listings = await db
      .select({
        id: carListing.id,
        images: carListing.images,
        description: carListing.description,
        extras: carListing.extras,
        tags: carListing.tags,
        videoUrl: carListing.videoUrl,
        partnerVerified: carListing.partnerVerified,
      })
      .from(carListing)
      .where(isNull(carListing.qiScore))
      .limit(BATCH_SIZE)
      .offset(offset);

    if (listings.length === 0) break;

    for (const listing of listings) {
      const score = computeQiScore({
        images: listing.images,
        description: listing.description,
        extras: listing.extras,
        tags: listing.tags,
        videoUrl: listing.videoUrl,
        partnerVerified: listing.partnerVerified ?? false,
      });

      if (!isDryRun) {
        await db
          .update(carListing)
          .set({ qiScore: score })
          .where(eq(carListing.id, listing.id));
        updated++;
      } else {
        // In dry-run, just log a sample
        if (processed < 5) {
          const imageCnt = (listing.images ?? []).length;
          const descLen = (listing.description ?? '').length;
          console.log(`  [dry-run] ${listing.id}: score=${score.toFixed(2)} (${imageCnt} images, ${descLen} chars desc)`);
        }
        updated++;
      }

      processed++;
    }

    const pct = ((processed / totalWithoutScore) * 100).toFixed(1);
    console.log(`Progress: ${processed}/${totalWithoutScore} (${pct}%)`);
    
    offset += BATCH_SIZE;
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total processed: ${processed}`);
  console.log(`${isDryRun ? 'Would update' : 'Updated'}: ${updated} listings`);
  
  if (isDryRun) {
    console.log(`\nTo apply changes, run with --execute flag:`);
    console.log(`  bun run src/scripts/backfill-qi-scores.ts --execute`);
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
