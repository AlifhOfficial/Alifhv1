/**
 * Booking verify/check-in by confirmation code (staff)
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

type VerifyAction = 'check_in' | 'confirm' | 'complete' | 'no_show';

interface BookingVerifyByCodeProps {
  onSuccess?: () => void;
}

export function BookingVerifyByCode({ onSuccess }: BookingVerifyByCodeProps) {
  const [code, setCode] = useState('');
  const [action, setAction] = useState<VerifyAction>('check_in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const confirmationToken = code.trim().toUpperCase();
    if (!confirmationToken) return;

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/bookings/manage/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationToken, action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setMessage(
        action === 'check_in'
          ? 'Customer checked in'
          : action === 'confirm'
            ? 'Booking confirmed'
            : action === 'complete'
              ? 'Booking marked completed'
              : 'No-show reported'
      );
      setCode('');
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/40 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">Verify booking by code</div>
        {message && (
          <div className="flex items-center gap-1.5 text-xs text-green-500">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code (e.g. W5ZC2CD6)"
          className="flex-1 h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0 text-sm"
        />

        <Select value={action} onValueChange={(v) => setAction(v as VerifyAction)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="check_in">Check-in</SelectItem>
            <SelectItem value="confirm">Confirm</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="no_show">No-show</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={submit}
          disabled={isSubmitting || code.trim().length === 0}
          className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSubmitting ? 'Processing...' : 'Apply'}
        </button>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}
      <div className="text-xs text-muted-foreground">
        Ask the customer for the confirmation code shown in their booking and use it here.
      </div>
    </div>
  );
}

