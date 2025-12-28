/**
 * Weekly Schedule Component
 */

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const selectedRule = availability.find(r => r.dayOfWeek === selectedDay);
  const isActive = selectedRule?.isActive ?? false;

  return (
    <section className="space-y-8">
      <div className="border-b border-border/40 pb-2">
        <h3 className="text-lg font-medium tracking-tight">Weekly Schedule</h3>
      </div>

      <div className="grid md:grid-cols-[240px,1fr] gap-8">
        {/* Left: Days List */}
        <div className="space-y-0 border border-border/40 rounded-xl overflow-hidden divide-y divide-border/40">
          {DAY_NAMES.map((dayName, dayOfWeek) => {
            const rule = availability.find(r => r.dayOfWeek === dayOfWeek);
            const dayActive = rule?.isActive ?? false;
            const isSelected = selectedDay === dayOfWeek;
            
            return (
              <button
                key={dayOfWeek}
                onClick={() => setSelectedDay(dayOfWeek)}
                className={cn(
                  "w-full p-4 flex items-center justify-between transition-colors text-left",
                  isSelected ? "bg-muted" : "hover:bg-muted/50",
                  !dayActive && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    dayActive ? "bg-green-500" : "bg-border"
                  )} />
                  <span className="font-medium">{dayName}</span>
                </div>
                {savingDay === dayOfWeek && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Day Settings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{DAY_NAMES[selectedDay]}</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-muted-foreground">Available</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => onUpdateDay(selectedDay, { isActive: e.target.checked })}
                disabled={savingDay === selectedDay}
                className="w-5 h-5 rounded accent-primary"
              />
            </label>
          </div>

          {isActive && (
            <div className="space-y-6 pt-4 border-t border-border/40">
              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Start Time</label>
                  <Select 
                    value={selectedRule?.startTime || '09:00'}
                    onValueChange={(v) => onUpdateDay(selectedDay, { startTime: v })}
                    disabled={savingDay === selectedDay}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        const label = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`;
                        return <SelectItem key={hour} value={`${hour}:00`}>{label}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">End Time</label>
                  <Select 
                    value={selectedRule?.endTime || '17:00'}
                    onValueChange={(v) => onUpdateDay(selectedDay, { endTime: v })}
                    disabled={savingDay === selectedDay}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        const label = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`;
                        return <SelectItem key={hour} value={`${hour}:00`}>{label}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Booking Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Slot Duration</label>
                  <Select 
                    value={String(selectedRule?.slotDuration || 45)}
                    onValueChange={(v) => onUpdateDay(selectedDay, { slotDuration: parseInt(v) })}
                    disabled={savingDay === selectedDay}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Max Bookings</label>
                  <Select 
                    value={String(selectedRule?.maxConcurrentBookings || 1)}
                    onValueChange={(v) => onUpdateDay(selectedDay, { maxConcurrentBookings: parseInt(v) })}
                    disabled={savingDay === selectedDay}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Copy Actions */}
              <div className="pt-4 border-t border-border/40">
                <Select onValueChange={(day) => {
                  const sourceRule = selectedRule;
                  if (!sourceRule) return;
                  onUpdateDay(parseInt(day), {
                    startTime: sourceRule.startTime,
                    endTime: sourceRule.endTime,
                    slotDuration: sourceRule.slotDuration,
                    maxConcurrentBookings: sourceRule.maxConcurrentBookings,
                    isActive: sourceRule.isActive,
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Copy to another day..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((name, idx) => idx !== selectedDay && (
                      <SelectItem key={idx} value={String(idx)}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!isActive && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Enable {DAY_NAMES[selectedDay]} to set working hours
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
