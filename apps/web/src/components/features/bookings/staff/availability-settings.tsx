/**
 * Availability Settings Tab Component
 */

'use client';

import { Calendar, Loader2 } from 'lucide-react';
import type { AvailabilityRule, BookingSettings } from './types';
import { BookingSettingsCard } from './booking-settings-card';
import { WeeklySchedule } from './weekly-schedule';

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No availability configured</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Set up your weekly schedule to start accepting bookings
        </p>
        <button
          onClick={onInitialize}
          className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
        >
          Initialize Default Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <BookingSettingsCard
          settings={settings}
          isSaving={savingSettings}
          onUpdate={onUpdateSettings}
        />
      </div>
      <WeeklySchedule
        availability={availability}
        savingDay={savingDay}
        onUpdateDay={onUpdateDay}
      />
    </div>
  );
}
