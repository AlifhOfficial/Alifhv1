/**
 * Achievement Card Component
 * Editable card for showroom achievements/awards
 */

'use client';

import React, { useState } from 'react';
import { Award, Trash2 } from 'lucide-react';
import type { AchievementCardProps } from '../types';

export function AchievementCard({ achievement, onUpdate, onRemove }: AchievementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(achievement);

  // Sync form state when achievement prop changes (e.g., after save)
  React.useEffect(() => {
    if (!isEditing) {
      setForm(achievement);
    }
  }, [achievement, isEditing]);

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-4">
      {isEditing ? (
        <div className="space-y-2">
          <input
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Achievement title"
            className="w-full h-8 bg-muted/20 rounded px-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <input
            value={form.issuer || ''}
            onChange={(e) => setForm(f => ({ ...f, issuer: e.target.value || null }))}
            placeholder="Issuing organization"
            className="w-full h-8 bg-muted/20 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <input
            type="number"
            value={form.year || ''}
            onChange={(e) => setForm(f => ({ ...f, year: parseInt(e.target.value) || null }))}
            placeholder="Year"
            className="w-full h-8 bg-muted/20 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdate(form); setIsEditing(false); }}
              className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => { setForm(achievement); setIsEditing(false); }}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div onClick={() => setIsEditing(true)} className="cursor-pointer flex-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
            </div>
            {achievement.issuer && (
              <p className="text-xs text-muted-foreground mt-0.5">{achievement.issuer}</p>
            )}
            {achievement.year && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{achievement.year}</p>
            )}
          </div>
          <button onClick={onRemove} className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}
    </div>
  );
}
