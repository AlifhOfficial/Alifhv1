/**
 * Team Member Card Component
 * Editable card for showroom team members
 */

'use client';

import React, { useState } from 'react';
import { getPublicUrl } from '@/utils';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import type { TeamMemberCardProps } from '../types';

export function TeamMemberCard({ member, onUpdate, onRemove, onImageUpload, isUploading }: TeamMemberCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(member);
  const memberImageUrl = getPublicUrl(member.image);

  // Sync form state when member prop changes (e.g., after save)
  React.useEffect(() => {
    if (!isEditing) {
      setForm(member);
    }
  }, [member, isEditing]);

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted/30 flex-shrink-0 group">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id={`team-${member.id}-image`}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) await onImageUpload(file);
            }}
            disabled={isUploading}
          />
          {memberImageUrl ? (
            <>
              <img 
                key={memberImageUrl}
                src={memberImageUrl}
                alt={member.name} 
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <label
                htmlFor={`team-${member.id}-image`}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
            </>
          ) : (
            <label
              htmlFor={`team-${member.id}-image`}
              className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-muted-foreground" />
              )}
            </label>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Name"
                className="w-full h-8 bg-muted/20 rounded px-2 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <input
                value={form.role}
                onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="Role"
                className="w-full h-8 bg-muted/20 rounded px-2 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <textarea
                value={form.bio || ''}
                onChange={(e) => setForm(f => ({ ...f, bio: e.target.value || null }))}
                placeholder="Short bio..."
                rows={2}
                className="w-full bg-muted/20 rounded p-2 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { onUpdate(form); setIsEditing(false); }}
                  className="text-caption1 text-primary hover:text-primary font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => { setForm(member); setIsEditing(false); }}
                  className="text-caption1 text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">
              <p className="text-subhead font-semibold text-foreground">{member.name}</p>
              <p className="text-caption1 text-muted-foreground">{member.role}</p>
              {member.bio && (
                <p className="text-caption1 text-muted-foreground/70 mt-1 line-clamp-2">{member.bio}</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </div>
  );
}
