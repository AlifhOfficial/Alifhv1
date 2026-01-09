/**
 * Availability Settings Component
 * Following settings-view.tsx patterns
 */

'use client';

import { Loader2, Calendar } from 'lucide-react';
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

// ============================================================================
// Toggle Component (matching settings-view)
// ============================================================================

function Toggle({ 
  enabled, 
  onToggle, 
  disabled = false 
}: { 
  enabled: boolean; 
  onToggle: () => void; 
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-[22px] w-[42px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50",
        enabled ? "bg-emerald-500" : "bg-muted-foreground/30"
      )}
      aria-label="Toggle"
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          enabled ? "translate-x-[22px]" : "translate-x-[2px]",
          "mt-[2px]"
        )}
      />
    </button>
  );
}

// ============================================================================
// Setting Row Component
// ============================================================================

function SettingRow({ 
  title, 
  description, 
  children,
  isLast = false,
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between py-3",
        !isLast && "border-b border-sidebar-border/40"
      )}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

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
        <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-sidebar-border bg-sidebar">
        <div className="w-16 h-16 rounded-full bg-sidebar-accent/50 flex items-center justify-center mb-5">
          <Calendar className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <p className="text-[15px] font-bold tracking-tight text-foreground mb-1">
          No schedule configured
        </p>
        <p className="text-sm text-muted-foreground/70 mb-6">
          Set up your weekly availability for test drives
        </p>
        <button
          onClick={onInitialize}
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors"
        >
          Set Up Schedule
        </button>
      </div>
    );
  }

  const bookingEnabled = settings?.bookingEnabled ?? true;
  const autoConfirm = settings?.autoConfirm ?? false;
  const allowSameDay = settings?.allowSameDay ?? true;

  return (
    <div className="space-y-8 mt-6">
      {/* Booking Preferences */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Booking Preferences</h3>
          {savingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </div>
        
        <div className="rounded-xl border border-sidebar-border bg-sidebar p-4">
          <SettingRow 
            title="Accept Bookings" 
            description="Allow customers to book test drives"
          >
            <Toggle 
              enabled={bookingEnabled} 
              onToggle={() => onUpdateSettings({ bookingEnabled: !bookingEnabled })}
              disabled={savingSettings}
            />
          </SettingRow>
          
          <SettingRow 
            title="Auto-Confirm" 
            description="Automatically confirm new bookings"
          >
            <Toggle 
              enabled={autoConfirm} 
              onToggle={() => onUpdateSettings({ autoConfirm: !autoConfirm })}
              disabled={savingSettings}
            />
          </SettingRow>
          
          <SettingRow 
            title="Same-Day Bookings" 
            description="Allow bookings for today"
            isLast
          >
            <Toggle 
              enabled={allowSameDay} 
              onToggle={() => onUpdateSettings({ allowSameDay: !allowSameDay })}
              disabled={savingSettings}
            />
          </SettingRow>
        </div>
      </section>

      {/* Booking Limits */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Booking Limits</h3>
        
        <div className="rounded-xl border border-sidebar-border bg-sidebar p-4">
          <SettingRow 
            title="Minimum Lead Time" 
            description="How far in advance customers must book"
          >
            <Select 
              value={String(settings?.minLeadTimeHours ?? 2)} 
              onValueChange={(v) => onUpdateSettings({ minLeadTimeHours: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="w-28 h-9 text-sm bg-sidebar-accent border-sidebar-border">
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
          </SettingRow>

          <SettingRow 
            title="Maximum Advance" 
            description="How far ahead customers can book"
            isLast
          >
            <Select 
              value={String(settings?.maxAdvanceBookingDays ?? 30)} 
              onValueChange={(v) => onUpdateSettings({ maxAdvanceBookingDays: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="w-28 h-9 text-sm bg-sidebar-accent border-sidebar-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Weekly Schedule</h3>
        
        <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden">
          {DAY_NAMES.map((day, idx) => {
            const rule = availability.find(r => r.dayOfWeek === idx);
            const isActive = rule?.isActive ?? false;
            const isSaving = savingDay === idx;
            const isLast = idx === DAY_NAMES.length - 1;
            
            return (
              <div 
                key={idx}
                className={cn(
                  "flex items-center justify-between px-4 py-3",
                  !isLast && "border-b border-sidebar-border/40"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Toggle */}
                  <div className="relative">
                    <Toggle
                      enabled={isActive}
                      onToggle={() => onUpdateDay(idx, { isActive: !isActive })}
                      disabled={isSaving}
                    />
                    {isSaving && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-sm font-medium w-24",
                    isActive ? "text-foreground" : "text-muted-foreground/50"
                  )}>
                    {day}
                  </span>
                </div>

                {isActive && rule ? (
                  <div className="flex items-center gap-2">
                    <Select 
                      value={rule.startTime}
                      onValueChange={(v) => onUpdateDay(idx, { startTime: v })}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-xs bg-sidebar-accent border-sidebar-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground/40 text-xs">to</span>
                    <Select 
                      value={rule.endTime}
                      onValueChange={(v) => onUpdateDay(idx, { endTime: v })}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-xs bg-sidebar-accent border-sidebar-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/40">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
