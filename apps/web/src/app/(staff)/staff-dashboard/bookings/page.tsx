/**
 * Staff Bookings Dashboard Page
 * Shows bookings for listings posted by this staff member
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { getBookings, managePartnerSettings } from '@alifh/database';
import { StaffBookingsView } from '@/components/features/bookings/staff';
import type { AvailabilityRule, BookingData, BookingSettings } from '@/components/features/bookings/staff/types';

type SearchParams = Record<string, string | string[] | undefined>;
type BookingStatusFilter =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'no_show'
  | 'expired';

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatusFilter(status: string): BookingStatusFilter[] | undefined {
  if (status === 'all') return undefined;
  if (status === 'no_show') return ['no_show', 'expired'];
  switch (status) {
    case 'pending':
    case 'confirmed':
    case 'completed':
    case 'cancelled':
    case 'rejected':
    case 'expired':
      return [status];
    default:
      return ['confirmed'];
  }
}

export default async function StaffBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  const resolvedSearchParams = (await searchParams) ?? {};
  const statusParam = getFirstParam(resolvedSearchParams.status) ?? 'confirmed';
  const sortParam = getFirstParam(resolvedSearchParams.sort) === 'oldest' ? 'oldest' : 'newest';
  const pageParam = Math.max(1, Number.parseInt(getFirstParam(resolvedSearchParams.page) ?? '1', 10) || 1);
  const qParam = getFirstParam(resolvedSearchParams.q)?.trim() ?? '';
  const partnerId = user.partnerMemberships?.[0]?.partnerId;
  const ITEMS_PER_PAGE = 50;

  const [result, settingsResult] = await Promise.all([
    getBookings({
      partnerId,
      staffUserId: user.id,
      includeStats: true,
      sort: sortParam,
      status: getStatusFilter(statusParam),
      q: qParam || undefined,
      limit: ITEMS_PER_PAGE,
      offset: (pageParam - 1) * ITEMS_PER_PAGE,
    }),
    partnerId
      ? managePartnerSettings({
          partnerId,
          staffUserId: user.id,
          action: 'get',
        })
      : Promise.resolve({ success: true, availability: [], settings: null }),
  ]);

  const initialData = {
    total: result.total,
    stats: result.stats ?? null,
    bookings: result.bookings.map((booking): BookingData => ({
      id: booking.id,
      status: booking.status,
      scheduledDate: booking.scheduledDate.toISOString(),
      scheduledStartTime: booking.scheduledStartTime.toISOString(),
      scheduledEndTime: booking.scheduledEndTime.toISOString(),
      confirmationToken: booking.confirmationToken,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      listingId: booking.listingId,
      listingTitle: booking.listingTitle,
      listingThumbnail: booking.listingThumbnail,
      notes: booking.notes,
      specialRequests: booking.specialRequests,
      numberOfAttendees: booking.numberOfAttendees,
      createdAt: booking.createdAt.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString() ?? null,
      checkInTime: booking.checkInTime?.toISOString() ?? null,
      checkOutTime: booking.checkOutTime?.toISOString() ?? null,
      completedAt: booking.completedAt?.toISOString() ?? null,
      cancelledAt: booking.cancelledAt?.toISOString() ?? null,
      cancellationReason: booking.cancellationReason,
      cancellationNotes: booking.cancellationNotes ?? null,
      rejectedAt: null,
      rejectionReason: booking.rejectionReason,
    })),
  };

  const initialSettingsData = {
    availability: (settingsResult.availability || []) as AvailabilityRule[],
    settings: (settingsResult.settings || null) as BookingSettings | null,
  };

  return (
    <StaffBookingsView
      initialData={initialData}
      initialSettingsData={initialSettingsData}
      filters={{
        status: statusParam,
        sort: sortParam,
        page: pageParam,
        q: qParam,
      }}
    />
  );
}
