/**
 * SEO & Settings Section Component
 * URL slug and SEO settings
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Loader2, X, Upload } from 'lucide-react';
import { getPublicUrl } from '@/utils';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { EditableField } from '../components';

interface SeoSectionProps {
  form: Partial<PartnerShowroom>;
  showroom: PartnerShowroom;
  imageUploading: string | null;
  partnerId: string;
  getEditableFieldProps: (field: keyof PartnerShowroom) => {
    isEditing: boolean;
    isUpdating: boolean;
    onStartEdit: () => void;
    onChange: (val: string | number | null) => void;
    onSave: () => void;
    onCancel: () => void;
  };
  uploadImage: (file: File, type: string, field: keyof PartnerShowroom) => Promise<void>;
  removeImage: (field: keyof PartnerShowroom) => Promise<void>;
}

export function SeoSection({
  form,
  showroom,
  imageUploading,
  partnerId,
  getEditableFieldProps,
  uploadImage,
  removeImage,
}: SeoSectionProps) {
  return (
    <div className="space-y-6">
      {/* URL & Slug - Hidden from UI, auto-generated */}

      {/* SEO */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">SEO</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <EditableField
            {...getEditableFieldProps('seoTitle')}
            label="Page Title"
            value={form.seoTitle || null}
            placeholder="Luxury Motors Dubai | Premium Car Showroom"
          />
          <EditableField
            {...getEditableFieldProps('seoDescription')}
            label="Meta Description"
            value={form.seoDescription || null}
            placeholder="Discover the finest collection of luxury vehicles..."
            type="textarea"
            maxLength={160}
          />
          
          {/* SEO Image / Open Graph */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-muted-foreground/70 mb-2">Social Share Image</p>
            <p className="text-xs text-muted-foreground/50 mb-3">Shown when sharing on social media (1200x630 recommended)</p>
            <div className="relative aspect-[1200/630] max-w-[300px] rounded-lg overflow-hidden bg-muted/30 border border-border/40 group">
              {form.seoImage ? (
                <>
                  <Image
                    key={form.seoImage}
                    src={getPublicUrl(form.seoImage) || form.seoImage}
                    alt="SEO preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => removeImage('seoImage')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) uploadImage(file, 'seo-image', 'seoImage');
                    }}
                  />
                  {imageUploading === 'seoImage' ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Upload image</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
