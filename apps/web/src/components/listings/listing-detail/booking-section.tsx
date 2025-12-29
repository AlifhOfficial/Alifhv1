/**
 * Booking Section Component - Alifh Design System
 * 
 * Clean, minimal test drive booking following "Less is More" principle.
 */

'use client';

import { Calendar } from 'lucide-react';
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
      "p-4 bg-card border border-border/40 rounded-2xl space-y-3",
      className
    )}>
      <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
        Test Drive
      </p>

      <button
        onClick={onBookTestDrive}
        className="w-full py-3 px-4 bg-green-500 text-white rounded-full text-sm font-medium tracking-tight hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Book Test Drive
      </button>

      <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
        At <span className="font-medium text-foreground">{partnerName}</span> • Free cancellation
      </p>
    </div>
  );
}
