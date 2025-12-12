#!/usr/bin/env bun

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
const sql = neon(process.env.DATABASE_URL!);

console.log('🧪 Testing partner role API logic...\n');

// Simulate the API call for Alice (partner owner)
const aliceEmail = 'alice@techcorp.com';

try {
  // Get user
  const [user] = await sql`
    SELECT id, name, email, "activePartnerId", "platformRole", status
    FROM users 
    WHERE email = ${aliceEmail}
  `;

  console.log('👤 User found:', user);

  if (user && user.activePartnerId) {
    // Get partner membership (simulate API)
    const [membership] = await sql`
      SELECT 
        pm.role,
        pm.is_active,
        pm.partner_id as "partnerId"
      FROM partner_members pm
      WHERE pm.user_id = ${user.id} AND pm.is_active = true
      LIMIT 1
    `;

    console.log('🏢 Membership found:', membership);

    console.log('\n🎯 Expected API Response:');
    console.log({
      partnerRole: membership?.role || null,
      partnerId: membership?.partnerId || null,
      isActive: membership?.is_active || false
    });

    console.log('\n🚀 Expected Dashboard Route:');
    if (membership?.role === 'owner') {
      console.log('→ /partner/owner-dashboard (GREEN)');
    } else if (membership?.role === 'admin') {
      console.log('→ /partner/admin-dashboard (YELLOW)');
    } else if (membership?.role === 'staff') {
      console.log('→ /partner/staff-dashboard (PINK)');
    } else {
      console.log('→ /user-dashboard (GREY) - fallback');
    }
  }

} catch (error) {
  console.error('❌ Test failed:', error);
}