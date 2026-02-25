/**
 * Hero Section Component
 * Hero content, background media, brand colors, and call-to-action settings
 */

'use client';

import React from 'react';
import { cn } from '@/utils';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { EditableField, ImageUpload, VideoUpload, VideoEmbedPreview } from '../components';

interface HeroSectionProps {
  form: Partial<PartnerShowroom>;
  showroom: PartnerShowroom;
  imageUploading: string | null;
  videoUploading: string | null;
  uploadProgress: number;
  updateField: <K extends keyof PartnerShowroom>(field: K, value: PartnerShowroom[K]) => void;
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
  uploadVideo: (file: File, type: string, field: keyof PartnerShowroom) => Promise<void>;
  removeVideo: (field: keyof PartnerShowroom) => Promise<void>;
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
  toast?: (options: { title: string; variant?: 'default' | 'destructive' }) => void;
}

export function HeroSection({
  form,
  showroom,
  imageUploading,
  videoUploading,
  uploadProgress,
  updateField,
  getEditableFieldProps,
  uploadImage,
  removeImage,
  uploadVideo,
  removeVideo,
  updateShowroom,
  toast,
}: HeroSectionProps) {
  const [savingColor, setSavingColor] = React.useState<'primary' | 'accent' | null>(null);
  const currentBgType = form.heroBackgroundType || 'image';
  const hasVideo = !!form.heroVideoFile || showroom.heroVideoFileUrl;
  const hasEmbedUrl = !!form.heroVideoUrl && !form.heroVideoUrl.startsWith('/');
  const hasImage = !!form.heroImage || !!showroom.heroImageUrl;

  const saveColor = async (field: 'primaryColor' | 'accentColor') => {
    const colorType = field === 'primaryColor' ? 'primary' : 'accent';
    setSavingColor(colorType);
    try {
      await updateShowroom({ [field]: form[field] });
      toast?.({ title: `${colorType === 'primary' ? 'Primary' : 'Accent'} color saved` });
    } finally {
      setTimeout(() => setSavingColor(null), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tagline & CTA — Primary content */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Tagline & CTA</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <EditableField
            {...getEditableFieldProps('heroTagline')}
            label="Hero Tagline"
            value={form.heroTagline || null}
            placeholder="Where Dreams Meet the Road"
            maxLength={80}
          />
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-3">
              <EditableField
                {...getEditableFieldProps('heroCtaText')}
                label="Primary CTA Button"
                value={form.heroCtaText ?? null}
                placeholder="Talk to Us"
                maxLength={30}
              />
              <EditableField
                {...getEditableFieldProps('heroCtaLink')}
                label="Primary CTA Link (optional)"
                value={form.heroCtaLink ?? null}
                placeholder="https://wa.me/971... or your website"
                type="url"
              />
              <p className="text-[10px] text-muted-foreground/60">Leave empty → scrolls to contact section</p>
            </div>
            <div className="space-y-3">
              <EditableField
                {...getEditableFieldProps('heroCtaSecondaryText')}
                label="Secondary CTA Button"
                value={form.heroCtaSecondaryText ?? null}
                placeholder="Browse Collection"
                maxLength={30}
              />
              <EditableField
                {...getEditableFieldProps('heroCtaSecondaryLink')}
                label="Secondary CTA Link (optional)"
                value={form.heroCtaSecondaryLink ?? null}
                placeholder="https://yourwebsite.com/cars"
                type="url"
              />
              <p className="text-[10px] text-muted-foreground/60">Leave empty → links to your inventory page</p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Type + Brand Colors (grouped — colors affect gradient) */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Background</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-5">
          {/* Display Type */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground/70">Display Type</p>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'video', label: 'Video' },
                { type: 'image', label: 'Image' },
                { type: 'gradient', label: 'Gradient' }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={async () => {
                    await updateShowroom({ heroBackgroundType: type as 'video' | 'image' | 'gradient' });
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                    currentBgType === type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {currentBgType === 'video' && !hasVideo && !hasEmbedUrl && (
              <p className="text-xs text-amber-500">⚠ No video uploaded — add one below or switch to Image/Gradient</p>
            )}
            {currentBgType === 'image' && !hasImage && (
              <p className="text-xs text-amber-500">⚠ No image uploaded — add one below or switch to Gradient</p>
            )}
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Hero Image</h3>
          {currentBgType === 'video' && (
            <span className="text-[10px] text-muted-foreground/60">• Fallback if video fails</span>
          )}
        </div>
        <div className={cn(
          "rounded-xl border bg-sidebar p-5 space-y-4",
          currentBgType === 'image' ? 'border-primary/30' : 'border-border/40'
        )}>
          <ImageUpload
            value={form.heroImage || null}
            displayUrl={showroom.heroImageUrl}
            onUpload={(file) => uploadImage(file, 'hero-image', 'heroImage')}
            onRemove={() => removeImage('heroImage')}
            aspectRatio="aspect-[16/9]"
            label="Upload hero image (1920×1080)"
            isUploading={imageUploading === 'heroImage'}
          />
          {hasImage && currentBgType !== 'image' && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ Ready as fallback</p>
          )}
        </div>
      </section>

      {/* Hero Video */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Hero Video</h3>
        <div className={cn(
          "rounded-xl border bg-sidebar p-5 space-y-4",
          currentBgType === 'video' ? 'border-primary/30' : 'border-border/40'
        )}>
          {/* Upload Option */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground/70">Upload Video File</p>
            <VideoUpload
              value={form.heroVideoFile || null}
              displayUrl={showroom.heroVideoFileUrl}
              onUpload={(file) => uploadVideo(file, 'hero-video', 'heroVideoFile')}
              onRemove={() => removeVideo('heroVideoFile')}
              aspectRatio="aspect-video"
              label="MP4, WebM, MOV • Max 50MB (compress to 1080p)"
              isUploading={videoUploading === 'heroVideoFile'}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/20" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-sidebar px-2 text-muted-foreground/50">or embed from</span>
            </div>
          </div>

          {/* Embed URL */}
          <EditableField
            {...getEditableFieldProps('heroVideoUrl')}
            label="YouTube / Vimeo URL"
            value={form.heroVideoUrl || null}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            type="url"
          />
          
          {form.heroVideoUrl && (
            <button
              onClick={async () => {
                await updateShowroom({ heroVideoUrl: null });
              }}
              className="text-xs text-destructive hover:text-destructive/80 transition-colors"
            >
              Remove embed URL
            </button>
          )}
          
          {hasEmbedUrl && (
            <VideoEmbedPreview url={form.heroVideoUrl!} aspectRatio="aspect-video" />
          )}

          {/* Priority note */}
          {hasVideo && hasEmbedUrl && (
            <p className="text-[10px] text-muted-foreground/60 border-t border-border/20 pt-3">
              Uploaded video takes priority over embed URL
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
