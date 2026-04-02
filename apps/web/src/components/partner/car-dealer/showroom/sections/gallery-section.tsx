/**
 * Gallery Section Component
 * Showroom gallery, virtual tour, and ambient style
 * Supports drag-and-drop reordering using @dnd-kit
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getPublicUrl } from '@/utils';
import { compressAndUploadShowroomImage } from '@/lib/storage';
import { Plus, X, GripVertical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { EditableField, ImageUpload, VideoEmbedPreview } from '../components';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ============================================================================
// Gallery upload narrative stages
// ============================================================================

const GALLERY_STAGES = [
  { until: 12, label: 'Looking at your photos…' },
  { until: 28, label: 'Arranging the shots…' },
  { until: 48, label: 'Sharpening the details…' },
  { until: 65, label: 'Correcting the colours…' },
  { until: 82, label: 'Almost showroom-ready…' },
  { until: 95, label: 'Finishing touches…' },
  { until: 100, label: 'Saving to your profile…' },
] as const;

function getGalleryMessage(p: number) {
  return GALLERY_STAGES.find(s => p < s.until)?.label ?? 'Saving to your profile…';
}

// ============================================================================
// Sortable Gallery Image Component
// ============================================================================

interface SortableGalleryImageProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
}

function SortableGalleryImage({ id, url, index, onRemove }: SortableGalleryImageProps) {
  const imageUrl = getPublicUrl(url);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-video rounded-lg overflow-hidden bg-muted/30 group ${
        isDragging ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
    >
      {imageUrl ? (
        <img 
          src={imageUrl}
          alt={`Gallery ${index + 1}`} 
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-muted/40 pointer-events-none" />
      )}
      
      {/* Drag handle - top left */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-3 h-3 text-white" />
      </button>
      
      {/* Delete button - top right */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-white" />
      </button>
      
      {/* Position badge */}
      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 text-white text-xs font-medium rounded">
        {index + 1}
      </div>
    </div>
  );
}

// ============================================================================
// Gallery Section Props
// ============================================================================

interface GallerySectionProps {
  form: Partial<PartnerShowroom>;
  showroom: PartnerShowroom;
  isUpdating: boolean;
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
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
  setForm: React.Dispatch<React.SetStateAction<Partial<PartnerShowroom>>>;
  setImageUploading: React.Dispatch<React.SetStateAction<string | null>>;
  uploadImage: (file: File, type: string, field: keyof PartnerShowroom) => Promise<void>;
  removeImage: (field: keyof PartnerShowroom) => Promise<void>;
  toast: (options: { title: string; variant?: 'default' | 'destructive' }) => void;
}

