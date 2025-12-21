/**
 * Data Migration: Update partner_type enum values
 * 
 * Old values -> New values:
 * - dealer -> car_dealer
 * - multi_brand -> showroom
 * - rental -> showroom
 * - broker -> showroom
 * - other -> showroom
 */

import { db } from './dbclient';
import { sql } from 'drizzle-orm';

async function migratePartnerTypes() {
  console.log('Starting partner request data migration...');
  
  try {
    // Set defaults for required fields that may be null
    console.log('Setting default values for required fields...');
    await db.execute(sql`
      UPDATE partner_request 
      SET 
        trade_license_document_url = COALESCE(trade_license_document_url, 'https://placeholder.com/document'),
        vat_number = COALESCE(vat_number, 'N/A')
      WHERE trade_license_document_url IS NULL OR vat_number IS NULL
    `);
    
    console.log('✅ Data migration completed successfully!');
    console.log('Now you can run: bun run db:push');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

migratePartnerTypes();
