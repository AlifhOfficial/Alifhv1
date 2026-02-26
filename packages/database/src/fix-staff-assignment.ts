import 'dotenv/config';
import { db } from './dbclient';
import { carListing } from './schema/listing';
import { partnerStaff } from './schema/partner';
import { user } from './schema';
import { eq, and } from 'drizzle-orm';

const TARGET_EMAIL = 'revvup.official@gmail.com';
const TARGET_PARTNER_ID = 'partner_jjy40ziwn13atjzm9iycp7m9';

async function fixStaffAssignment() {
  console.log('\n🔧 Fixing staff assignment for:', TARGET_EMAIL);
  
  // Get user
  const [targetUser] = await db.select().from(user).where(eq(user.email, TARGET_EMAIL));
  if (!targetUser) {
    console.error('User not found');
    process.exit(1);
  }
  console.log('User ID:', targetUser.id);
  
  // Get the correct staff membership
  const [staff] = await db.select().from(partnerStaff).where(
    and(
      eq(partnerStaff.userId, targetUser.id),
      eq(partnerStaff.partnerId, TARGET_PARTNER_ID),
      eq(partnerStaff.status, 'active')
    )
  );
  
  if (!staff) {
    console.error('Staff membership not found');
    process.exit(1);
  }
  console.log('Staff ID:', staff.id);
  console.log('Staff Role:', staff.role);
  
  // Check current listings for this partner
  const listings = await db.select({
    id: carListing.id,
    partnerId: carListing.partnerId,
    postedByStaffId: carListing.postedByStaffId,
  }).from(carListing).where(eq(carListing.partnerId, TARGET_PARTNER_ID));
  
  console.log('\nListings for partner:', listings.length);
  console.log('With correct staff ID:', listings.filter(l => l.postedByStaffId === staff.id).length);
  console.log('With wrong/null staff ID:', listings.filter(l => l.postedByStaffId !== staff.id).length);
  
  // Update all listings to use the correct staff ID
  await db.update(carListing)
    .set({ postedByStaffId: staff.id })
    .where(eq(carListing.partnerId, TARGET_PARTNER_ID));
  
  console.log('\n✅ Updated all listings with correct staff ID:', staff.id);
  
  // Verify
  const updatedListings = await db.select({
    id: carListing.id,
    postedByStaffId: carListing.postedByStaffId,
  }).from(carListing).where(eq(carListing.partnerId, TARGET_PARTNER_ID)).limit(5);
  
  console.log('\nSample updated listings:');
  updatedListings.forEach(l => console.log(`  ${l.id} -> staffId: ${l.postedByStaffId}`));
}

fixStaffAssignment()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
