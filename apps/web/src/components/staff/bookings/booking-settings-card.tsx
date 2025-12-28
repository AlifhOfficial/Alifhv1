/**
 * Booking Settings Card Component
 * V1 Simplified - Clean dropdown matching user-dropdown style
 */

'use client';

import { Settings, Loader2 } from 'lucide-react';
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
          className="px-4 py-2 rounded-full bg-sidebar hover:bg-sidebar-accent transition-colors text-sm font-medium text-sidebar-foreground flex items-center gap-2 border border-sidebar-border"
          title="Booking Preferences"
        >
          <Settings className="w-4 h-4" />
          Settings
          {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-sidebar border border-sidebar-border rounded-lg shadow-lg overflow-hidden p-0"
      >
        <div className="py-1.5">
          {/* Accept Bookings */}
          <label className="w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between cursor-pointer">
            <span>Accept Bookings</span>
            <input
              type="checkbox"
              checked={settings?.bookingEnabled ?? true}
              onChange={(e) => onUpdate({ bookingEnabled: e.target.checked })}
              disabled={isSaving}
              className="w-4 h-4 rounded accent-primary"
            />
          </label>

          {/* Auto-Confirm */}
          <label className="w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between cursor-pointer">
            <span>Auto-Confirm</span>
            <input
              type="checkbox"
              checked={settings?.autoConfirm ?? false}
              onChange={(e) => onUpdate({ autoConfirm: e.target.checked })}
              disabled={isSaving}
              className="w-4 h-4 rounded accent-primary"
            />
          </label>

          {/* Same-Day */}
          <label className="w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between cursor-pointer">
            <span>Same-Day Bookings</span>
            <input
              type="checkbox"
              checked={settings?.allowSameDay ?? true}
              onChange={(e) => onUpdate({ allowSameDay: e.target.checked })}
              disabled={isSaving}
              className="w-4 h-4 rounded accent-primary"
            />
          </label>

          {/* Divider */}
          <div className="my-1.5 mx-3 border-t border-sidebar-border" />

          {/* Min Lead Time */}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-sidebar-foreground/60">Min Lead Time</span>
            <Select 
              value={String(settings?.minLeadTimeHours ?? 2)} 
              onValueChange={(v) => onUpdate({ minLeadTimeHours: parseInt(v) })}
              disabled={isSaving}
            >
              <SelectTrigger className="w-24 h-7 text-xs bg-sidebar-accent border-sidebar-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Advance */}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-sidebar-foreground/60">Max Advance</span>
            <Select 
              value={String(settings?.maxAdvanceBookingDays ?? 30)} 
              onValueChange={(v) => onUpdate({ maxAdvanceBookingDays: parseInt(v) })}
              disabled={isSaving}
            >
              <SelectTrigger className="w-24 h-7 text-xs bg-sidebar-accent border-sidebar-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
