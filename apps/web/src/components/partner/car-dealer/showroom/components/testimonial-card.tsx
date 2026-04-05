/**
 * Testimonial Card Component
 * Editable card for customer testimonials
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import { getAppThumbUrl } from '@/utils';
import { Camera, Loader2, Star, Trash2 } from 'lucide-react';
import type { TestimonialCardProps } from '../types';

export function TestimonialCard({ testimonial, onUpdate, onRemove, onImageUpload, isUploading }: TestimonialCardProps) {
  const photoUrl =
    testimonial.customerImageUrl ||
    (testimonial.customerImage?.startsWith('https://') ? testimonial.customerImage : getAppThumbUrl(testimonial.customerImage));
  const isGoogleReview = testimonial.source === 'google';
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(testimonial);

  // Sync form state when testimonial prop changes (e.g., after save)
  React.useEffect(() => {
    if (!isEditing) {
      setForm(testimonial);
    }
  }, [testimonial, isEditing]);

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-4">
      {isEditing ? (
        <div className="space-y-2">
          {/* Customer photo */}
          <div className="flex items-center gap-3 mb-1">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted/30 flex-shrink-0 group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`testimonial-${testimonial.id}-photo`}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) await onImageUpload(file);
                }}
                disabled={isUploading}
              />
              {photoUrl ? (
                <>
                  <img src={photoUrl} alt={testimonial.customerName} className="absolute inset-0 h-full w-full object-cover" />
                  <label htmlFor={`testimonial-${testimonial.id}-photo`} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-3 h-3 text-white" />
                  </label>
                </>
              ) : (
                <label htmlFor={`testimonial-${testimonial.id}-photo`} className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors">
                  {isUploading ? <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" /> : <Camera className="w-3 h-3 text-muted-foreground" />}
                </label>
              )}
            </div>
            <p className="text-caption1 text-muted-foreground">Customer photo (optional)</p>
          </div>
          <input
            value={form.customerName}
            onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
            placeholder="Customer name"
            className="w-full h-8 bg-muted/20 rounded px-2 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <input
            value={form.customerTitle || ''}
            onChange={(e) => setForm(f => ({ ...f, customerTitle: e.target.value || null }))}
            placeholder="Title (e.g. CEO at Company)"
            className="w-full h-8 bg-muted/20 rounded px-2 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Testimonial content..."
            rows={3}
            className="w-full bg-muted/20 rounded p-2 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-caption1 text-muted-foreground">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setForm(f => ({ ...f, rating: star }))}
                className="p-0.5"
              >
                <Star
                  className={cn("w-4 h-4", star <= form.rating ? "text-warning fill-yellow-500" : "text-muted-foreground")}
                />
              </button>
            ))}
          </div>
          <input
            value={form.vehiclePurchased || ''}
            onChange={(e) => setForm(f => ({ ...f, vehiclePurchased: e.target.value || null }))}
            placeholder="Vehicle purchased (optional)"
            className="w-full h-8 bg-muted/20 rounded px-2 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdate(form); setIsEditing(false); }}
              className="text-caption1 text-primary hover:text-primary font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => { setForm(testimonial); setIsEditing(false); }}
              className="text-caption1 text-muted-foreground hover:text-foreground font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div onClick={() => !isGoogleReview && setIsEditing(true)} className={cn("flex-1 flex items-start gap-3", !isGoogleReview && "cursor-pointer")}>
            {photoUrl ? (
              <img src={photoUrl} alt={testimonial.customerName} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted/30 flex-shrink-0" />
            )}
            <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn("w-3 h-3", star <= testimonial.rating ? "text-warning fill-yellow-500" : "text-muted-foreground/30")}
                />
              ))}
            </div>
            <p className="text-subhead text-foreground/90 line-clamp-2 italic">"{testimonial.content}"</p>
            <p className="text-caption1 font-semibold text-foreground mt-2">{testimonial.customerName}</p>
            {testimonial.customerTitle && (
              <p className="text-caption1 text-muted-foreground">{testimonial.customerTitle}</p>
            )}
            {testimonial.vehiclePurchased && (
              <p className="text-caption1 text-muted-foreground/70 mt-1">Purchased: {testimonial.vehiclePurchased}</p>
            )}
            {isGoogleReview && (
              <p className="text-caption1 text-muted-foreground/60 mt-1">via Google Reviews</p>
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
