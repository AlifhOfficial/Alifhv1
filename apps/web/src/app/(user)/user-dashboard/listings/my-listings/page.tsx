/**
 * My Listings Page - Revvup Design System
 * User's personal car listings management
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { getListingsByUserId, getListingStatsByUserId, expirePublishedListingsForUser } from '@alifh/database';
import { MyListingsView } from '@/components/listings/my-listings';
import type { ListingStats as MyListingsStats } from '@/components/listings/my-listings';
import type { ListingsSort } from '@/components/listings/my-listings';

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

type ListingStatus = 'all' | 'active' | 'public' | 'in_review' | 'draft' | 'rejected' | 'archived' | 'sold' | 'expired' | 'suspended' | 'deleted';

const VALID_STATUSES: ListingStatus[] = ['all', 'active', 'public', 'in_review', 'draft', 'rejected', 'archived', 'sold', 'expired', 'suspended', 'deleted'];
const VALID_SORTS: ListingsSort[] = ['newest', 'oldest', 'updated', 'expiring'];

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MyListingsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;
  const params = await searchParams;
  const rawStatus = getSingle(params.status);
  const rawSort = getSingle(params.sort);
  const rawPage = Number(getSingle(params.page) || '1');
  const q = getSingle(params.q)?.trim() || '';

  const status: ListingStatus = rawStatus && VALID_STATUSES.includes(rawStatus as ListingStatus)
    ? rawStatus as ListingStatus
    : 'active';
  const sort: ListingsSort = rawSort && VALID_SORTS.includes(rawSort as ListingsSort)
    ? rawSort as ListingsSort
    : 'newest';
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  // Fire and forget: expire stale listings
  expirePublishedListingsForUser(user.id).catch(() => {});

  const [listingsResult, stats] = await Promise.all([
    getListingsByUserId(user.id, {
      status,
      listingType: 'personal',
      q: q || undefined,
      sort,
      limit,
      offset,
    }),
    getListingStatsByUserId(user.id, { listingType: 'personal' }),
  ]);

  const initialStats: MyListingsStats = {
    ...stats,
    deepInventory:
      (stats.archived ?? 0) +
      (stats.suspended ?? 0) +
      (stats.sold ?? 0) +
      (stats.expired ?? 0) +
      (stats.deleted ?? 0),
  };

  return (
    <MyListingsView
      userId={user.id}
      listingType="personal"
      filters={{ status, sort, page, q }}
      initialData={{
        listings: listingsResult.listings as any[],
        total: listingsResult.total,
        stats: initialStats,
      }}
    />
  );
}
