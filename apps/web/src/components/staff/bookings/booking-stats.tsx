/**
 * Booking Stats Cards Component
 */

'use client';

import type { BookingStats } from './types';

interface BookingStatsCardsProps {
  stats: BookingStats;
}

export function BookingStatsCards({ stats }: BookingStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/40 divide-x divide-border/40">
      <div className="p-8 flex flex-col gap-2">
        <small className="text-muted-foreground">Pending</small>
        <h2 className="text-yellow-500">{stats.pendingBookings}</h2>
      </div>
      <div className="p-8 flex flex-col gap-2">
        <small className="text-muted-foreground">Confirmed</small>
        <h2 className="text-green-500">{stats.confirmedBookings}</h2>
      </div>
      <div className="p-8 flex flex-col gap-2">
        <small className="text-muted-foreground">Today</small>
        <h2 className="text-blue-500">{stats.todayBookings}</h2>
      </div>
      <div className="p-8 flex flex-col gap-2">
        <small className="text-muted-foreground">Total</small>
        <h2 className="text-foreground">{stats.totalBookings}</h2>
      </div>
    </div>
  );
}
