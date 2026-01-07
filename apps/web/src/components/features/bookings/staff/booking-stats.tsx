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
      <div className="p-6 sm:p-8 flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted-foreground/70 tracking-tight">Pending</span>
        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingBookings}</span>
      </div>
      <div className="p-6 sm:p-8 flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted-foreground/70 tracking-tight">Confirmed</span>
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmedBookings}</span>
      </div>
      <div className="p-6 sm:p-8 flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted-foreground/70 tracking-tight">Today</span>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.todayBookings}</span>
      </div>
      <div className="p-6 sm:p-8 flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted-foreground/70 tracking-tight">Total</span>
        <span className="text-2xl font-bold text-foreground">{stats.totalBookings}</span>
      </div>
    </div>
  );
}
