/**
 * Service Card Component
 * Editable card for showroom services
 */

'use client';

import React, { useState } from 'react';
import { getAppThumbUrl } from '@/utils';
import { Camera, ImageIcon, Loader2, Trash2, Zap } from 'lucide-react';
import type { ServiceCardProps } from '../types';

export function ServiceCard({ service, onUpdate, onRemove, onImageUpload, isUploading }: ServiceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(service);
  const imageUrl = getAppThumbUrl(service.image ?? null);

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
          {/* Image upload in edit mode */}
          <div className="flex items-center gap-3 mb-1">
            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0 group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`service-${service.id}-image`}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) await onImageUpload(file);
                }}
                disabled={isUploading}
              />
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt={service.title} className="absolute inset-0 h-full w-full object-cover" />
                  <label htmlFor={`service-${service.id}-image`} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-3 h-3 text-white" />
                  </label>
                </>
              ) : (
                <label htmlFor={`service-${service.id}-image`} className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors">
                  {isUploading ? <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" /> : <ImageIcon className="w-3 h-3 text-muted-foreground" />}
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Service image (optional)</p>
          </div>
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
          <div onClick={() => setIsEditing(true)} className="cursor-pointer flex-1 flex items-start gap-3">
            {imageUrl ? (
              <img src={imageUrl} alt={service.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{service.title}</p>
              {service.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
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
