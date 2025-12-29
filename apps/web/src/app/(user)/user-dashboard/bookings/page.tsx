import { UserBookingsView } from '@/components/features/bookings/user';

export const dynamic = 'force-dynamic';

export default async function UserBookingsPage() {
  return <UserBookingsView />;
}
