/**
 * Partner Inventory Page
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { DealerInventory } from "@/components/inventory";
import {
  getListingStatsByPartnerId,
  getListingsByPartnerId,
  getPartnerBlackListingsQuota,
  getPartnerStaff,
} from '@alifh/database';

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

type StatusTab = 'active' | 'sold' | 'archived' | 'expired' | 'all';

const VALID_STATUSES: StatusTab[] = ['active', 'sold', 'archived', 'expired', 'all'];

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerInventoryPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  
  if (!user) redirect('/?auth=signin');

  // Get the first partner membership (if any)
  const membership = (user as any).partnerMemberships?.[0];

  if (!membership?.partnerId) {
    return (
      <DashboardDisplayArea>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-xl border border-border p-8 text-center">
            <h2 className="text-headline text-foreground mb-2">No Partner Access</h2>
            <p className="text-subhead text-muted-foreground">You need to be associated with a partner to manage inventory.</p>
          </div>
        </div>
      </DashboardDisplayArea>
    );
  }

  const params = await searchParams;
  const rawStatus = getSingle(params.status);
  const rawPage = Number(getSingle(params.page) || '1');
  const staffUserId = getSingle(params.staffUserId);
  const q = getSingle(params.q)?.trim() || '';
  const status: StatusTab = rawStatus && VALID_STATUSES.includes(rawStatus as StatusTab)
    ? rawStatus as StatusTab
    : 'active';
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  const [listingsResult, stats, staff, blackQuota] = await Promise.all([
    getListingsByPartnerId(membership.partnerId, {
      lifecycleStatus: status === 'all' ? undefined : status,
      userId: staffUserId && staffUserId !== 'all' ? staffUserId : undefined,
      q: q || undefined,
      limit,
      offset,
    }),
    getListingStatsByPartnerId(membership.partnerId),
    getPartnerStaff(membership.partnerId),
    getPartnerBlackListingsQuota(membership.partnerId),
  ]);

  const initialTeamMembers = staff
    .filter((member) => !member.isOwner && member.role !== 'owner')
    .map((member) => ({
      id: member.id,
      userId: member.userId,
      status: member.status,
      displayName: member.userName || member.userEmail || 'Unknown',
      username: member.userEmail?.split('@')[0] || '',
      avatar: member.userAvatar || null,
    }));

  const initialBlackQuota = blackQuota
    ? {
        partnerId: membership.partnerId,
        tier: blackQuota.tier,
        blackListingQuota: blackQuota.max,
        activeBlackListingsCount: blackQuota.used,
        hasAvailableSlots: blackQuota.remaining > 0,
      }
    : null;

  return (
    <DashboardDisplayArea>
      <DealerInventory
        partnerId={membership.partnerId}
        partnerName={membership.partnerName || "Partner"}
        partnerVerified={false}
        userRole={membership.staffRole}
        initialTeamMembers={initialTeamMembers}
        initialBlackQuota={initialBlackQuota}
        initialData={{
          listings: listingsResult.listings as any[],
          total: listingsResult.total,
          stats: stats as any,
        }}
        filters={{
          status,
          page,
          q,
          staffUserId: staffUserId && staffUserId !== 'all' ? staffUserId : 'all',
        }}
      />
    </DashboardDisplayArea>
  );
}
