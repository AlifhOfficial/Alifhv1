/**
 * Backfill Script: Fix condition column based on mileage
 * 
 * Problem: Many listings have incorrect `condition` values that don't match their mileage.
 * Rule: mileage < 5000 = 'new', mileage >= 5000 = 'used'
 * 
 * Usage: bun run packages/database/src/scripts/backfill-condition.ts
 */

import { db } from '../index';
import { carListing } from '../schema/listing';
import { sql, lt, gte, ne, or, isNull } from 'drizzle-orm';

async function backfillCondition() {
  console.log('🔄 Starting condition backfill...\n');

  // Get counts before fix
  const beforeCounts = await db.execute(sql`
    SELECT 
      condition,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE mileage < 5000) as should_be_new,
      COUNT(*) FILTER (WHERE mileage >= 5000) as should_be_used
    FROM car_listing
    GROUP BY condition
    ORDER BY condition
  `);
  
  console.log('📊 Before fix:');
  console.table(beforeCounts.rows);

  // Count mismatches
  const mismatches = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM car_listing
    WHERE 
      (mileage < 5000 AND (condition != 'new' OR condition IS NULL))
      OR 
      (mileage >= 5000 AND (condition != 'used' OR condition IS NULL))
  `);
  
  const mismatchCount = Number(mismatches.rows[0]?.count || 0);
  console.log(`\n❌ Found ${mismatchCount} listings with incorrect condition\n`);

  if (mismatchCount === 0) {
    console.log('✅ No mismatches found. All conditions are correct!');
    return;
  }

  // Fix listings that should be 'new' (mileage < 5000)
  console.log('🔧 Fixing listings that should be "new" (mileage < 5000)...');
  const newResult = await db
    .update(carListing)
    .set({ condition: 'new' })
    .where(
      sql`${carListing.mileage} < 5000 AND (${carListing.condition} != 'new' OR ${carListing.condition} IS NULL)`
    );
  console.log(`   Updated ${newResult.rowCount} listings to "new"`);

  // Fix listings that should be 'used' (mileage >= 5000)
  console.log('🔧 Fixing listings that should be "used" (mileage >= 5000)...');
  const usedResult = await db
    .update(carListing)
    .set({ condition: 'used' })
    .where(
      sql`${carListing.mileage} >= 5000 AND (${carListing.condition} != 'used' OR ${carListing.condition} IS NULL)`
    );
  console.log(`   Updated ${usedResult.rowCount} listings to "used"`);

  // Get counts after fix
  const afterCounts = await db.execute(sql`
    SELECT 
      condition,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE mileage < 5000) as under_5k_km,
      COUNT(*) FILTER (WHERE mileage >= 5000) as over_5k_km
    FROM car_listing
    GROUP BY condition
    ORDER BY condition
  `);
  
  console.log('\n📊 After fix:');
  console.table(afterCounts.rows);

  // Verify no more mismatches
  const verifyMismatches = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM car_listing
    WHERE 
      (mileage < 5000 AND condition != 'new')
      OR 
      (mileage >= 5000 AND condition != 'used')
  `);
  
  const remainingMismatches = Number(verifyMismatches.rows[0]?.count || 0);
  if (remainingMismatches === 0) {
    console.log('\n✅ Backfill complete! All conditions now match mileage.');
  } else {
    console.log(`\n⚠️ Warning: ${remainingMismatches} mismatches remain. Please investigate.`);
  }
}

backfillCondition()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  });
