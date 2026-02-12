/**
 * Service Card Component
 * Editable card for showroom services
 */

'use client';

import React, { useState } from 'react';
import { Zap, Trash2 } from 'lucide-react';
import type { ServiceCardProps } from '../types';

export function ServiceCard({ service, onUpdate, onRemove }: ServiceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(service);

  // Sync form state when service prop changes (e.g., after save)
  React.useEffect(() => {
    if (!isEditing) {
      setForm(service);
    }
  }, [service, isEditing]);

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-4">
      {isEditing ? (
        <div className="space-y-2">
          <input
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Service title"
            className="w-full h-8 bg-muted/20 rounded px-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value || null }))}
            placeholder="Description..."
            rows={2}
            className="w-full bg-muted/20 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdate(form); setIsEditing(false); }}
              className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => { setForm(service); setIsEditing(false); }}
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
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">{service.title}</p>
            </div>
            {service.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
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
