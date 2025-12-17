/**
 * Get Listing with Partner and Staff
 * Complete listing page data combining all necessary info
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { carListing } from '../../schema/listing';

/**
 * Get listing with partner and staff details
 * For full listing page - combines all necessary info
 */
export async function getListingWithPartnerAndStaff(listingId: string) {
  const listing = await db.query.carListing.findFirst({
    where: eq(carListing.id, listingId),
    with: {
      partner: {
        columns: {
          id: true,
          brandName: true,
          logo: true,
          emirate: true,
          city: true,
          address: true,
          locationLat: true,
          locationLng: true,
          phone: true,
          email: true,
          website: true,
          googleRating: true,
          googleReviewCount: true,
          platformRating: true,
          avgResponseTime: true,
          responseRate: true,
          isVerified: true,
          badges: true,
          businessHours: true,
          features: true,
        },
      },
      postedByStaff: {
        columns: {
          id: true,
          title: true,
          department: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return listing;
}
