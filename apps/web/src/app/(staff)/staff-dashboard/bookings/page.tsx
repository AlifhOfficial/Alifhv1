/**
 * Staff Bookings Dashboard Page
 * Shows bookings for listings posted by this staff member
 */

import { StaffBookingsView } from '@/components/features/bookings/staff';

export const dynamic = 'force-dynamic';

export default async function StaffBookingsPage() {
  return <StaffBookingsView />;
}
