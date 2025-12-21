/**
 * Apply Schema Changes Manually
 * This applies the partner_request schema changes step by step
 */

import { db } from './dbclient';
import { sql } from 'drizzle-orm';

async function applySchemaChanges() {
  console.log('Starting schema migration...');
  
  try {
    // Step 1: Add company_size column with a default first
    console.log('1. Adding company_size column with default...');
    await db.execute(sql`
      ALTER TABLE partner_request 
      ADD COLUMN IF NOT EXISTS company_size text DEFAULT 'medium'
    `);
    
    // Step 2: Update existing rows to have valid enum value
    console.log('2. Setting company_size values for existing rows...');
    await db.execute(sql`
      UPDATE partner_request 
      SET company_size = 'medium' 
      WHERE company_size IS NULL
    `);
    
    // Step 3: Create the enum type if it doesn't exist
    console.log('3. Creating company_size enum...');
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_size') THEN
          CREATE TYPE company_size AS ENUM('small', 'medium', 'large', 'enterprise');
        END IF;
      END $$;
    `);
    
    // Step 4: Drop default before type conversion
    console.log('4. Removing default value...');
    await db.execute(sql`
      ALTER TABLE partner_request 
      ALTER COLUMN company_size DROP DEFAULT
    `);
    
    // Step 5: Convert column to use the enum
    console.log('5. Converting company_size to enum type...');
    await db.execute(sql`
      ALTER TABLE partner_request 
      ALTER COLUMN company_size TYPE company_size 
      USING company_size::company_size
    `);
    
    // Step 6: Set NOT NULL constraint
    console.log('6. Setting NOT NULL constraint...');
    await db.execute(sql`
      ALTER TABLE partner_request 
      ALTER COLUMN company_size SET NOT NULL
    `);
    
    // Step 7: Make trade_license_document_url and vat_number NOT NULL
    console.log('7. Setting NOT NULL on trade_license_document_url and vat_number...');
    await db.execute(sql`
      ALTER TABLE partner_request 
      ALTER COLUMN trade_license_document_url SET NOT NULL,
      ALTER COLUMN vat_number SET NOT NULL
    `);
    
    // Step 8: Drop unnecessary columns
    console.log('8. Dropping old columns...');
    await db.execute(sql`
      ALTER TABLE partner_request 
      DROP COLUMN IF EXISTS brand_name,
      DROP COLUMN IF EXISTS email,
      DROP COLUMN IF EXISTS phone,
      DROP COLUMN IF EXISTS website,
      DROP COLUMN IF EXISTS address,
      DROP COLUMN IF EXISTS emirate,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS experience_years,
      DROP COLUMN IF EXISTS specialties
    `);
    
    console.log('✅ Schema migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

applySchemaChanges();
