/**
 * SEO & Settings Section Component
 * URL slug and SEO settings
 */

'use client';

import React from 'react';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { EditableField, ImageUpload } from '../components';

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
            <p className="text-sm font-semibold text-muted-foreground/70 mb-2">Social Share Image (OG Image)</p>
            <div className="text-xs text-muted-foreground/60 mb-3 space-y-1">
              <p>This image appears when your showroom link is shared on:</p>
              <ul className="list-disc list-inside pl-1 space-y-0.5">
                <li>WhatsApp, iMessage, Telegram</li>
                <li>Facebook, LinkedIn, Twitter/X</li>
                <li>Google search results (rich snippets)</li>
              </ul>
              <p className="mt-1.5 text-muted-foreground/50">Best size: 1200×630px (landscape). Use your logo on a branded background.</p>
            </div>
            <div className="max-w-[320px]">
              <ImageUpload
                value={form.seoImage || null}
                displayUrl={showroom.seoImage}
                onUpload={(file) => uploadImage(file, 'seo-image', 'seoImage')}
                onRemove={() => removeImage('seoImage')}
                aspectRatio="aspect-[1200/630]"
                label="Upload social share image"
                isUploading={imageUploading === 'seoImage'}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
