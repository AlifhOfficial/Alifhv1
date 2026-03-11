/**
 * Partner Bookings Dashboard Page
 * Shows all bookings for the partner's dealership with staff filtering
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { PartnerBookingsClient } from '@/components/features/bookings/partner/partner-bookings-client';
import { getBookings, getPartnerStaff, type BookingStatus } from '@alifh/database';

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show';

const VALID_STATUSES: StatusFilter[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show'];
const STATUS_MAP: Record<Exclude<StatusFilter, 'all'>, BookingStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  rejected: 'rejected',
  no_show: 'no_show',
};

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerBookingsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/bookings');
  }

  const partnerMembership = (user as any).partnerMemberships?.[0];
  
  if (!partnerMembership) {
    redirect('/partner-dashboard');
  }

  const params = await searchParams;
  const rawStatus = getSingle(params.status);
  const rawPage = Number(getSingle(params.page) || '1');
  const staffUserId = getSingle(params.staffUserId);
  const q = getSingle(params.q)?.trim() || '';
  const status: StatusFilter = rawStatus && VALID_STATUSES.includes(rawStatus as StatusFilter)
    ? rawStatus as StatusFilter
    : 'all';
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const [bookingsResult, staff] = await Promise.all([
    getBookings({
      partnerId: partnerMembership.partnerId,
      staffUserId: staffUserId && staffUserId !== 'all' ? staffUserId : undefined,
      status: status === 'all' ? undefined : [STATUS_MAP[status]],
      q: q || undefined,
      includeStats: true,
      includePartnerSettings: true,
      limit,
      offset,
    }),
    getPartnerStaff(partnerMembership.partnerId),
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

  return (
    <PartnerBookingsClient
      partnerId={partnerMembership.partnerId}
      partnerName={partnerMembership.partnerName}
      initialTeamMembers={initialTeamMembers}
      initialData={{
        bookings: bookingsResult.bookings as any[],
        total: bookingsResult.total,
        stats: bookingsResult.stats as any,
      }}
      filters={{
        status,
        page,
        q,
        staffUserId: staffUserId && staffUserId !== 'all' ? staffUserId : 'all',
      }}
    />
  );
}
