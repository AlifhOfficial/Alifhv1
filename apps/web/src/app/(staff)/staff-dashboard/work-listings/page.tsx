/**
 * Staff Work Listings Page
 * Shows listings associated with a partner (work listings)
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { MyListingsView } from '@/components/listings/my-listings';
import { getListingsByPartnerId, getListingStatsByUserId, getPartnerBlackListingsQuota } from '@alifh/database';
import type { ListingStats as MyListingsStats, ListingsSort } from '@/components/listings/my-listings';

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

export default async function StaffWorkListingsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/?auth=signin');
  }

  const partnerId = user.partnerMemberships?.[0]?.partnerId;
  if (!partnerId) {
    redirect('/staff-dashboard');
  }

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

  const [listingsResult, stats, blackQuota] = await Promise.all([
    getListingsByPartnerId(partnerId, {
      status,
      userId: user.id,
      q: q || undefined,
      sort,
      limit,
      offset,
    }),
    getListingStatsByUserId(user.id, { listingType: 'work' }),
    getPartnerBlackListingsQuota(partnerId),
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
      listingType="work"
      filters={{ status, sort, page, q }}
      initialBlackQuota={blackQuota ? {
        partnerId,
        tier: blackQuota.tier,
        blackListingQuota: blackQuota.max,
        activeBlackListingsCount: blackQuota.used,
        hasAvailableSlots: blackQuota.remaining > 0,
      } : null}
      initialData={{
        listings: listingsResult.listings as any[],
        total: listingsResult.total,
        stats: initialStats,
      }}
    />
  );
}
