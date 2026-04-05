/**
 * Partner Lead Funnels Page
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { PartnerLeadFunnelsView } from "@/components/partner/lead-funnels/partner-lead-funnels-view";
import { getAllPartnerFunnels, getPartnerFunnelStats, getPartnerFunnelStaff } from '@alifh/database';

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerLeadFunnelsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  
  if (!user) redirect('/?auth=signin');

  // Get the first partner membership (if any) - must be manager or owner
  const membership = (user as any).partnerMemberships?.find(
    (m: any) => m.staffRole === 'manager' || m.staffRole === 'owner'
  );

  if (!membership?.partnerId) {
    return (
      <DashboardDisplayArea>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-xl border border-border p-8 text-center">
            <h2 className="text-headline text-foreground mb-2">Manager Access Required</h2>
            <p className="text-subhead text-muted-foreground">Only managers and owners can view all lead funnels.</p>
          </div>
        </div>
      </DashboardDisplayArea>
    );
  }

  const params = await searchParams;
  const rawPage = Number(getSingle(params.page) || '1');
  const staffId = getSingle(params.staffId);
  const q = getSingle(params.q)?.trim() || '';
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const [funnels, stats, staffList] = await Promise.all([
    getAllPartnerFunnels(membership.partnerId, {
      staffId: staffId && staffId !== 'all' ? staffId : undefined,
      q: q || undefined,
      limit,
      offset,
    }),
    getPartnerFunnelStats(membership.partnerId),
    getPartnerFunnelStaff(membership.partnerId),
  ]);

  return (
    <DashboardDisplayArea>
      <PartnerLeadFunnelsView
        partnerId={membership.partnerId}
        partnerName={membership.partnerName || "Partner"}
        initialData={{
          funnels: funnels as any[],
          stats: stats as any,
          staffList: staffList as any[],
          total: stats.total,
        }}
        filters={{
          page,
          q,
          staffId: staffId && staffId !== 'all' ? staffId : 'all',
        }}
      />
    </DashboardDisplayArea>
  );
}
