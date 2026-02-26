import 'dotenv/config';
import { db } from './dbclient';
import { carListing } from './schema/listing';
import { partnerStaff } from './schema/partner';
import { user } from './schema';
import { eq } from 'drizzle-orm';

async function debug() {
  // Find the user
  const [targetUser] = await db.select().from(user).where(eq(user.email, 'revvup.official@gmail.com'));
  console.log('User:', targetUser?.id, targetUser?.name);

  // Find their staff memberships
  const staffMemberships = await db.select().from(partnerStaff).where(eq(partnerStaff.userId, targetUser.id));
  console.log('Staff memberships:', staffMemberships.map(s => ({ id: s.id, partnerId: s.partnerId, role: s.role, status: s.status })));

  if (staffMemberships.length === 0) {
    console.log('No staff memberships found!');
    process.exit(1);
  }

  // Check listings for that partner
  const listings = await db.select({ 
    id: carListing.id, 
    partnerId: carListing.partnerId,
    postedByStaffId: carListing.postedByStaffId,
    make: carListing.make,
    model: carListing.model
  }).from(carListing).where(eq(carListing.partnerId, staffMemberships[0].partnerId)).limit(10);
  
  console.log('\nListings for partner:', staffMemberships[0].partnerId);
  console.log('Count:', listings.length);
  console.log('Sample:', listings.slice(0, 3));
  
  process.exit(0);
}

debug();
