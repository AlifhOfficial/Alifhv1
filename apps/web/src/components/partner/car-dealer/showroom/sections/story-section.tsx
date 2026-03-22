/**
 * Brand Story Section Component
 * Brand story content, founder info, and philosophy
 */

'use client';

import React from 'react';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { EditableField, ImageUpload, VideoEmbedPreview } from '../components';

interface StorySectionProps {
  form: Partial<PartnerShowroom>;
  showroom: PartnerShowroom;
  imageUploading: string | null;
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
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
}

export function StorySection({
  form,
  showroom,
  imageUploading,
  getEditableFieldProps,
  uploadImage,
  removeImage,
  updateShowroom,
}: StorySectionProps) {
  return (
    <div className="space-y-6">
      {/* Brand Story */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Brand Story</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <ImageUpload
            value={form.brandStoryImage || null}
            displayUrl={showroom.brandStoryImageUrl}
            onUpload={(file) => uploadImage(file, 'brand-story-image', 'brandStoryImage')}
            onRemove={() => removeImage('brandStoryImage')}
            aspectRatio="aspect-[16/9]"
            label="Section image"
            isUploading={imageUploading === 'brandStoryImage'}
          />
          <EditableField
            {...getEditableFieldProps('brandStoryTitle')}
            label="Section Title"
            value={form.brandStoryTitle || 'Our Story'}
            placeholder="Our Story"
          />
          <EditableField
            {...getEditableFieldProps('brandStoryContent')}
            label="Story Content"
            value={form.brandStoryContent || null}
            placeholder="Tell your brand's story... (2-3 paragraphs)"
            type="textarea"
            maxLength={5000}
          />
          <EditableField
            {...getEditableFieldProps('brandPhilosophy')}
            label="Brand Philosophy"
            value={form.brandPhilosophy || null}
            placeholder="One-liner philosophy"
            maxLength={200}
          />

          {/* YouTube / Vimeo embed only — no raw video upload */}
          <div className="pt-2 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground/70">Story Video (YouTube URL)</p>
            <EditableField
              {...getEditableFieldProps('brandStoryVideoUrl')}
              label="YouTube / Vimeo URL"
              value={form.brandStoryVideoUrl || null}
              placeholder="https://youtube.com/... or https://vimeo.com/..."
              type="url"
            />
            {form.brandStoryVideoUrl && (
              <div className="space-y-2">
                <VideoEmbedPreview url={form.brandStoryVideoUrl} aspectRatio="aspect-video" />
                <button
                  onClick={async () => {
                    await updateShowroom({ brandStoryVideoUrl: null });
                  }}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                >
                  Remove video
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Founder</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              <ImageUpload
                value={form.founderImage || null}
                displayUrl={showroom.founderImageUrl}
                onUpload={(file) => uploadImage(file, 'founder-image', 'founderImage')}
                onRemove={() => removeImage('founderImage')}
                aspectRatio="aspect-square"
                label="Photo"
                isUploading={imageUploading === 'founderImage'}
              />
            </div>
            <div className="flex-1">
              <EditableField
                {...getEditableFieldProps('founderName')}
                label="Founder Name"
                value={form.founderName || null}
                placeholder="Ahmed Al Mansouri"
              />
            </div>
          </div>
          <EditableField
            {...getEditableFieldProps('founderTitle')}
            label="Title"
            value={form.founderTitle || null}
            placeholder="Founder & CEO"
          />
          <EditableField
            {...getEditableFieldProps('founderQuote')}
            label="Founder Quote"
            value={form.founderQuote || null}
            placeholder="A personal quote from the founder..."
            type="textarea"
          />
        </div>
      </section>
    </div>
  );
}
