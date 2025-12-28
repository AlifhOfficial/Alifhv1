/**
 * Booking Settings Card Component
 */

'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="px-4 py-2 rounded-full bg-sidebar hover:bg-sidebar-accent transition-colors text-sm font-medium text-sidebar-foreground"
          title="Booking Preferences"
        >
          Preferences
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[300px] p-5 space-y-4 bg-sidebar border-sidebar-border rounded-xl"
      >
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings?.bookingEnabled ?? true}
            onChange={(e) => onUpdate({ bookingEnabled: e.target.checked })}
            disabled={isSaving}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors">Accept bookings</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings?.autoConfirm ?? false}
            onChange={(e) => onUpdate({ autoConfirm: e.target.checked })}
            disabled={isSaving}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors">Auto-confirm</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings?.allowSameDay ?? true}
            onChange={(e) => onUpdate({ allowSameDay: e.target.checked })}
            disabled={isSaving}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors">Same-day bookings</span>
        </label>

        <div className="flex items-center gap-3 pt-2 border-t border-sidebar-border">
          <span className="text-sm text-sidebar-foreground">Advance booking</span>
          <Select 
            value={String(settings?.maxAdvanceBookingDays ?? 30)} 
            onValueChange={(v) => onUpdate({ maxAdvanceBookingDays: parseInt(v) })}
            disabled={isSaving}
          >
            <SelectTrigger className="w-[110px] h-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
              <SelectValue />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
