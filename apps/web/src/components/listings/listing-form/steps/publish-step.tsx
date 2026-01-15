'use client';

/**
 * Publish Step - Clean Style with Color Accents
 * 
 * Larger typography, green success states.
 * Primary for focus, green-500 for CheckCircle2.
 */

import { useMemo, useState } from 'react';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/utils';
import { Combobox } from '../combobox';
import { UAE_EMIRATES } from '../constants';
import type { ListingImage } from '../types';
import type { StepProps } from './types';
import { ImageUpload } from '@/components/ui/forms/image-upload';

// ============================================================================
// Shared Components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h3>
  );
}

function FieldWrapper({ 
  label, 
  required, 
  hint, 
  error, 
  children 
}: { 
  label: string; 
  required?: boolean; 
  hint?: string;
  error?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-muted-foreground/70">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && !error && (
          <span className="text-xs text-muted-foreground/70">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}

function mapKeysToImages(keys: string[]): ListingImage[] {
  return keys
    .filter((k) => typeof k === 'string' && k.trim().length > 0)
    .map((key, order) => ({ key, order }));
}

// Remove emojis and normalize text (prevent shouting)
function normalizeText(text: string): string {
  // Remove emojis
  const noEmoji = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '');
  
  // Convert to lowercase first, then capitalize first letter of each sentence
  const lower = noEmoji.toLowerCase();
  
  // Capitalize first letter of text and after sentence endings
  return lower.replace(/(^|[.!?]\s*)([a-z])/g, (_, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });
}

// Auto-generate description from listing data
function generateDescription(data: Partial<import('../types').ListingFormData>): string {
  const parts: string[] = [];
  
  // Opening with year, make, model
  if (data.year && data.make && data.model) {
    const trim = data.trim ? ` ${data.trim}` : '';
    parts.push(`${data.year} ${data.make} ${data.model}${trim}.`);
  }
  
  // Mileage
  if (data.mileage !== undefined && data.mileage !== null) {
    const mileageStr = data.mileage.toLocaleString();
    if (data.mileage < 30000) {
      parts.push(`Low mileage at ${mileageStr} km.`);
    } else if (data.mileage < 80000) {
      parts.push(`${mileageStr} km on the odometer.`);
    } else {
      parts.push(`Well-maintained with ${mileageStr} km.`);
    }
  }
  
  // Specs origin
  if (data.specs) {
    const specsMap: Record<string, string> = {
      gcc: 'GCC specification',
      american: 'American import',
      european: 'European specification',
      japanese: 'Japanese import',
      korean: 'Korean specification',
      chinese: 'Chinese specification',
      other: 'International specification',
    };
    if (specsMap[data.specs]) {
      parts.push(`${specsMap[data.specs]}.`);
    }
  }
  
  // Key features
  const features: string[] = [];
  if (data.exteriorColor) features.push(`${data.exteriorColor} exterior`);
  if (data.interiorColor) features.push(`${data.interiorColor} interior`);
  if (data.transmission) features.push(data.transmission === 'automatic' ? 'automatic' : 'manual');
  if (data.fuelType && data.fuelType !== 'petrol') features.push(data.fuelType);
  
  if (features.length > 0) {
    parts.push(`Features ${features.join(', ')}.`);
  }
  
  // Engine info
  if (data.engineSize || data.cylinders) {
    const engine: string[] = [];
    if (data.engineSize) engine.push(data.engineSize);
    if (data.cylinders) engine.push(`${data.cylinders}-cylinder`);
    if (engine.length > 0) {
      parts.push(`${engine.join(' ')} engine.`);
    }
  }
  
  // Warranty
  if (data.warrantyType && data.warrantyType !== 'none') {
    const warrantyMap: Record<string, string> = {
      manufacturer: 'Under manufacturer warranty',
      extended: 'Extended warranty included',
      third_party: 'Third-party warranty available',
    };
    if (warrantyMap[data.warrantyType]) {
      parts.push(`${warrantyMap[data.warrantyType]}.`);
    }
  }
  
  // Closing
  if (data.isNegotiable) {
    parts.push('Open to reasonable offers.');
  }
  
  return parts.join(' ');
}

// ============================================================================
// Publish Step Component
// ============================================================================

