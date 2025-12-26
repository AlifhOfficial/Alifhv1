/**
 * Booking Stats Cards Component
 */

'use client';

import { Calendar, Clock, CheckCircle, Eye } from 'lucide-react';
import type { BookingStats } from './types';

interface BookingStatsCardsProps {
  stats: BookingStats;
}

export function BookingStatsCards({ stats }: BookingStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border">
      <div className="p-8 text-center">
        <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-3" />
        <p className="text-xs text-muted-foreground mb-1">Pending</p>
        <p className="text-xl font-semibold text-yellow-500">{stats.pendingBookings}</p>
      </div>
      <div className="p-8 text-center">
        <CheckCircle className="w-5 h-5 text-foreground mx-auto mb-3" />
        <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
        <p className="text-xl font-semibold text-foreground">{stats.confirmedBookings}</p>
      </div>
      <div className="p-8 text-center">
        <Calendar className="w-5 h-5 text-green-500 mx-auto mb-3" />
        <p className="text-xs text-muted-foreground mb-1">Today</p>
        <p className="text-xl font-semibold text-green-500">{stats.todayBookings}</p>
      </div>
      <div className="p-8 text-center">
        <Eye className="w-5 h-5 text-blue-500 mx-auto mb-3" />
        <p className="text-xs text-muted-foreground mb-1">Total</p>
        <p className="text-xl font-semibold text-blue-500">{stats.totalBookings}</p>
      </div>
    </div>
  );
}
