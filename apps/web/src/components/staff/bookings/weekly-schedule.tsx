/**
 * Weekly Schedule Component
 */

'use client';

import { Clock, Loader2, CalendarDays } from 'lucide-react';
import { cn } from '@/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import type { AvailabilityRule } from './types';
import { DAY_NAMES } from './types';

interface WeeklyScheduleProps {
  availability: AvailabilityRule[];
  savingDay: number | null;
  onUpdateDay: (dayOfWeek: number, updates: Partial<AvailabilityRule>) => void;
}

export function WeeklySchedule({ availability, savingDay, onUpdateDay }: WeeklyScheduleProps) {
  return (
    <section className="space-y-8">
      <div className="border-b border-border/40 pb-2">
        <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          Weekly Schedule
        </h3>
      </div>
      <div className="space-y-4">
        {DAY_NAMES.map((dayName, dayOfWeek) => {
          const rule = availability.find(r => r.dayOfWeek === dayOfWeek);
          const isActive = rule?.isActive ?? false;
          
          return (
            <div
              key={dayOfWeek}
              className={cn(
                "flex flex-wrap items-center gap-3 p-6 rounded-xl border transition-colors",
                isActive 
                  ? "border-border" 
                  : "border-border/40 bg-secondary/10"
              )}
            >
              {/* Day Toggle */}
              <label className="flex items-center gap-3 min-w-[140px]">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => onUpdateDay(dayOfWeek, { isActive: e.target.checked })}
                  disabled={savingDay === dayOfWeek}
                  className="w-5 h-5 rounded accent-primary"
                />
                <span className={cn(
                  "font-medium",
                  !isActive && "text-muted-foreground"
                )}>
                  {dayName}
                </span>
              </label>

              {/* Time Inputs */}
              {isActive && (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="time"
                      value={rule?.startTime || '09:00'}
                      onChange={(e) => onUpdateDay(dayOfWeek, { startTime: e.target.value })}
                      disabled={savingDay === dayOfWeek}
                      className="px-2 py-1 bg-background border border-border rounded text-sm"
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={rule?.endTime || '18:00'}
                      onChange={(e) => onUpdateDay(dayOfWeek, { endTime: e.target.value })}
                      disabled={savingDay === dayOfWeek}
                      className="px-2 py-1 bg-background border border-border rounded text-sm"
                    />
                  </div>

                  {/* Slot Duration */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Slot:</span>
                    <Select 
                      value={String(rule?.slotDuration || 45)} 
                      onValueChange={(v) => onUpdateDay(dayOfWeek, { slotDuration: parseInt(v) })}
                      disabled={savingDay === dayOfWeek}
                    >
                      <SelectTrigger className="w-[90px] h-8">
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Concurrent */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Max:</span>
                    <Select 
                      value={String(rule?.maxConcurrentBookings || 1)} 
                      onValueChange={(v) => onUpdateDay(dayOfWeek, { maxConcurrentBookings: parseInt(v) })}
                      disabled={savingDay === dayOfWeek}
                    >
                      <SelectTrigger className="w-[110px] h-8">
                        <SelectValue placeholder="Max" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 booking</SelectItem>
                        <SelectItem value="2">2 bookings</SelectItem>
                        <SelectItem value="3">3 bookings</SelectItem>
                        <SelectItem value="5">5 bookings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Saving Indicator */}
                  {savingDay === dayOfWeek && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
