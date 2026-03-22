/**
 * Testimonials Section Component
 * Customer testimonials management
 */

'use client';

import React, { useState } from 'react';
import { Plus, MessageSquareQuote, RefreshCw } from 'lucide-react';
import { compressAndUploadShowroomImage } from '@/lib/storage';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import type { ShowroomTestimonial } from '@alifh/database';
import { EditableField, ImageUpload, TestimonialCard, VideoEmbedPreview } from '../components';

interface TestimonialsSectionProps {
  form: Partial<PartnerShowroom>;
  showroom: PartnerShowroom;
  partnerId: string;
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
  setImageUploading: React.Dispatch<React.SetStateAction<string | null>>;
  toast: (options: { title: string; variant?: 'default' | 'destructive' }) => void;
}

export function TestimonialsSection({
  form,
  showroom,
  partnerId,
  imageUploading,
  getEditableFieldProps,
  uploadImage,
  removeImage,
  updateShowroom,
  setImageUploading,
  toast,
}: TestimonialsSectionProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [onlyFiveStar, setOnlyFiveStar] = useState(false);

  const syncGoogleReviews = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/partner/google-reviews/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlyFiveStar }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || 'Sync failed', variant: 'destructive' });
        return;
      }
      // Reload showroom to pick up newly synced testimonials
      await updateShowroom({});
      toast({ title: `Synced ${data.reviews?.length ?? 0} Google reviews${onlyFiveStar ? ' (5★ only)' : ''}` });
    } catch {
      toast({ title: 'Sync failed', variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  };
  const addTestimonial = async () => {
    const newTestimonial: ShowroomTestimonial = {
      id: crypto.randomUUID(),
      customerName: 'Customer Name',
      customerTitle: null,
      customerImage: null,
      content: 'Their testimonial...',
      rating: 5,
      vehiclePurchased: null,
      videoUrl: null,
      order: (form.featuredTestimonials?.length || 0),
    };
    const updated = [...(form.featuredTestimonials || []), newTestimonial];
    await updateShowroom({ featuredTestimonials: updated });
  };

  const updateTestimonial = async (id: string, updates: Partial<ShowroomTestimonial>) => {
    const updated = (form.featuredTestimonials || []).map(t => t.id === id ? { ...t, ...updates } : t);
    await updateShowroom({ featuredTestimonials: updated });
  };

  const removeTestimonial = async (id: string) => {
    const updated = (form.featuredTestimonials || []).filter(t => t.id !== id);
    await updateShowroom({ featuredTestimonials: updated });
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Section Media</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <ImageUpload
            value={form.testimonialsSectionImage || null}
            displayUrl={showroom.testimonialsSectionImageUrl}
            onUpload={(file) => uploadImage(file, 'testimonials-section-image', 'testimonialsSectionImage')}
            onRemove={() => removeImage('testimonialsSectionImage')}
            aspectRatio="aspect-[16/9]"
            label="Testimonials section image"
            isUploading={imageUploading === 'testimonialsSectionImage'}
          />
          <EditableField
            {...getEditableFieldProps('testimonialsSectionVideoUrl')}
            label="YouTube / Vimeo URL"
            value={form.testimonialsSectionVideoUrl || null}
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            type="url"
          />
          {form.testimonialsSectionVideoUrl && (
            <VideoEmbedPreview url={form.testimonialsSectionVideoUrl} aspectRatio="aspect-video" />
          )}
        </div>
      </section>

      {/* Featured Testimonials */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Featured Testimonials</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyFiveStar}
                onChange={(e) => setOnlyFiveStar(e.target.checked)}
                className="w-3.5 h-3.5 accent-yellow-500"
              />
              <span className="text-xs text-muted-foreground">5★ only</span>
            </label>
            <button
              onClick={syncGoogleReviews}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing…' : 'Sync Google'}
            </button>
            <button
              onClick={addTestimonial}
              disabled={(form.featuredTestimonials?.length || 0) >= 5}
              className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {(form.featuredTestimonials || []).map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial.id}-${index}`}
              testimonial={testimonial}
              onUpdate={(updates) => updateTestimonial(testimonial.id, updates)}
              onRemove={() => removeTestimonial(testimonial.id)}
              onImageUpload={async (file) => {
                if (file.size > 15 * 1024 * 1024) {
                  toast({ title: 'Image too large. Max 15MB', variant: 'destructive' });
                  return;
                }
                setImageUploading(`testimonial-${testimonial.id}`);
                try {
                  const result = await compressAndUploadShowroomImage(file, partnerId, 'testimonial-image');
                  await updateTestimonial(testimonial.id, { customerImage: result.key });
                } catch {
                  toast({ title: 'Upload failed', variant: 'destructive' });
                } finally {
                  setImageUploading(null);
                }
              }}
              isUploading={imageUploading === `testimonial-${testimonial.id}`}
            />
          ))}
          {(form.featuredTestimonials?.length || 0) === 0 && (
            <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
              <MessageSquareQuote className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No testimonials yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Title */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Display</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <EditableField
            {...getEditableFieldProps('testimonialsSectionTitle')}
            label="Section Heading"
            value={form.testimonialsSectionTitle || 'What Our Clients Say'}
            placeholder="What Our Clients Say"
          />
        </div>
      </section>
    </div>
  );
}

