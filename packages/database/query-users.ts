import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { users, partners, partnerMembers } from './src/auth/schema';
import { eq, sql } from 'drizzle-orm';

// Load environment variables
config({ path: '../../.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = neon(connectionString);
const db = drizzle(client);

async function getAllUsersWithPermissions() {
  console.log('🔍 Fetching all users and their permissions...\n');

  try {
    // Get all users
    const allUsers = await db.select().from(users);
    
    console.log(`📊 Found ${allUsers.length} total users\n`);
    console.log('=' .repeat(80));

    for (const user of allUsers) {
      console.log(`👤 User: ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Platform Role: ${user.platformRole.toUpperCase()}`);
      console.log(`   Status: ${user.status.toUpperCase()}`);
      console.log(`   Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Active Partner: ${user.activePartnerId || '❌ None'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);

      // Get partner memberships
      const partnerMemberships = await db
        .select({
          partnerId: partnerMembers.partnerId,
          partnerName: partners.name,
          partnerSlug: partners.slug,
          role: partnerMembers.role,
          isActive: partnerMembers.isActive,
          partnerStatus: partners.status,
        })
        .from(partnerMembers)
        .leftJoin(partners, eq(partnerMembers.partnerId, partners.id))
        .where(eq(partnerMembers.userId, user.id));

      if (partnerMemberships.length > 0) {
        console.log(`   🏢 Partner Memberships:`);
        for (const membership of partnerMemberships) {
          const activeStatus = membership.isActive ? '✅ Active' : '❌ Inactive';
          console.log(`      - ${membership.partnerName} (${membership.partnerSlug})`);
          console.log(`        Role: ${membership.role.toUpperCase()}`);
          console.log(`        Status: ${activeStatus}`);
          console.log(`        Partner Status: ${membership.partnerStatus?.toUpperCase() || 'N/A'}`);
        }
      } else {
        console.log(`   🏢 Partner Memberships: ❌ None`);
      }

      console.log('   ' + '-'.repeat(60));
    }

    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS');
    console.log('=' .repeat(80));

    const platformRoleStats = await db
      .select({
        role: users.platformRole,
        count: sql<number>`count(*)::int`
      })
      .from(users)
      .groupBy(users.platformRole);

    console.log('Platform Role Distribution:');
    for (const stat of platformRoleStats) {
      console.log(`  ${stat.role.toUpperCase()}: ${stat.count} users`);
    }

    const statusStats = await db
      .select({
        status: users.status,
        count: sql<number>`count(*)::int`
      })
      .from(users)
      .groupBy(users.status);

    console.log('\nUser Status Distribution:');
    for (const stat of statusStats) {
      console.log(`  ${stat.status.toUpperCase()}: ${stat.count} users`);
    }

    // Partner statistics
    const allPartners = await db.select().from(partners);
    console.log(`\n🏢 Total Partners: ${allPartners.length}`);

    const partnerRoleStats = await db
      .select({
        role: partnerMembers.role,
        count: sql<number>`count(*)::int`
      })
      .from(partnerMembers)
      .where(eq(partnerMembers.isActive, true))
      .groupBy(partnerMembers.role);

    console.log('\nActive Partner Role Distribution:');
    for (const stat of partnerRoleStats) {
      console.log(`  ${stat.role.toUpperCase()}: ${stat.count} memberships`);
    }

  } catch (error) {
    console.error('❌ Error fetching users:', error);
  }
}

// Run the query
getAllUsersWithPermissions().then(() => {
  console.log('\n✅ Query completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});