/**
 * Partner Showroom Editor Page
 * Black tier exclusive - premium brand manifesto editor
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getSessionUser } from '@/lib/auth/session-context';
import { createShowroom, getShowroomByPartnerId } from '@alifh/database';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';

const PartnerShowroomForm = dynamic(
  () => import('@/components/partner/car-dealer/partner-showroom-form').then(mod => mod.PartnerShowroomForm)
);

function serializeShowroomDates(showroom: Awaited<ReturnType<typeof getShowroomByPartnerId>> extends infer T ? Exclude<T, null> : never): PartnerShowroom {
  return {
    ...showroom,
    publishedAt: showroom.publishedAt?.toISOString() ?? null,
    lastEditedAt: showroom.lastEditedAt?.toISOString() ?? null,
    createdAt: showroom.createdAt.toISOString(),
    updatedAt: showroom.updatedAt.toISOString(),
  };
}

export default async function PartnerShowroomPage() {
  const user = await getSessionUser();
  
  if (!user) redirect('/?auth=signin');

  // Get the first active Black tier partner membership
  const membership = (user as any).partnerMemberships?.find(
    (m: any) => m.partnerTier === 'black' && ['owner', 'admin'].includes(m.staffRole)
  );

  if (!membership) {
    redirect('/partner-dashboard');
  }

  const initialShowroom =
    (await getShowroomByPartnerId(membership.partnerId)) ??
    (await createShowroom({ partnerId: membership.partnerId }));

  return (
    <PartnerShowroomForm
      partnerId={membership.partnerId}
      initialShowroom={serializeShowroomDates(initialShowroom)}
    />
  );
}
