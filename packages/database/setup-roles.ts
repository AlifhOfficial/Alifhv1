/**
 * Setup Role-Based Test Users
 * 
 * Updates existing test users with proper partner memberships and roles
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables from root .env.local
config({ path: resolve(process.cwd(), '../../.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function setupRoleBasedUsers() {
  console.log('🎭 Setting up role-based test users...');
  
  try {
    // Get existing users and partners
    const users = await sql`SELECT id, email, platform_role FROM users`;
    const partners = await sql`SELECT id, name FROM partners`;
    
    console.log('👥 Found users:', users.map(u => `${u.email} (${u.platform_role})`));
    console.log('🏢 Found partners:', partners.map(p => p.name));
    
    // Find partner owner user
    const partnerOwner = users.find(u => u.email === 'partner@techcorp.com');
    const techCorpPartner = partners.find(p => p.name === 'TechCorp Solutions');
    
    if (partnerOwner && techCorpPartner) {
      // Update partner owner to have active partner membership
      await sql`
        UPDATE users 
        SET active_partner_id = ${techCorpPartner.id}, updated_at = now()
        WHERE id = ${partnerOwner.id}
      `;
      
      console.log(`✅ Set ${partnerOwner.email} as active partner for ${techCorpPartner.name}`);
    }
    
    // Verify the setup
    const updatedUsers = await sql`
      SELECT u.id, u.email, u.platform_role, u.active_partner_id, p.name as partner_name
      FROM users u
      LEFT JOIN partners p ON u.active_partner_id = p.id
      ORDER BY u.created_at
    `;
    
    console.log('\n🎯 Updated user access levels:');
    updatedUsers.forEach(user => {
      let accessType = 'Regular User (user portal only)';
      
      if (user.platform_role === 'super-admin') {
        accessType = 'Super Admin (all portals)';
      } else if (user.platform_role === 'admin') {
        accessType = 'Alifh Admin (user + admin portals)';
      } else if (user.platform_role === 'staff') {
        accessType = 'Alifh Staff (user + admin portals)';
      } else if (user.active_partner_id) {
        accessType = `Partner User (user + partner portals) - ${user.partner_name}`;
      }
      
      console.log(`  • ${user.email}: ${accessType}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up role-based users:', error);
  }
}

setupRoleBasedUsers();