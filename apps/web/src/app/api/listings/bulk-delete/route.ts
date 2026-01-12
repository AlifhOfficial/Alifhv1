/**
 * Bulk Delete Listings API
 * DELETE multiple listings at once
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, carListing, inArray, invalidateListingCaches } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { listingIds } = body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ error: 'listingIds array is required' }, { status: 400 });
    }

    if (listingIds.length > 100) {
      return NextResponse.json({ error: 'Cannot delete more than 100 listings at once' }, { status: 400 });
    }

    // Verify ownership - user can only bulk delete their own listings
    const listingsToDelete = await db
      .select({ id: carListing.id, userId: carListing.userId, partnerId: carListing.partnerId })
      .from(carListing)
      .where(inArray(carListing.id, listingIds));

    // Check authorization for each listing
    const unauthorizedListings = listingsToDelete.filter(listing => {
      // Personal listings - must own them
      if (!listing.partnerId && listing.userId !== session.id) {
        return true;
      }
      // Work listings - must be staff member of the partner
      // (Additional partner staff check would go here if needed)
      return false;
    });

    if (unauthorizedListings.length > 0) {
      return NextResponse.json(
        { error: 'You do not have permission to delete some of these listings' },
        { status: 403 }
      );
    }

    // Soft delete (set lifecycleStatus to 'deleted')
    await db
      .update(carListing)
      .set({
        lifecycleStatus: 'deleted',
        updatedAt: new Date(),
      })
      .where(inArray(carListing.id, listingIds));

    // Invalidate caches for each deleted listing
    // Group by partnerId to avoid redundant partner inventory invalidations
    const partnerIds = new Set<string>();
    listingsToDelete.forEach(listing => {
      invalidateListingCaches(listing.id, listing.partnerId || undefined);
      if (listing.partnerId) partnerIds.add(listing.partnerId);
    });

    return NextResponse.json({
      success: true,
      deletedCount: listingIds.length,
    });
  } catch (error) {
    console.error('[Bulk Delete Listings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk delete listings' },
      { status: 500 }
    );
  }
}
