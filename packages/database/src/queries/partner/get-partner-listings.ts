/**
 * Get Partner Listings
 * Paginated listings for partner profile page
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../dbclient';
import { carListing } from '../../schema/listing';

/**
 * Partner Listings - For partner profile page listings section
 * Returns active listings with pagination
 */
export async function getPartnerListings(
  partnerId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: 'published' | 'reserved' | 'sold';
  } = {}
) {
  const { limit = 20, offset = 0, status = 'published' } = options;

  const listings = await db.query.carListing.findMany({
    where: and(
      eq(carListing.partnerId, partnerId),
      eq(carListing.status, status)
    ),
    limit,
    offset,
    orderBy: [desc(carListing.publishedAt)],
    columns: {
      id: true,
      make: true,
      model: true,
      year: true,
      trim: true,
      price: true,
      mileage: true,
      thumbnail: true,
      images: true,
      bodyType: true,
      fuelType: true,
      transmission: true,
      exteriorColor: true,
      status: true,
      isFeatured: true,
      viewCount: true,
      favouriteCount: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(carListing)
    .where(
      and(
        eq(carListing.partnerId, partnerId),
        eq(carListing.status, status)
      )
    );

  const total = totalResult[0]?.count ?? 0;

  return {
    listings,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Partner Listings with Staff Contact - For listing cards showing contact
 * Returns listings with staff who posted them
 */
export async function getPartnerListingsWithStaff(
  partnerId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
) {
  const { limit = 20, offset = 0 } = options;

  const listings = await db.query.carListing.findMany({
    where: and(
      eq(carListing.partnerId, partnerId),
      eq(carListing.status, 'published')
    ),
    limit,
    offset,
    orderBy: [desc(carListing.publishedAt)],
    columns: {
      id: true,
      make: true,
      model: true,
      year: true,
      price: true,
      thumbnail: true,
      postedByStaffId: true,
    },
    with: {
      postedByStaff: {
        columns: {
          id: true,
          title: true,
        },
        with: {
          user: {
            columns: {
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return listings;
}
