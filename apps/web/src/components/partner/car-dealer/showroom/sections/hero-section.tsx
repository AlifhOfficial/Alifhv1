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

type HeroTab = 'image' | 'video' | 'youtube';

function deriveActiveTab(form: Partial<PartnerShowroom>): HeroTab {
  if (form.heroBackgroundType === 'video') {
    return form.heroVideoFile || form.heroVideoUrl ? 
      (form.heroVideoFile ? 'video' : 'youtube') : 'video';
  }
  return 'image';
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
  toast: _toast,
}: HeroSectionProps) {
  const [activeTab, setActiveTab] = React.useState<HeroTab>(() => deriveActiveTab(form));

  const switchTab = async (tab: HeroTab) => {
    setActiveTab(tab);
    if (tab === 'image') {
      await updateShowroom({ heroBackgroundType: 'image' });
    } else {
      await updateShowroom({ heroBackgroundType: 'video' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tagline & CTA — Primary content */}
      <section>
        <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">Tagline & CTA</h3>
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
              <p className="text-caption2 text-muted-foreground/60">Leave empty → scrolls to contact section</p>
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
              <p className="text-caption2 text-muted-foreground/60">Leave empty → links to your inventory page</p>
            </div>
          </div>
        </div>
      </section>

      {/* Background — single choice, no fallbacks */}
      <section>
        <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">Background</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border/40">
            {([
              { id: 'image', label: 'Image' },
              { id: 'video', label: 'Video File' },
              { id: 'youtube', label: 'YouTube URL' },
            ] as { id: HeroTab; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={cn(
                  "flex-1 py-2.5 text-caption1 font-semibold transition-colors border-b-2 -mb-px",
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === 'image' && (
              <ImageUpload
                value={form.heroImage || null}
                displayUrl={showroom.heroImageUrl}
                onUpload={(file) => uploadImage(file, 'hero-image', 'heroImage')}
                onRemove={() => removeImage('heroImage')}
                aspectRatio="aspect-[16/9]"
                label="Upload hero image (1920×1080 recommended)"
                isUploading={imageUploading === 'heroImage'}
              />
            )}

            {activeTab === 'video' && (
              <VideoUpload
                value={form.heroVideoFile || null}
                displayUrl={showroom.heroVideoFileUrl}
                onUpload={(file) => uploadVideo(file, 'hero-video', 'heroVideoFile')}
                onRemove={() => removeVideo('heroVideoFile')}
                aspectRatio="aspect-video"
                label="MP4, WebM, MOV • Max 50MB"
                isUploading={videoUploading === 'heroVideoFile'}
                uploadProgress={uploadProgress}
              />
            )}

            {activeTab === 'youtube' && (
              <div className="space-y-3">
                <EditableField
                  {...getEditableFieldProps('heroVideoUrl')}
                  label="YouTube URL"
                  value={form.heroVideoUrl || null}
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                />
                {form.heroVideoUrl && (
                  <div className="space-y-2">
                    <VideoEmbedPreview url={form.heroVideoUrl} aspectRatio="aspect-video" />
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          await updateShowroom({ heroVideoUrl: null });
                          updateField('heroVideoUrl', null);
                        }}
                        className="text-caption1 text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
