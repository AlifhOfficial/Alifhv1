/**
 * Test Google Reviews Sync
 * 
 * Usage:
 * bun run packages/database/src/test-google-sync.ts "https://maps.google.com/?cid=12345"
 */

import { extractPlaceId, fetchGoogleReviews } from './services/google-reviews';

const testUrl = process.argv[2] || 'ChIJN1t_tDeuEmsRUsoyG83frY4';

console.log('\n🧪 Testing Google Reviews Sync\n');
console.log('Input:', testUrl);

// Test place_id extraction (now async)
(async () => {
  const placeId = await extractPlaceId(testUrl);
  console.log('\n✅ Extracted Place ID:', placeId || '❌ Failed to extract');

  if (!placeId) {
    console.log('\n❌ Could not extract place_id from URL');
    console.log('\nSupported formats:');
    console.log('  - https://maps.google.com/?cid=12345678901234567890');
    console.log('  - https://www.google.com/maps/place/.../@lat,lng,zoom/data=!...');
    console.log('  - https://share.google/ShortCode');
    console.log('  - Direct place_id: ChIJN1t_tDeuEmsRUsoyG83frY4');
    process.exit(1);
  }

  // Test API fetch
  console.log('\n📡 Fetching reviews from Google Places API...');

  const result = await fetchGoogleReviews(placeId);
  
  if (result.success) {
    console.log('\n✅ Success!');
    console.log('  Rating:', result.rating);
    console.log('  Reviews:', result.reviewCount);
  } else {
    console.log('\n❌ Failed:', result.error);
  }
})();
