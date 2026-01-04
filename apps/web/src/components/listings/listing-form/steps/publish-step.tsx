'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import { Combobox } from '../combobox';
import { FormField } from '../form-field';
import { UAE_EMIRATES } from '../constants';
import type { ListingImage } from '../types';
import type { StepProps } from './types';
import { ImageUpload } from '@/components/ui/forms/image-upload';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="p-6 sm:p-7 bg-background border border-border/50 rounded-2xl">
      <header className="space-y-1.5 mb-6">
        <h3 className="text-[16px] sm:text-[17px] font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-[14px] text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function mapKeysToImages(keys: string[]): ListingImage[] {
  return keys
    .filter((k) => typeof k === 'string' && k.trim().length > 0)
    .map((key, order) => ({ key, order }));
}

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
    <div className="space-y-6">
      <Card title="Pricing" subtitle="Clear pricing improves response rate.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Price" required error={errors.price}>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={data.price ?? ''}
                onChange={(e) => updateField('price', parseInt(e.target.value || '0', 10) || 0)}
                placeholder="e.g. 85,000"
                min={0}
                className={cn(
                  'w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 pr-16 text-[15px] font-medium placeholder:text-muted-foreground/50'
                )}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted-foreground">
                AED
              </div>
            </div>
          </FormField>

          <FormField label="Negotiable" hint="Optional">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/10 px-4 py-3 hover:bg-muted/20 transition-colors">
              <span className="text-[14px] font-medium text-foreground">Allow offers</span>
              <input
                type="checkbox"
                checked={negotiable}
                onChange={(e) => updateField('isNegotiable', e.target.checked)}
                className="h-4 w-4 accent-foreground"
              />
            </label>
          </FormField>
        </div>
      </Card>

      <Card title="Location" subtitle="Where the car can be viewed.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Emirate" required error={errors.emirate}>
            <Combobox
              options={emirateOptions}
              value={data.emirate || ''}
              onValueChange={(v) => updateField('emirate', v)}
              placeholder="Select emirate..."
            />
          </FormField>

          <FormField label="City" hint="Optional">
            <input
              type="text"
              value={data.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="e.g. Jumeirah"
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>
        </div>
      </Card>

      <Card title="Photos" subtitle="Add clear, well-lit images. First photo becomes the thumbnail.">
        <ImageUpload
          value={imageKeys}
          onChange={setImages}
          maxImages={20}
          directory="listings"
          label={undefined}
        />
        {errors.images && <p className="mt-3 text-sm font-medium text-red-500">{errors.images}</p>}
      </Card>

      <Card title="Description" subtitle="Optional, but helps buyers understand condition and history.">
        <div className="space-y-6">
          <FormField label="Description" hint="Optional" error={errors.description}>
            <textarea
              value={data.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe maintenance, modifications, and anything a buyer should know."
              rows={6}
              className="w-full bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 py-3 text-[15px] font-medium placeholder:text-muted-foreground/50 resize-none"
            />
          </FormField>

          <FormField label="Owner Notes" hint="Optional (max 10)">
            <div className="space-y-3">
              {ownerRemarks.length > 0 && (
                <div className="space-y-2">
                  {ownerRemarks.map((note, idx) => (
                    <div
                      key={`${idx}-${note.slice(0, 10)}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-muted/10 px-4 py-3"
                    >
                      <p className="text-[14px] text-foreground leading-relaxed">{note}</p>
                      <button
                        type="button"
                        onClick={() => removeOwnerRemark(idx)}
                        className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        aria-label="Remove note"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-3">
                <input
                  type="text"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add a short note (e.g. Full service history)"
                  className="flex-1 h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={addOwnerRemark}
                  disabled={!noteDraft.trim() || ownerRemarks.length >= 10}
                  className="h-12 px-5 rounded-xl bg-foreground text-background text-[14px] font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40"
                >
                  Add
                </button>
              </div>

              {errors.ownerRemarks && <p className="text-sm font-medium text-red-500">{errors.ownerRemarks}</p>}
            </div>
          </FormField>

          <FormField label="Video URL" hint="Optional" error={errors.videoUrl}>
            <input
              type="url"
              value={data.videoUrl || ''}
              onChange={(e) => updateField('videoUrl', e.target.value)}
              placeholder="https://..."
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>
        </div>
      </Card>
    </div>
  );
}
