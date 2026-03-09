/**
 * Availability Settings Component
 * Following settings-view.tsx patterns
 */

'use client';

import { Loader2, Calendar } from 'lucide-react';
import { cn } from '@/utils';
import { Skeleton } from "@/components/ui/skeleton";
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
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-2.5 sm:py-3",
        !isLast && "border-b border-border/30"
      )}
    >
      <div className="flex-1 min-w-0 sm:pr-4">
        <p className="text-xs sm:text-sm font-medium text-foreground">{title}</p>
        <p className="text-[11px] sm:text-xs text-muted-foreground/70 mt-0.5">{description}</p>
      </div>
      <div className="self-end sm:self-auto">
        {children}
      </div>
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
      <div className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
        {/* Booking Preferences skeleton */}
        <section>
          <Skeleton className="h-5 w-40 mb-2 sm:mb-3" />
          <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Slot Settings skeleton */}
        <section>
          <Skeleton className="h-5 w-28 mb-2 sm:mb-3" />
          <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Schedule skeleton */}
        <section>
          <Skeleton className="h-5 w-32 mb-2 sm:mb-3" />
          <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4 space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Calendar className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-[15px] font-semibold text-foreground mb-1">
          No schedule configured
        </p>
        <p className="text-sm text-muted-foreground/70 mb-5">
          Set up your weekly availability
        </p>
        <button
          onClick={onInitialize}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors"
        >
          Set Up Schedule
        </button>
      </div>
    );
  }

  const bookingEnabled = settings?.bookingEnabled ?? true;
  const autoConfirm = settings?.autoConfirm ?? false;
  const defaultSlotDuration = settings?.defaultSlotDuration ?? 45;
  const bufferBetweenBookings = settings?.bufferBetweenBookings ?? 15;

  return (
    <div className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
      {/* Booking Preferences */}
      <section>
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-[15px] font-semibold text-foreground">Booking Preferences</h3>
          {savingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </div>
        
        <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4">
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
            isLast
          >
            <Toggle 
              enabled={autoConfirm} 
              onToggle={() => onUpdateSettings({ autoConfirm: !autoConfirm })}
              disabled={savingSettings}
            />
          </SettingRow>
        </div>
      </section>

      {/* Slot Settings */}
      <section>
        <h3 className="text-sm sm:text-[15px] font-semibold text-foreground mb-2 sm:mb-3">Slot Settings</h3>
        
        <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4">
          <SettingRow 
            title="Slot Duration" 
            description="Length of each booking time slot"
          >
            <Select 
              value={String(defaultSlotDuration)} 
              onValueChange={(v) => onUpdateSettings({ defaultSlotDuration: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="w-24 sm:w-28 h-8 sm:h-9 text-xs sm:text-sm bg-muted/30 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 mins</SelectItem>
                <SelectItem value="30">30 mins</SelectItem>
                <SelectItem value="45">45 mins</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow 
            title="Buffer Time" 
            description="Gap between consecutive bookings"
            isLast
          >
            <Select 
              value={String(bufferBetweenBookings)} 
              onValueChange={(v) => onUpdateSettings({ bufferBetweenBookings: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="w-24 sm:w-28 h-8 sm:h-9 text-xs sm:text-sm bg-muted/30 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No buffer</SelectItem>
                <SelectItem value="5">5 mins</SelectItem>
                <SelectItem value="10">10 mins</SelectItem>
                <SelectItem value="15">15 mins</SelectItem>
                <SelectItem value="30">30 mins</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </section>

      {/* Booking Limits */}
      <section>
        <h3 className="text-sm sm:text-[15px] font-semibold text-foreground mb-2 sm:mb-3">Booking Limits</h3>
        
        <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4">
          <SettingRow 
            title="Minimum Lead Time" 
            description="How far in advance customers must book"
          >
            <Select 
              value={String(settings?.minLeadTimeHours ?? 2)} 
              onValueChange={(v) => onUpdateSettings({ minLeadTimeHours: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="w-24 sm:w-28 h-8 sm:h-9 text-xs sm:text-sm bg-muted/30 border-border/40">
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
          </SettingRow>

          <SettingRow 
            title="Maximum Advance" 
            description="How far ahead customers can book"
            isLast
          >
            <Select 
              value={String(settings?.maxLeadTimeDays ?? 30)} 
              onValueChange={(v) => onUpdateSettings({ maxLeadTimeDays: parseInt(v) })}
              disabled={savingSettings}
            >
              <SelectTrigger className="w-24 sm:w-28 h-8 sm:h-9 text-xs sm:text-sm bg-muted/30 border-border/40">
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
        <h3 className="text-sm sm:text-[15px] font-semibold text-foreground mb-2 sm:mb-3">Weekly Schedule</h3>
        
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          {DAY_NAMES.map((day, idx) => {
            const rule = availability.find(r => r.dayOfWeek === idx);
            const isActive = rule?.isActive ?? false;
            const isSaving = savingDay === idx;
            const isLast = idx === DAY_NAMES.length - 1;
            
            return (
              <div 
                key={idx}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2.5 sm:py-3",
                  !isLast && "border-b border-border/30"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3">
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
                    "text-xs sm:text-sm font-medium w-20 sm:w-24",
                    isActive ? "text-foreground" : "text-muted-foreground/50"
                  )}>
                    {day}
                  </span>
                </div>

                {isActive && rule ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
                    <Select 
                      value={rule.startTime}
                      onValueChange={(v) => onUpdateDay(idx, { startTime: v })}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[90px] sm:w-[100px] h-7 sm:h-8 text-[11px] sm:text-xs bg-muted/30 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground/40 text-[11px] sm:text-xs">to</span>
                    <Select 
                      value={rule.endTime}
                      onValueChange={(v) => onUpdateDay(idx, { endTime: v })}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[90px] sm:w-[100px] h-7 sm:h-8 text-[11px] sm:text-xs bg-muted/30 border-border/40">
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
