/**
 * Weekly Schedule Component
 * Following partner dashboard UI patterns
 */

'use client';

import { useState } from 'react';
import { Loader2, Clock, Copy, ChevronDown } from 'lucide-react';
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

// Generate time options in 30-minute increments
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  const hour24 = hours.toString().padStart(2, '0');
  const min = minutes.toString().padStart(2, '0');
  const value = `${hour24}:${min}`;
  
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'AM' : 'PM';
  const label = `${hour12}:${min} ${ampm}`;
  
  return { value, label };
});

interface WeeklyScheduleProps {
  availability: AvailabilityRule[];
  savingDay: number | null;
  onUpdateDay: (dayOfWeek: number, updates: Partial<AvailabilityRule>) => void;
}

export function WeeklySchedule({ availability, savingDay, onUpdateDay }: WeeklyScheduleProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const selectedRule = availability.find(r => r.dayOfWeek === selectedDay);
  const isActive = selectedRule?.isActive ?? false;

  // Count active days for display
  const activeDays = availability.filter(r => r.isActive).length;

  return (
    <section className="space-y-8">
      {/* Day Settings Card */}
      <div className="bg-card rounded-xl border border-border/40 p-8">
        {/* Day Selector */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/40">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground/70">Select Day</p>
            <Select 
              value={String(selectedDay)}
              onValueChange={(v) => setSelectedDay(parseInt(v))}
            >
              <SelectTrigger className="w-48 h-11 bg-transparent border border-border/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-green-500" : "bg-border"
                  )} />
                  <span>{DAY_NAMES[selectedDay]}</span>
                  {isActive && selectedRule && (
                    <span className="text-muted-foreground">
                      {TIME_OPTIONS.find(t => t.value === selectedRule.startTime)?.label}
                    </span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((name, idx) => {
                  const rule = availability.find(r => r.dayOfWeek === idx);
                  const dayActive = rule?.isActive ?? false;
                  return (
                    <SelectItem key={idx} value={String(idx)}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          dayActive ? "bg-green-500" : "bg-border"
                        )} />
                        {name}
                        {dayActive && rule && (
                          <span className="text-muted-foreground ml-2">
                            {TIME_OPTIONS.find(t => t.value === rule.startTime)?.label}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground/70">Active Days</p>
            <p className="text-lg font-medium text-foreground">{activeDays}/7</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isActive ? "bg-green-500/10" : "bg-muted"
            )}>
              <Clock className={cn(
                "w-5 h-5",
                isActive ? "text-green-500" : "text-muted-foreground"
              )} />
              {savingDay === selectedDay && (
                <Loader2 className="w-5 h-5 animate-spin text-green-500 absolute" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-foreground">{DAY_NAMES[selectedDay]}</h4>
              <p className="text-xs text-muted-foreground/70">
                {isActive ? 'Accepting bookings' : 'Not accepting bookings'}
              </p>
            </div>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm text-muted-foreground">Available</span>
            <div className={cn(
              "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
              isActive ? "bg-primary" : "bg-muted"
            )}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => onUpdateDay(selectedDay, { isActive: e.target.checked })}
                disabled={savingDay === selectedDay}
                className="sr-only"
              />
              <div className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                isActive ? "translate-x-[22px]" : "translate-x-0.5"
              )} />
            </div>
          </label>
        </div>

        {isActive ? (
          <div className="space-y-8">
            {/* Time Range */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground/70">Working Hours</p>
              <div className="flex items-center gap-4">
                <Select 
                  value={selectedRule?.startTime || '09:00'}
                  onValueChange={(v) => onUpdateDay(selectedDay, { startTime: v })}
                  disabled={savingDay === selectedDay}
                >
                  <SelectTrigger className="flex-1 h-12 bg-transparent border border-border/40 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground/50">to</span>
                <Select 
                  value={selectedRule?.endTime || '17:00'}
                  onValueChange={(v) => onUpdateDay(selectedDay, { endTime: v })}
                  disabled={savingDay === selectedDay}
                >
                  <SelectTrigger className="flex-1 h-12 bg-transparent border border-border/40 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Booking Settings */}
            <div className="grid grid-cols-3 border-y border-border/40 divide-x divide-border/40 -mx-8">
              <div className="p-6 space-y-3">
                <p className="text-xs text-muted-foreground/70">Slot Duration</p>
                <Select 
                  value={String(selectedRule?.slotDuration || 45)}
                  onValueChange={(v) => onUpdateDay(selectedDay, { slotDuration: parseInt(v) })}
                  disabled={savingDay === selectedDay}
                >
                  <SelectTrigger className="h-10 bg-transparent border-0 p-0 text-foreground font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hrs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-muted-foreground/70">Buffer Time</p>
                <Select 
                  value={String(selectedRule?.bufferTime ?? 15)}
                  onValueChange={(v) => onUpdateDay(selectedDay, { bufferTime: parseInt(v) })}
                  disabled={savingDay === selectedDay}
                >
                  <SelectTrigger className="h-10 bg-transparent border-0 p-0 text-foreground font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-muted-foreground/70">Max Concurrent</p>
                <Select 
                  value={String(selectedRule?.maxConcurrentBookings || 1)}
                  onValueChange={(v) => onUpdateDay(selectedDay, { maxConcurrentBookings: parseInt(v) })}
                  disabled={savingDay === selectedDay}
                >
                  <SelectTrigger className="h-10 bg-transparent border-0 p-0 text-foreground font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 booking</SelectItem>
                    <SelectItem value="2">2 bookings</SelectItem>
                    <SelectItem value="3">3 bookings</SelectItem>
                    <SelectItem value="5">5 bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Copy Action */}
            <Select onValueChange={(day) => {
              const sourceRule = selectedRule;
              if (!sourceRule) return;
              onUpdateDay(parseInt(day), {
                startTime: sourceRule.startTime,
                endTime: sourceRule.endTime,
                slotDuration: sourceRule.slotDuration,
                bufferTime: sourceRule.bufferTime,
                maxConcurrentBookings: sourceRule.maxConcurrentBookings,
                isActive: sourceRule.isActive,
              });
            }}>
              <SelectTrigger className="h-11 bg-transparent border-dashed border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy settings to another day</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((name, idx) => idx !== selectedDay && (
                  <SelectItem key={idx} value={String(idx)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Toggle the switch to accept bookings on {DAY_NAMES[selectedDay]}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
