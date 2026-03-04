/**
 * Fix Stuck Partner Request
 * 
 * This script fixes partner requests that were approved but failed to create
 * a partner record (bug where slug was missing from the insert).
 * 
 * Run with: bun packages/database/src/fix-stuck-partner-request.ts <email>
 */

import { db } from './dbclient';
import { partnerRequest, user, partner, partnerStaff } from './schema';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

const email = process.argv[2];

if (!email) {
  console.error('Usage: bun packages/database/src/fix-stuck-partner-request.ts <email>');
  process.exit(1);
}

// Slug generator
function generatePartnerSlug(companyName: string, partnerId: string): string {
  const baseSlug = companyName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const shortId = partnerId.slice(-6);
  return `${baseSlug}-${shortId}`;
}

async function fixStuckRequest() {
  console.log(`\n🔍 Looking up user: ${email}\n`);
  
  // Find user by email
  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  
  if (!foundUser) {
    console.error(`❌ User not found with email: ${email}`);
    process.exit(1);
  }
  
  console.log(`✓ Found user: ${foundUser.name || foundUser.email} (ID: ${foundUser.id})`);
  
  // Find their partner request
  const [request] = await db
    .select()
    .from(partnerRequest)
    .where(eq(partnerRequest.userId, foundUser.id))
    .limit(1);
  
  if (!request) {
    console.log(`ℹ️ No partner request found for this user`);
    process.exit(0);
  }
  
  console.log(`\n📋 Partner Request Found:`);
  console.log(`   ID: ${request.id}`);
  console.log(`   Status: ${request.status}`);
  console.log(`   Company: ${request.companyNameLegal}`);
  console.log(`   Partner ID: ${request.partnerId || '(none)'}`);
  console.log(`   Created: ${request.createdAt}`);
  console.log(`   Reviewed: ${request.reviewedAt || '(not reviewed)'}\n`);
  
  // Check if they have a partner record
  if (request.partnerId) {
    const [existingPartner] = await db
      .select()
      .from(partner)
      .where(eq(partner.id, request.partnerId))
      .limit(1);
    
    if (existingPartner) {
      console.log(`✓ Partner record exists (ID: ${existingPartner.id}, Slug: ${existingPartner.slug})`);
      console.log(`ℹ️ No fix needed - partner is already set up`);
      process.exit(0);
    } else {
      console.log(`⚠️ partnerId is set on request but partner record doesn't exist`);
    }
  }
  
  // Check if request is approved but no partner was created
  if (request.status === 'approved' && !request.partnerId) {
    console.log(`\n🔧 ISSUE DETECTED: Request approved but no partner created`);
    console.log(`   This is the bug where slug was missing from partner insert.\n`);
    
    // Options
    console.log(`Choose fix option:`);
    console.log(`  1. Reset request to 'pending' (admin can re-approve)`);
    console.log(`  2. Delete request (user can re-apply)`);
    console.log(`  3. Create partner now (fix forward)\n`);
    
    // For non-interactive, let's do option 1 by default (safest)
    console.log(`Applying option 1: Resetting to pending...\n`);
    
    const [updated] = await db
      .update(partnerRequest)
      .set({
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(partnerRequest.id, request.id))
      .returning();
    
    if (updated) {
      console.log(`✅ Success! Partner request reset to 'pending'`);
      console.log(`   Admin can now re-approve with the fixed code that includes slug generation.`);
    } else {
      console.error(`❌ Failed to update request`);
    }
  } else if (request.status === 'pending') {
    console.log(`ℹ️ Request is pending - no fix needed`);
  } else if (request.status === 'rejected') {
    console.log(`ℹ️ Request was rejected - user can delete and resubmit`);
  } else {
    console.log(`ℹ️ Request status: ${request.status} - no automatic fix available`);
  }
}

fixStuckRequest()
  .catch(console.error)
  .finally(() => process.exit(0));