export function PublishStep({ data, updateField, errors }: StepProps) {
  const emirateOptions = useMemo(
    () => UAE_EMIRATES.map((o) => ({ value: o.value, label: o.label })),
    []
  );

  const [noteDraft, setNoteDraft] = useState('');

  const images = (data.images ?? []) as ListingImage[];
  const imageKeys = images.map((img) => img.key);

  const ownerRemarks = (data.ownerRemarks ?? []) as string[];

  const addOwnerRemark = () => {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    if (ownerRemarks.length >= 10) return;
    updateField('ownerRemarks', [...ownerRemarks, trimmed]);
    setNoteDraft('');
  };

  const removeOwnerRemark = (index: number) => {
    const next = ownerRemarks.filter((_, i) => i !== index);
    updateField('ownerRemarks', next);
  };

  const setImages = (keys: string[]) => {
    updateField('images', mapKeysToImages(keys));
  };

  const negotiable = Boolean(data.isNegotiable);

  return (
    <div className="space-y-8">
      {/* Pricing */}
      <section>
        <SectionHeader title="Pricing" />
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldWrapper label="Price" required error={errors.price}>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={data.price ?? ''}
                onChange={(e) => updateField('price', parseInt(e.target.value || '0', 10) || 0)}
                placeholder="85,000"
                min={0}
                className={cn(
                  "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                  "outline-none transition-colors px-0 pr-14 text-sm font-medium",
                  "placeholder:text-muted-foreground/40"
                )}
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">
                AED
              </span>
            </div>
          </FieldWrapper>

          <FieldWrapper label="Negotiable" hint="Optional">
            <button
              type="button"
              onClick={() => updateField('isNegotiable', !negotiable)}
              className={cn(
                'flex items-center justify-between w-full h-12 px-0 transition-colors',
                'text-sm font-medium'
              )}
            >
              <span className="text-foreground">Allow offers</span>
              {negotiable ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40" />
              )}
            </button>
          </FieldWrapper>
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <SectionHeader title="Location" />
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldWrapper label="Emirate" required error={errors.emirate}>
            <Combobox
              options={emirateOptions}
              value={data.emirate || ''}
              onValueChange={(v) => updateField('emirate', v)}
              placeholder="Select emirate"
            />
          </FieldWrapper>

          <FieldWrapper label="City" hint="Optional">
            <input
              type="text"
              value={data.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Jumeirah"
              className={cn(
                "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                "outline-none transition-colors px-0 text-sm font-medium",
                "placeholder:text-muted-foreground/40"
              )}
            />
          </FieldWrapper>
          </div>
        </div>
      </section>

      {/* Photos */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <SectionHeader title="Photos" />
          <span className="text-xs text-muted-foreground/70">First = thumbnail</span>
        </div>
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
        
        <ImageUpload
          value={imageKeys}
          onChange={setImages}
          maxImages={20}
          directory="listings"
          label={undefined}
          optimized={true}
          deleteOnRemove={true}
          vin={data.vin}
        />
        {errors.images && <p className="text-xs font-semibold text-red-500 mt-3">{errors.images}</p>}
        </div>
      </section>

      {/* Description */}
      <section>
        <SectionHeader title="Description" />

        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3 space-y-6">

        <FieldWrapper label="Description" hint={`${(data.description || '').length}/750`} error={errors.description}>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                const generated = generateDescription(data);
                if (generated) updateField('description', generated);
              }}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Auto-generate for me
            </button>
            <textarea
              value={data.description || ''}
              onChange={(e) => updateField('description', normalizeText(e.target.value))}
              placeholder="Share what makes your car special — maintenance history, upgrades, or why you loved driving it. Auto-formatted for readability."
              rows={5}
              maxLength={750}
              className={cn(
                "w-full bg-transparent border-2 border-border/30 rounded-xl focus:border-primary",
                "outline-none transition-colors px-4 py-3 text-sm font-medium resize-none",
                "placeholder:text-muted-foreground/40"
              )}
            />
          </div>
        </FieldWrapper>

        {/* Owner Notes */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-semibold text-muted-foreground/70">
              Owner Notes
            </label>
            <span className="text-xs text-muted-foreground/70">max 10</span>
          </div>
          
          {/* Notes list */}
          {ownerRemarks.length > 0 && (
            <div className="space-y-2">
              {ownerRemarks.map((note, idx) => (
                <div
                  key={`${idx}-${note.slice(0, 10)}`}
                  className="flex items-center justify-between gap-3 p-3 bg-muted rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground">{note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOwnerRemark(idx)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                    aria-label="Remove note"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add note input */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={noteDraft}
              onChange={(e) => setNoteDraft(normalizeText(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOwnerRemark();
                }
              }}
              placeholder="Add a short note (e.g. Full service history)"
              className={cn(
                "flex-1 h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                "outline-none transition-colors px-0 text-sm font-medium",
                "placeholder:text-muted-foreground/40"
              )}
            />
            <button
              type="button"
              onClick={addOwnerRemark}
              disabled={!noteDraft.trim() || ownerRemarks.length >= 10}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>

          {errors.ownerRemarks && <p className="text-xs font-semibold text-red-500">{errors.ownerRemarks}</p>}
        </div>
        </div>
      </section>
    </div>
  );
}