export function GallerySection({
  form,
  showroom,
  isUpdating: _isUpdating,
  imageUploading,
  partnerId,
  getEditableFieldProps,
  updateShowroom,
  setForm,
  setImageUploading,
  uploadImage,
  removeImage,
  toast,
}: GallerySectionProps) {
  // Local progress state for gallery uploads
  const [galleryRealProgress, setGalleryRealProgress] = useState(0);
  const [galleryDisplayProgress, setGalleryDisplayProgress] = useState(0);
  const fakeAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isGalleryUploading = imageUploading === 'showroomImages';

  // Fake 0→40% animation when gallery upload starts
  useEffect(() => {
    if (isGalleryUploading) {
      setGalleryDisplayProgress(0);
      setGalleryRealProgress(0);
      let current = 0;
      fakeAnimRef.current = setInterval(() => {
        current += 4;
        if (current >= 40) { current = 40; clearInterval(fakeAnimRef.current!); }
        setGalleryDisplayProgress(current);
      }, 50);
    } else {
      if (fakeAnimRef.current) clearInterval(fakeAnimRef.current);
      setGalleryDisplayProgress(0);
    }
    return () => { if (fakeAnimRef.current) clearInterval(fakeAnimRef.current); };
  }, [isGalleryUploading]);

  // Map real progress (0–100) into the 40–100 display range
  useEffect(() => {
    if (galleryRealProgress > 0) {
      setGalleryDisplayProgress(prev => Math.max(prev, Math.round(40 + galleryRealProgress * 0.6)));
    }
  }, [galleryRealProgress]);

  // DnD sensors for pointer, touch and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts (desktop)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Hold 200ms before drag starts on touch
        tolerance: 5, // Allow 5px movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder images and persist
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const images = form.showroomImages || [];
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      const reordered = arrayMove(images, oldIndex, newIndex);
      
      // Update form immediately for responsive UI
      setForm((prev) => ({ ...prev, showroomImages: reordered }));
      
      // Persist the new order
      await updateShowroom({ showroomImages: reordered });
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Section Media</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <ImageUpload
            value={form.gallerySectionImage || null}
            displayUrl={showroom.gallerySectionImageUrl}
            onUpload={(file) => uploadImage(file, 'gallery-section-image', 'gallerySectionImage')}
            onRemove={() => removeImage('gallerySectionImage')}
            aspectRatio="aspect-[16/9]"
            label="Gallery section image"
            isUploading={imageUploading === 'gallerySectionImage'}
          />
          <EditableField
            {...getEditableFieldProps('gallerySectionVideoUrl')}
            label="YouTube / Vimeo URL"
            value={form.gallerySectionVideoUrl || null}
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            type="url"
          />
          {form.gallerySectionVideoUrl && (
            <VideoEmbedPreview url={form.gallerySectionVideoUrl} aspectRatio="aspect-video" />
          )}
        </div>
      </section>

      {/* Gallery Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Showroom Gallery</h3>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">{form.showroomImages?.length || 0}/12</span>
            <p className="text-[11px] text-muted-foreground/70">Drag images to reorder</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={form.showroomImages || []} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(form.showroomImages || []).map((img, idx) => (
                  <SortableGalleryImage
                    key={img}
                    id={img}
                    url={img}
                    index={idx}
                    onRemove={async () => {
                      const updated = (form.showroomImages || []).filter((_, i) => i !== idx);
                      await updateShowroom({ showroomImages: updated });
                    }}
                  />
                ))}
                {(form.showroomImages?.length || 0) < 12 && (
                  <label className="aspect-video rounded-lg border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        e.target.value = '';
                        if (!files.length) return;
                        
                        // Limit to remaining slots
                        const remaining = 12 - (form.showroomImages?.length || 0);
                        const toUpload = files.slice(0, remaining);
                    
                    if (files.length > remaining) {
                      toast({ title: `Only uploading ${remaining} images (max 12)`, variant: 'default' });
                    }
                    
                    // Check file sizes (15MB max each)
                    const maxSize = 15 * 1024 * 1024;
                    const oversized = toUpload.filter(f => f.size > maxSize);
                    if (oversized.length > 0) {
                      toast({ title: `${oversized.length} image(s) too large (max 15MB each)`, variant: 'destructive' });
                      return;
                    }
                    
                    setImageUploading('showroomImages');
                    try {
                      // Upload all in parallel simultaneously
                      let completed = 0;
                      const uploadedKeys = await Promise.all(
                        toUpload.map(async (file) => {
                          const result = await compressAndUploadShowroomImage(file, partnerId, 'gallery');
                          completed++;
                          setGalleryRealProgress(Math.round((completed / toUpload.length) * 100));
                          return result.key;
                        })
                      );

                      const updated = [...(form.showroomImages || []), ...uploadedKeys];
                      await updateShowroom({ showroomImages: updated });
                      toast({ title: `${uploadedKeys.length} image${uploadedKeys.length > 1 ? 's' : ''} uploaded` });
                    } catch {
                      toast({ title: 'Upload failed', variant: 'destructive' });
                    } finally {
                      setImageUploading(null);
                    }
                  }}
                />
                {imageUploading === 'showroomImages' ? (
                  <span className="text-xs text-muted-foreground">Uploading…</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add photos</span>
                  </>
                )}
              </label>
            )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Progress bar — shown while gallery images are uploading */}
          {isGalleryUploading && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground transition-all duration-500">
                {getGalleryMessage(galleryDisplayProgress)}
              </p>
              <Progress value={galleryDisplayProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {galleryDisplayProgress < 40 ? 'Preparing…' : `${galleryDisplayProgress}% complete`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Virtual Tour */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Virtual Tour</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <EditableField
            {...getEditableFieldProps('showroomVideoTourUrl')}
            label="360° Tour / YouTube URL"
            value={form.showroomVideoTourUrl || null}
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            type="url"
          />
          {form.showroomVideoTourUrl && (
            <div className="space-y-2">
              <VideoEmbedPreview url={form.showroomVideoTourUrl} aspectRatio="aspect-video" />
              <button
                onClick={async () => {
                  await updateShowroom({ showroomVideoTourUrl: null });
                }}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Remove tour
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Ambient Style - Hidden from UI, using default 'modern' style */}
    </div>
  );
}
