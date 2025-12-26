/**
 * Booking Settings Card Component
 */

'use client';

import { Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import type { BookingSettings } from './types';

interface BookingSettingsCardProps {
  settings: BookingSettings | null;
  isSaving: boolean;
  onUpdate: (updates: Partial<BookingSettings>) => void;
}

export function BookingSettingsCard({ settings, isSaving, onUpdate }: BookingSettingsCardProps) {
  return (
    <section className="space-y-8">
      <div className="border-b border-border/40 pb-2">
        <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          Booking Settings
        </h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/10 transition-colors cursor-pointer">
          <span className="text-sm">Accept Bookings</span>
          <input
            type="checkbox"
            checked={settings?.bookingEnabled ?? true}
            onChange={(e) => onUpdate({ bookingEnabled: e.target.checked })}
            disabled={isSaving}
            className="w-5 h-5 rounded accent-primary"
          />
        </label>
        <label className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/10 transition-colors cursor-pointer">
          <span className="text-sm">Auto-confirm Bookings</span>
          <input
            type="checkbox"
            checked={settings?.autoConfirm ?? false}
            onChange={(e) => onUpdate({ autoConfirm: e.target.checked })}
            disabled={isSaving}
            className="w-5 h-5 rounded accent-primary"
          />
        </label>
        <label className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/10 transition-colors cursor-pointer">
          <span className="text-sm">Allow Same-Day Bookings</span>
          <input
            type="checkbox"
            checked={settings?.allowSameDay ?? true}
            onChange={(e) => onUpdate({ allowSameDay: e.target.checked })}
            disabled={isSaving}
            className="w-5 h-5 rounded accent-primary"
          />
        </label>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
          <span className="text-sm">Max Advance Days</span>
          <Select 
            value={String(settings?.maxAdvanceBookingDays ?? 30)} 
            onValueChange={(v) => onUpdate({ maxAdvanceBookingDays: parseInt(v) })}
            disabled={isSaving}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
