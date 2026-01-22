/**
 * Testimonial Card Component
 * Editable card for customer testimonials
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import { Star, Trash2 } from 'lucide-react';
import type { TestimonialCardProps } from '../types';

export function TestimonialCard({ testimonial, onUpdate, onRemove }: TestimonialCardProps) {
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
          <input
            value={form.customerName}
            onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
            placeholder="Customer name"
            className="w-full h-8 bg-muted/20 rounded px-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <input
            value={form.customerTitle || ''}
            onChange={(e) => setForm(f => ({ ...f, customerTitle: e.target.value || null }))}
            placeholder="Title (e.g. CEO at Company)"
            className="w-full h-8 bg-muted/20 rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Testimonial content..."
            rows={3}
            className="w-full bg-muted/20 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setForm(f => ({ ...f, rating: star }))}
                className="p-0.5"
              >
                <Star
                  className={cn("w-4 h-4", star <= form.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")}
                />
              </button>
            ))}
          </div>
          <input
            value={form.vehiclePurchased || ''}
            onChange={(e) => setForm(f => ({ ...f, vehiclePurchased: e.target.value || null }))}
            placeholder="Vehicle purchased (optional)"
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
              onClick={() => { setForm(testimonial); setIsEditing(false); }}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div onClick={() => setIsEditing(true)} className="cursor-pointer flex-1">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn("w-3 h-3", star <= testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30")}
                />
              ))}
            </div>
            <p className="text-sm text-foreground/90 line-clamp-2 italic">"{testimonial.content}"</p>
            <p className="text-xs font-semibold text-foreground mt-2">{testimonial.customerName}</p>
            {testimonial.customerTitle && (
              <p className="text-xs text-muted-foreground">{testimonial.customerTitle}</p>
            )}
            {testimonial.vehiclePurchased && (
              <p className="text-xs text-muted-foreground/70 mt-1">Purchased: {testimonial.vehiclePurchased}</p>
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
