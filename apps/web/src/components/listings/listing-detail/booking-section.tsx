/**
 * Booking Section Component
 * 
 * Test drive booking button for partner/dealer listings.
 * Only shown for listings with partnerId.
 */

'use client';

import { Calendar, Car } from 'lucide-react';
import { cn } from '@/utils';

interface BookingSectionProps {
  onBookTestDrive: () => void;
  partnerName: string;
  className?: string;
}

export function BookingSection({
  onBookTestDrive,
  partnerName,
  className,
}: BookingSectionProps) {
  return (
    <div className={cn(
      "p-5 bg-card border border-border/40 rounded-xl space-y-4",
      className
    )}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Test Drive
      </h4>

      <div className="space-y-3">
        <button
          onClick={onBookTestDrive}
          className="w-full py-3 px-4 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Book Test Drive
        </button>

        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
          <Car className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Schedule a test drive at <span className="font-medium text-foreground">{partnerName}</span> showroom. 
            Free cancellation up to 24 hours before your appointment.
          </p>
        </div>
      </div>
    </div>
  );
}
