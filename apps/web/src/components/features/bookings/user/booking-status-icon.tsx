/**
 * User Booking Status Icon
 */

'use client';

import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusIconProps {
  status: string;
  className?: string;
}

export function BookingStatusIcon({ status, className = "w-4 h-4" }: StatusIconProps) {
  switch (status) {
    case 'pending':
    case 'expired':
      return <Clock className={className} />;
    case 'confirmed':
    case 'completed':
      return <CheckCircle className={className} />;
    case 'cancelled':
    case 'rejected':
      return <XCircle className={className} />;
    case 'no_show':
      return <AlertCircle className={className} />;
    default:
      return <Clock className={className} />;
  }
}
