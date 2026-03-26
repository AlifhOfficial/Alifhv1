/**
 * Delete Script for Old Seeded Car Listings
 * Removes listings with old image paths (Labeled_Cars/*.jpeg)
 */

import 'dotenv/config';
import { db } from './dbclient';
import { carListing } from './schema/listing';
import { like, or } from 'drizzle-orm';

async function deleteOldSeededListings() {
  console.log('\n============================================================');
  console.log('🗑️  DELETE OLD SEEDED LISTINGS');
  console.log('============================================================\n');

  try {
    // Find listings with old image paths (both Labeled_Cars and revvup-public prefix)
    const oldListings = await db
      .select()
      .from(carListing)
      .where(
        or(
          like(carListing.thumbnail, '%Labeled_Cars/%'),
          like(carListing.thumbnail, '%revvup-public/static/%')
        )
      );

    console.log(`📋 Found ${oldListings.length} listings with old image paths:\n`);
    
    oldListings.forEach((listing, idx) => {
      console.log(`   ${idx + 1}. ${listing.year} ${listing.make} ${listing.model}`);
      console.log(`      ID: ${listing.id}`);
      console.log(`      Thumbnail: ${listing.thumbnail}\n`);
    });

    if (oldListings.length === 0) {
      console.log('✅ No old listings found. Nothing to delete.\n');
      console.log('============================================================\n');
      return;
    }

    // Delete the old listings
    console.log('🗑️  Deleting old listings...\n');
    
    const result = await db
      .delete(carListing)
      .where(
        or(
          like(carListing.thumbnail, '%Labeled_Cars/%'),
          like(carListing.thumbnail, '%revvup-public/static/%')
        )
      );

    console.log('============================================================');
    console.log('🎉 DELETION COMPLETE!');
    console.log('============================================================\n');
    console.log(`   ✅ Deleted ${oldListings.length} listings with old image paths\n`);
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ Error deleting listings:', error);
    process.exit(1);
  }
}

// Run the deletion
deleteOldSeededListings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
