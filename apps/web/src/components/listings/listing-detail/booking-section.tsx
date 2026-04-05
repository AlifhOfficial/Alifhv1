/**
 * Booking Section Component - Revvup Design System
 * 
 * Clean, minimal test drive booking following "Less is More" principle.
 */

'use client';

import { Calendar } from 'lucide-react';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className={cn("space-y-4", className)}>
      <p className="text-caption1 uppercase tracking-wider font-bold text-muted-foreground/70">
        Test Drive
      </p>

      <button
        onClick={onBookTestDrive}
        className="w-full py-3 px-4 bg-green-500 text-white rounded-full text-subhead font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Book Test Drive
      </button>

      <p className="text-subhead text-muted-foreground text-center leading-relaxed font-medium">
        At <span className="font-bold text-foreground">{partnerName}</span> • Free cancellation
      </p>
    </div>
  );
}

function BookingSectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-12 w-full rounded-full" />
      <Skeleton className="h-4 w-full sm:w-40 mx-auto" />
    </div>
  );
}

BookingSection.Skeleton = BookingSectionSkeleton;
