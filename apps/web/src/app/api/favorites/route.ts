import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  db,
  carListing,
  partner,
  getFavoriteStatusForListings,
  getSuperlikeQuotaForUser,
  getAllFavoritesForUser,
  toggleFavoriteForUser,
} from '@alifh/database';
import { inArray, eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const listingIdsParam = searchParams.get('listingIds');
    const listingIds = listingIdsParam
      ? listingIdsParam.split(',').map((id) => id.trim()).filter(Boolean)
      : undefined;

    // Fetch favorites and quota in parallel (removed redundant statuses query)
    const [allFavorites, quota] = await Promise.all([
      getAllFavoritesForUser(user.id),
      getSuperlikeQuotaForUser(user.id),
    ]);

    // Combine favorites and superlikes into single array with type
    const combinedFavorites = [
      ...allFavorites.favorites.map(f => ({ ...f, type: 'favorite' as const })),
      ...allFavorites.superlikes.map(s => ({ ...s, type: 'superlike' as const })),
    ];

    // Build statuses map from allFavorites data (no extra query needed)
    const favoriteSet = new Set(allFavorites.favorites.map(f => f.listingId));
    const superlikeSet = new Set(allFavorites.superlikes.map(s => s.listingId));
    const allListingIdsSet = new Set([...favoriteSet, ...superlikeSet]);
    
    const statuses: Record<string, { isFavorite: boolean; isSuperliked: boolean }> = {};
    allListingIdsSet.forEach(listingId => {
      statuses[listingId] = {
        isFavorite: favoriteSet.has(listingId),
        isSuperliked: superlikeSet.has(listingId),
      };
    });

    // If listingIds were provided, filter to those ids
    const filteredFavorites = listingIds
      ? combinedFavorites.filter((f) => listingIds.includes(f.listingId))
      : combinedFavorites;

    const uniqueListingIds = Array.from(new Set(filteredFavorites.map((f) => f.listingId)));
    
    // Optimized: Only fetch listings if needed, limit JOIN overhead
    const listings = uniqueListingIds.length > 0
      ? await db
          .select({
            id: carListing.id,
            make: carListing.make,
            model: carListing.model,
            year: carListing.year,
            trim: carListing.trim,
            price: carListing.price,
            mileage: carListing.mileage,
            emirate: carListing.emirate,
            specs: carListing.specs,
            thumbnail: carListing.thumbnail,
            images: carListing.images,
            qiScore: carListing.qiScore,
            partnerName: partner.brandName,
            partnerVerified: partner.isVerified,
            isBlackMember: carListing.isBlackMember,
          })
          .from(carListing)
          .leftJoin(partner, eq(carListing.partnerId, partner.id))
          .where(inArray(carListing.id, uniqueListingIds))
          .limit(100) // Safety limit
      : [];

    return NextResponse.json({ statuses, quota, favorites: filteredFavorites, listings });
  } catch (error) {
    console.error('[favorites] GET failed', error);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const listingId = payload?.listingId as string | undefined;
    const addedFrom = payload?.addedFrom as string | undefined;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const status = await toggleFavoriteForUser(user.id, listingId, addedFrom);
    const quota = await getSuperlikeQuotaForUser(user.id);

    return NextResponse.json({ status, quota });
  } catch (error) {
    console.error('[favorites] POST failed', error);
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
  }
}
