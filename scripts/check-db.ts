#!/usr/bin/env bun

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
const sql = neon(process.env.DATABASE_URL!);

console.log('🔍 Checking database state...\n');

try {
  // Check users with partner info
  const users = await sql`
    SELECT id, name, email, "platformRole", status, "activePartnerId"
    FROM users 
    ORDER BY "createdAt"
  `;

  console.log('👥 Users:');
  console.table(users);

  // Check partners
  const partners = await sql`
    SELECT id, name, slug, status
    FROM partners 
    ORDER BY created_at
  `;

  console.log('\n🏢 Partners:');
  console.table(partners);

  // Check memberships with details
  const memberships = await sql`
    SELECT 
      pm.id,
      u.name as user_name, 
      u.email, 
      p.name as partner_name, 
      pm.role, 
      pm.is_active,
      u."activePartnerId"
    FROM partner_members pm
    JOIN users u ON pm.user_id = u.id
    JOIN partners p ON pm.partner_id = p.id
    ORDER BY pm.created_at
  `;

  console.log('\n👥 Partner Memberships:');
  console.table(memberships);

  // Check for any mismatch
  console.log('\n🔍 Checking for data consistency issues...');
  
  const inconsistencies = await sql`
    SELECT 
      u.name,
      u.email,
      u."activePartnerId",
      CASE WHEN pm.user_id IS NULL THEN 'NO_MEMBERSHIP' ELSE 'HAS_MEMBERSHIP' END as membership_status
    FROM users u
    LEFT JOIN partner_members pm ON u.id = pm.user_id AND pm.is_active = true
    WHERE u."activePartnerId" IS NOT NULL
  `;

  console.log('\n⚠️ Users with activePartnerId:');
  console.table(inconsistencies);

} catch (error) {
  console.error('❌ Database check failed:', error);
}