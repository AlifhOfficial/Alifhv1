/**
 * Availability Settings Component
 * Simplified, clean settings page
 */

'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import type { AvailabilityRule, BookingSettings } from './types';
import { DAY_NAMES } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

// Generate time options in 30-minute increments
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const label = `${hour12}:${minutes.toString().padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
  return { value, label };
});

interface AvailabilitySettingsProps {
  availability: AvailabilityRule[];
  settings: BookingSettings | null;
  isLoading: boolean;
  savingDay: number | null;
  savingSettings: boolean;
  onInitialize: () => void;
  onUpdateDay: (dayOfWeek: number, updates: Partial<AvailabilityRule>) => void;
  onUpdateSettings: (updates: Partial<BookingSettings>) => void;
}

export function AvailabilitySettings({
  availability,
  settings,
  isLoading,
  savingDay,
  savingSettings,
  onInitialize,
  onUpdateDay,
  onUpdateSettings,
}: AvailabilitySettingsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No schedule configured yet</p>
        <button
          onClick={onInitialize}
          className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
        >
          Set Up Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* General Settings */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">General</h3>
        <div className="space-y-1">
          <ToggleRow
            label="Accept Bookings"
            description="Allow customers to book test drives"
            checked={settings?.bookingEnabled ?? true}
            disabled={savingSettings}
            onChange={(v) => onUpdateSettings({ bookingEnabled: v })}
          />
          <ToggleRow
            label="Auto-Confirm"
            description="Automatically confirm new bookings"
            checked={settings?.autoConfirm ?? false}
            disabled={savingSettings}
            onChange={(v) => onUpdateSettings({ autoConfirm: v })}
          />
          <ToggleRow
            label="Same-Day Bookings"
            description="Allow bookings for today"
            checked={settings?.allowSameDay ?? true}
            disabled={savingSettings}
            onChange={(v) => onUpdateSettings({ allowSameDay: v })}
          />
        </div>
      </section>

      {/* Timing Settings */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Timing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Min Lead Time</label>
            <Select 
              value={String(settings?.minLeadTimeHours ?? 2)} 
              onValueChange={(v) => onUpdateSettings({ minLeadTimeHours: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No minimum</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Max Advance</label>
            <Select 
              value={String(settings?.maxAdvanceBookingDays ?? 30)} 
              onValueChange={(v) => onUpdateSettings({ maxAdvanceBookingDays: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="h-10">
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
      </section>

      {/* Weekly Schedule */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Weekly Schedule</h3>
        <div className="space-y-2">
          {DAY_NAMES.map((day, idx) => {
            const rule = availability.find(r => r.dayOfWeek === idx);
            const isActive = rule?.isActive ?? false;
            const isSaving = savingDay === idx;
            
            return (
              <div 
                key={idx}
                className={cn(
                  "flex items-center justify-between py-3 px-4 rounded-lg transition-colors",
                  isActive ? "bg-secondary/30" : "bg-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => onUpdateDay(idx, { isActive: !isActive })}
                    disabled={isSaving}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      isActive ? "bg-primary" : "bg-border"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                      isActive ? "translate-x-5" : "translate-x-1"
                    )} />
                    {isSaving && (
                      <Loader2 className="w-3 h-3 animate-spin absolute top-1.5 left-1/2 -translate-x-1/2 text-white" />
                    )}
                  </button>
                  
                  <span className={cn(
                    "font-medium w-24",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {day}
                  </span>
                </div>

                {isActive && rule && (
                  <div className="flex items-center gap-2">
                    <Select 
                      value={rule.startTime}
                      onValueChange={(v) => onUpdateDay(idx, { startTime: v })}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[100px] h-9 text-sm bg-transparent border-0 hover:bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground/50 text-sm">–</span>
                    <Select 
                      value={rule.endTime}
                      onValueChange={(v) => onUpdateDay(idx, { endTime: v })}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[100px] h-9 text-sm bg-transparent border-0 hover:bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!isActive && (
                  <span className="text-sm text-muted-foreground/50">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Simple toggle row component
function ToggleRow({ 
  label, 
  description, 
  checked, 
  disabled, 
  onChange 
}: { 
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground/70">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          "w-10 h-6 rounded-full transition-colors relative",
          checked ? "bg-primary" : "bg-border"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )} />
      </button>
    </div>
  );
}
