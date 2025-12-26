import { db, carListing, userProfile, partnerConsignmentPreference, consignmentLead, user } from '@alifh/database';
import { eq, and, sql } from 'drizzle-orm';
import { notifyNewConsignmentLead } from './notifications';

/**
 * Automatically match a listing against partner preferences
 * Called when a listing becomes public
 * 
 * This checks the user's consignmentMode preference and applies it to the listing
 */
export async function autoMatchConsignment(listingId: string) {
  try {
    // Get listing with user profile using joins for proper type inference
    const result = await db
      .select({
        listing: carListing,
        consignmentMode: userProfile.consignmentMode,
      })
      .from(carListing)
      .leftJoin(user, eq(carListing.userId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(carListing.id, listingId))
      .limit(1);

    if (!result || result.length === 0 || !result[0].listing) {
      console.log('[Consignment] Listing not found');
      return { success: false, matched: 0 };
    }

    const { listing, consignmentMode } = result[0];

    // Check if user has consignment mode enabled
    const hasConsignmentMode = consignmentMode ?? false;

    const isPublic =
      listing.moderationStatus === 'approved' &&
      listing.lifecycleStatus === 'active' &&
      !!listing.expiresAt &&
      new Date(listing.expiresAt).getTime() > Date.now();

    // Update listing's openToConsignment based on user preference
    await db
      .update(carListing)
      .set({
        openToConsignment: hasConsignmentMode,
        updatedAt: new Date(),
      })
      .where(eq(carListing.id, listingId));

    // If consignment is enabled and listing is published, match with partners
    if (hasConsignmentMode && isPublic) {
      const matchedCount = await matchWithPartners(listing);
      console.log(`[Consignment] Matched listing ${listingId} with ${matchedCount} partners`);
      return { success: true, matched: matchedCount };
    }

    return { success: true, matched: 0 };
  } catch (error) {
    console.error('[Consignment] Auto-match error:', error);
    return { success: false, matched: 0, error };
  }
}

/**
 * Match a listing with all eligible partner preferences
 */
async function matchWithPartners(listing: typeof carListing.$inferSelect): Promise<number> {
  // Get all enabled partner preferences
  const preferences = await db.query.partnerConsignmentPreference.findMany({
    where: eq(partnerConsignmentPreference.isEnabled, true),
  });

  if (preferences.length === 0) {
    return 0;
  }

  let matchedCount = 0;
  const now = new Date();

  for (const pref of preferences) {
    const isMatch = checkListingMatch(listing, pref);

    if (isMatch) {
      // Check if lead already exists
      const existingLead = await db.query.consignmentLead.findFirst({
        where: and(
          eq(consignmentLead.partnerId, pref.partnerId),
          eq(consignmentLead.listingId, listing.id)
        ),
      });

      // Create lead if doesn't exist
      if (!existingLead) {
        const leadId = crypto.randomUUID();
        
        await db.insert(consignmentLead).values({
          id: leadId,
          partnerId: pref.partnerId,
          userId: listing.userId!,
          listingId: listing.id,
          status: 'new',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          createdAt: now,
          updatedAt: now,
        });

        // Update preference stats
        await db
          .update(partnerConsignmentPreference)
          .set({
            totalLeadsReceived: sql`${partnerConsignmentPreference.totalLeadsReceived} + 1`,
            lastLeadReceivedAt: now,
            updatedAt: now,
          })
          .where(eq(partnerConsignmentPreference.id, pref.id));

        matchedCount++;

        // 🔥 Send real-time notification to partner staff
        notifyNewConsignmentLead(pref.partnerId, {
          leadId,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          price: listing.price,
        }).catch(err => {
          console.error('[Consignment] Notification failed:', err);
        });
      }
    }
  }

  return matchedCount;
}

/**
 * Check if a listing matches partner's consignment criteria
 */
function checkListingMatch(
  listing: typeof carListing.$inferSelect,
  preference: typeof partnerConsignmentPreference.$inferSelect
): boolean {
  // Make filter
  if (preference.makes && (preference.makes as string[]).length > 0) {
    if (!(preference.makes as string[]).includes(listing.make)) {
      return false;
    }
  }

  // Model filter
  if (preference.models && (preference.models as string[]).length > 0) {
    if (!listing.model || !(preference.models as string[]).includes(listing.model)) {
      return false;
    }
  }

  // Body type filter
  if (preference.bodyTypes && (preference.bodyTypes as string[]).length > 0) {
    if (!listing.bodyType || !(preference.bodyTypes as string[]).includes(listing.bodyType)) {
      return false;
    }
  }

  // Fuel type filter
  if (preference.fuelTypes && (preference.fuelTypes as string[]).length > 0) {
    if (!listing.fuelType || !(preference.fuelTypes as string[]).includes(listing.fuelType)) {
      return false;
    }
  }

  // Year range filter
  if (preference.minYear && listing.year < preference.minYear) {
    return false;
  }
  if (preference.maxYear && listing.year > preference.maxYear) {
    return false;
  }

  // Price range filter (price is in AED cents)
  if (preference.minPrice && listing.price < preference.minPrice) {
    return false;
  }
  if (preference.maxPrice && listing.price > preference.maxPrice) {
    return false;
  }

  // Mileage filter
  if (preference.maxMileage && listing.mileage > preference.maxMileage) {
    return false;
  }

  // Emirates filter
  if (preference.emirates && (preference.emirates as string[]).length > 0) {
    if (!(preference.emirates as string[]).includes(listing.emirate)) {
      return false;
    }
  }

  // Specs filter
  if (preference.preferredSpecs && (preference.preferredSpecs as string[]).length > 0) {
    if (!listing.specs || !(preference.preferredSpecs as string[]).includes(listing.specs)) {
      return false;
    }
  }

  // Accident-free filter
  if (preference.excludeAccidents) {
    const specialNotes = listing.specialNotes as { accidentFree?: boolean } | null;
    if (!specialNotes?.accidentFree) {
      return false;
    }
  }

  // All filters passed
  return true;
}
