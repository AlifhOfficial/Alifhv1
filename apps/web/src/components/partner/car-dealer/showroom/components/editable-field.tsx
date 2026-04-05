/**
 * Editable Field Component
 * Tap-to-edit inline field following Revvup Design System
 */

'use client';

import React from 'react';
import { cn } from '@/utils';
import type { EditableFieldProps } from '../types';

export const EditableField = React.memo(function EditableField({
  label,
  value,
  placeholder,
  type = 'text',
  maxLength,
  isEditing,
  isUpdating,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
}: EditableFieldProps) {
  return (
    <div 
      className={cn(
        "py-3 border-b border-border/20 last:border-0",
        !isEditing && "cursor-pointer hover:bg-muted/30 -mx-5 px-5 transition-colors"
      )}
      onClick={() => !isEditing && onStartEdit()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-subhead font-semibold text-muted-foreground/70 mb-1">{label}</p>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              {type === 'textarea' ? (
                <textarea
                  autoFocus
                  value={String(value || '')}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  rows={4}
                  className="flex-1 bg-muted/20 rounded-lg p-3 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') onCancel();
                  }}
                />
              ) : (
                <input
                  autoFocus
                  type={type === 'number' ? 'number' : 'text'}
                  value={String(value || '')}
                  onChange={(e) => {
                    const val = type === 'number' ? (parseInt(e.target.value) || null) : e.target.value;
                    onChange(val);
                  }}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSave();
                    if (e.key === 'Escape') onCancel();
                  }}
                />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                  disabled={isUpdating}
                  className="text-caption1 text-primary hover:text-primary font-semibold"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onCancel(); }}
                  className="text-caption1 text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                {maxLength && (
                  <span className="text-caption1 text-muted-foreground/50 ml-auto">
                    {String(value || '').length}/{maxLength}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-subhead text-foreground">
              {value || <span className="text-muted-foreground/50">Tap to add</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
