import { getSessionUser } from '@/lib/auth/session-context';
import { getBookings } from '@alifh/database';
import { UserBookingsView } from '@/components/features/bookings/user';
import type { UserBookingData, UserBookingStats } from '@/components/features/bookings/user/types';

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

type BookingViewStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show';
type BookingSort = 'newest' | 'oldest';

const VALID_STATUSES: BookingViewStatus[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show'];
const VALID_SORTS: BookingSort[] = ['newest', 'oldest'];

function getSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UserBookingsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;
  const params = await searchParams;
  const rawStatus = getSingle(params.status);
  const rawSort = getSingle(params.sort);
  const rawPage = Number(getSingle(params.page) || '1');
  const q = getSingle(params.q)?.trim() || '';

  const status: BookingViewStatus = rawStatus && VALID_STATUSES.includes(rawStatus as BookingViewStatus)
    ? rawStatus as BookingViewStatus
    : 'all';
  const sort: BookingSort = rawSort && VALID_SORTS.includes(rawSort as BookingSort)
    ? rawSort as BookingSort
    : 'newest';
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const initialData = await getBookings({
    userId: user.id,
    status: status === 'all' ? undefined : status === 'no_show' ? ['no_show', 'expired'] : [status],
    q: q || undefined,
    sort,
    limit,
    offset,
    includeStats: true,
  });

  const normalizedInitialData: { bookings: UserBookingData[]; total: number; stats: UserBookingStats } = {
    total: initialData.total,
    stats: {
      total: initialData.stats?.total ?? 0,
      pending: initialData.stats?.pending ?? 0,
      confirmed: initialData.stats?.confirmed ?? 0,
      completed: initialData.stats?.completed ?? 0,
      cancelled: initialData.stats?.cancelled ?? 0,
      rejected: initialData.stats?.rejected ?? 0,
      noShow: (initialData.stats?.noShow ?? 0),
    },
    bookings: initialData.bookings.map((booking) => ({
      id: booking.id,
      status: booking.status,
      scheduledDate: booking.scheduledDate.toISOString(),
      scheduledStartTime: booking.scheduledStartTime.toISOString(),
      scheduledEndTime: booking.scheduledEndTime.toISOString(),
      listingId: booking.listingId,
      listingTitle: booking.listingTitle,
      listingThumbnail: booking.listingThumbnail,
      partnerName: booking.partnerName,
      partnerLogo: booking.partnerLogo,
      notes: booking.notes,
      specialRequests: booking.specialRequests,
      numberOfAttendees: booking.numberOfAttendees,
      createdAt: booking.createdAt.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString() ?? null,
      completedAt: booking.completedAt?.toISOString() ?? null,
      cancelledAt: booking.cancelledAt?.toISOString() ?? null,
      cancellationReason: booking.cancellationReason,
      cancellationNotes: booking.cancellationNotes,
      confirmationToken: booking.confirmationToken ?? null,
      rejectedAt: null,
      rejectionReason: booking.rejectionReason,
      rescheduleCount: booking.rescheduleCount,
      lastRescheduledAt: booking.lastRescheduledAt?.toISOString() ?? null,
      partnerSettings: booking.partnerSettings ?? undefined,
    })),
  };

  return <UserBookingsView initialData={normalizedInitialData} filters={{ status, sort, page, q }} />;
}
