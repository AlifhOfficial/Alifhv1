/**
 * Delete User Script
 * 
 * Deletes a user and all associated data from the database.
 * CASCADE deletes will handle most related records automatically.
 * 
 * Usage:
 *   cd packages/database
 *   bun run src/scripts/delete-user.ts --email=noor@alifh.ae --dry-run
 *   bun run src/scripts/delete-user.ts --email=noor@alifh.ae --execute
 */

import { config } from 'dotenv';
config({ path: '../../.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../schema';

const { 
  user, session, account, passkey, userProfile, kycRecord, 
  userFavorite, userSuperlike, userSuperlikeQuota, 
  pushDeviceToken, pushNotificationPreferences, notification,
  carListing, vinPublicationHistory, listingView, listingPriceHistory,
  booking, feedback, conversation, conversationParticipant, message,
  partnerStaff
} = schema;

async function main() {
  // Parse args
  const emailArg = process.argv.find(arg => arg.startsWith('--email='));
  const email = emailArg?.split('=')[1];
  const isDryRun = !process.argv.includes('--execute');

  if (!email) {
    console.error('Usage: bun run src/scripts/delete-user.ts --email=user@example.com [--dry-run|--execute]');
    process.exit(1);
  }

  console.log(`\n=== Delete User Script ===`);
  console.log(`Email: ${email}`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'EXECUTE (deleting data)'}\n`);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Create .env.local with DATABASE_URL.');
    process.exit(1);
  }

  const sql_client = neon(process.env.DATABASE_URL);
  const db = drizzle(sql_client, { schema });

  // Find the user
  const [targetUser] = await db.select().from(user).where(eq(user.email, email));

  if (!targetUser) {
    console.error(`❌ User with email "${email}" not found.`);
    process.exit(1);
  }

  console.log(`Found user:`);
  console.log(`  ID: ${targetUser.id}`);
  console.log(`  Name: ${targetUser.name}`);
  console.log(`  Email: ${targetUser.email}`);
  console.log(`  Created: ${targetUser.createdAt}`);
  console.log();

  const userId = targetUser.id;

  // Count related data for preview
  console.log(`Related data to be deleted:`);
  
  const [sessionCount] = await db.select({ count: sql<number>`count(*)` }).from(session).where(eq(session.userId, userId));
  console.log(`  - Sessions: ${sessionCount?.count || 0}`);

  const [accountCount] = await db.select({ count: sql<number>`count(*)` }).from(account).where(eq(account.userId, userId));
  console.log(`  - Accounts: ${accountCount?.count || 0}`);

  const [passkeyCount] = await db.select({ count: sql<number>`count(*)` }).from(passkey).where(eq(passkey.userId, userId));
  console.log(`  - Passkeys: ${passkeyCount?.count || 0}`);

  const [profileCount] = await db.select({ count: sql<number>`count(*)` }).from(userProfile).where(eq(userProfile.userId, userId));
  console.log(`  - Profile: ${profileCount?.count || 0}`);

  const [kycCount] = await db.select({ count: sql<number>`count(*)` }).from(kycRecord).where(eq(kycRecord.userId, userId));
  console.log(`  - KYC Records: ${kycCount?.count || 0}`);

  const [favoriteCount] = await db.select({ count: sql<number>`count(*)` }).from(userFavorite).where(eq(userFavorite.userId, userId));
  console.log(`  - Favorites: ${favoriteCount?.count || 0}`);

  const [superlikeCount] = await db.select({ count: sql<number>`count(*)` }).from(userSuperlike).where(eq(userSuperlike.userId, userId));
  console.log(`  - Superlikes: ${superlikeCount?.count || 0}`);

  const [quotaCount] = await db.select({ count: sql<number>`count(*)` }).from(userSuperlikeQuota).where(eq(userSuperlikeQuota.userId, userId));
  console.log(`  - Superlike Quota: ${quotaCount?.count || 0}`);

  const [deviceCount] = await db.select({ count: sql<number>`count(*)` }).from(pushDeviceToken).where(eq(pushDeviceToken.userId, userId));
  console.log(`  - Device Tokens: ${deviceCount?.count || 0}`);

  const [prefCount] = await db.select({ count: sql<number>`count(*)` }).from(pushNotificationPreferences).where(eq(pushNotificationPreferences.userId, userId));
  console.log(`  - Notification Preferences: ${prefCount?.count || 0}`);

  const [notifCount] = await db.select({ count: sql<number>`count(*)` }).from(notification).where(eq(notification.userId, userId));
  console.log(`  - Notifications: ${notifCount?.count || 0}`);

  const [listingCount] = await db.select({ count: sql<number>`count(*)` }).from(carListing).where(eq(carListing.userId, userId));
  console.log(`  - Car Listings: ${listingCount?.count || 0}`);

  const [vinHistoryCount] = await db.select({ count: sql<number>`count(*)` }).from(vinPublicationHistory).where(eq(vinPublicationHistory.userId, userId));
  console.log(`  - VIN Publication History: ${vinHistoryCount?.count || 0}`);

  const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(booking).where(eq(booking.userId, userId));
  console.log(`  - Bookings: ${bookingCount?.count || 0}`);

  const [feedbackCount] = await db.select({ count: sql<number>`count(*)` }).from(feedback).where(eq(feedback.userId, userId));
  console.log(`  - Feedback: ${feedbackCount?.count || 0}`);

  const [conversationCount] = await db.select({ count: sql<number>`count(*)` }).from(conversation).where(eq(conversation.initiatedBy, userId));
  console.log(`  - Conversations (initiated): ${conversationCount?.count || 0}`);

  const [participantCount] = await db.select({ count: sql<number>`count(*)` }).from(conversationParticipant).where(eq(conversationParticipant.userId, userId));
  console.log(`  - Conversation Participations: ${participantCount?.count || 0}`);

  const [messageCount] = await db.select({ count: sql<number>`count(*)` }).from(message).where(eq(message.senderId, userId));
  console.log(`  - Messages (sent): ${messageCount?.count || 0}`);

  const [staffCount] = await db.select({ count: sql<number>`count(*)` }).from(partnerStaff).where(eq(partnerStaff.userId, userId));
  console.log(`  - Partner Staff Records: ${staffCount?.count || 0}`);

  console.log();

  if (isDryRun) {
    console.log(`🔍 DRY RUN - No changes made.`);
    console.log(`   Run with --execute to delete this user and all related data.`);
    process.exit(0);
  }

  // Execute deletion
  console.log(`⚠️  DELETING USER AND ALL RELATED DATA...`);
  console.log();

  // Delete the user - CASCADE will handle most relations
  const result = await db.delete(user).where(eq(user.id, userId));
  
  console.log(`✅ User "${email}" and all related data deleted successfully.`);
  console.log(`\nCASCADE deletes automatically removed:`);
  console.log(`  - Sessions, Accounts, Passkeys`);
  console.log(`  - Profile, KYC Records`);
  console.log(`  - Favorites, Superlikes, Quotas`);
  console.log(`  - Device Tokens, Notification Preferences, Notifications`);
  console.log(`  - Car Listings (and their price history, views)`);
  console.log(`  - VIN Publication History`);
  console.log(`  - Bookings, Feedback`);
  console.log(`  - Conversations (initiated), Conversation Participations`);
  console.log(`  - Messages, Partner Staff Records`);
  console.log(`\nReferences SET NULL:`);
  console.log(`  - listing_view.userId, listing_price_history.changedBy`);
  console.log(`  - car_listing.reservedBy, car_listing.soldTo`);
  console.log(`  - booking.confirmedBy, notification.actorId`);
  console.log(`  - partner.verifiedBy, partner.approvedBy, partner.accountManagerId`);
  console.log(`  - feedback.reviewedBy, conversation.lastMessageSenderId`);
}

main().catch(console.error);
