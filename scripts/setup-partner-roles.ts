/**
 * Simple Partner Setup Script
 * 
 * Based on the existing seed-better-auth.ts pattern
 * Creates partner organization and assigns membership for role testing
 */

import { db, users, partners, partnerMembers } from '../packages/database/src/index';
import { createId } from '@paralleldrive/cuid2';
import { config } from 'dotenv';
import { resolve } from 'path';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function setupPartnerRoles() {
  try {
    console.log('🏢 Setting up partner roles for testing...');
    
    // 1. Clean up existing partner data to avoid duplicates
    console.log('🧹 Cleaning existing partner data...');
    await db.delete(partnerMembers);
    await db.delete(partners);
    
    // Reset user active partner IDs
    await db.update(users).set({ activePartnerId: null });
    
    console.log('✅ Cleaned existing data');
    
    // 2. Find the partner user
    const partnerUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'partner@techcorp.com'))
      .limit(1);
    
    if (partnerUser.length === 0) {
      console.error('❌ Partner user not found. Run seed script first.');
      return;
    }
    
    console.log(`👤 Found partner user: ${partnerUser[0].email}`);
    
    // 3. Create TechCorp partner organization
    const partnerId = createId();
    const [newPartner] = await db.insert(partners).values({
      id: partnerId,
      name: 'TechCorp Solutions',
      slug: 'techcorp',
      email: 'info@techcorp.com',
      phone: '+971-50-123-4567',
      website: 'https://techcorp.com',
      description: 'Leading technology solutions provider - Partner organization for testing',
      status: 'active',
      createdBy: partnerUser[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    console.log('✅ Created TechCorp Solutions partner');
    
    // 4. Create partner membership (owner role)
    await db.insert(partnerMembers).values({
      id: createId(),
      userId: partnerUser[0].id,
      partnerId: partnerId,
      role: 'owner',
      isActive: true,
      invitedBy: partnerUser[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✅ Created partner membership');
    
    // 5. Set active partner for user
    await db
      .update(users)
      .set({ 
        activePartnerId: partnerId,
        updatedAt: new Date()
      })
      .where(eq(users.id, partnerUser[0].id));
    
    console.log('✅ Set active partner for user');
    
    // 6. Verify the setup
    const verification = await db
      .select({
        userName: users.name,
        userEmail: users.email,
        userPlatformRole: users.platformRole,
        partnerName: partners.name,
        partnerRole: partnerMembers.role,
        isActive: partnerMembers.isActive
      })
      .from(users)
      .leftJoin(partners, eq(users.activePartnerId, partners.id))
      .leftJoin(partnerMembers, eq(partnerMembers.userId, users.id))
      .where(eq(users.email, 'partner@techcorp.com'));
    
    console.log('\n🎯 Setup Complete!');
    console.log('📋 Partner Role Configuration:');
    if (verification.length > 0) {
      const data = verification[0];
      console.log(`  • User: ${data.userName} (${data.userEmail})`);
      console.log(`  • Platform Role: ${data.userPlatformRole}`);
      console.log(`  • Partner: ${data.partnerName}`);
      console.log(`  • Partner Role: ${data.partnerRole}`);
      console.log(`  • Status: ${data.isActive ? 'Active' : 'Inactive'}`);
    }
    
    console.log('\n✅ Role-based access testing ready!');
    console.log('🔐 Access Levels:');
    console.log('  • partner@techcorp.com → User Portal + Partner Portal');
    console.log('  • john@example.com → User Portal only');
    console.log('  • admin@alifh.ae → User Portal + Admin Portal');
    
  } catch (error) {
    console.error('❌ Error setting up partner roles:', error);
  }
}

setupPartnerRoles();