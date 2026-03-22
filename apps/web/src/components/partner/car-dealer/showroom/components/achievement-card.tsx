/**
 * Achievement Card Component
 * Editable card for showroom achievements/awards
 */

'use client';

import React, { useState } from 'react';
import { getAppThumbUrl } from '@/utils';
import { Award, Camera, Loader2, Trash2 } from 'lucide-react';
import type { AchievementCardProps } from '../types';

export function AchievementCard({ achievement, onUpdate, onRemove, onImageUpload, isUploading }: AchievementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(achievement);
  const imageUrl = getAppThumbUrl(achievement.image);

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
          {/* Image upload in edit mode */}
          <div className="flex items-center gap-3 mb-1">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0 group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`achievement-${achievement.id}-image`}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) await onImageUpload(file);
                }}
                disabled={isUploading}
              />
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt={achievement.title} className="absolute inset-0 h-full w-full object-cover" />
                  <label htmlFor={`achievement-${achievement.id}-image`} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-3 h-3 text-white" />
                  </label>
                </>
              ) : (
                <label htmlFor={`achievement-${achievement.id}-image`} className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors">
                  {isUploading ? <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" /> : <Camera className="w-3 h-3 text-muted-foreground" />}
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Award badge / certificate image</p>
          </div>
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
          <div onClick={() => setIsEditing(true)} className="cursor-pointer flex-1 flex items-start gap-3">
            {imageUrl ? (
              <img src={imageUrl} alt={achievement.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
              {achievement.issuer && (
                <p className="text-xs text-muted-foreground mt-0.5">{achievement.issuer}</p>
              )}
              {achievement.year && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{achievement.year}</p>
              )}
            </div>
          </div>
          <button onClick={onRemove} className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}
    </div>
  );
}
