/**
 * Gallery Section Component
 * Showroom gallery, virtual tour, and ambient style
 * Supports drag-and-drop reordering using @dnd-kit
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { getPublicUrl } from '@/utils';
import { compressAndUploadShowroomImage } from '@/lib/storage';
import { Plus, X, Loader2, GripVertical } from 'lucide-react';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { EditableField, VideoUpload, VideoEmbedPreview } from '../components';
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
        <Image 
          src={imageUrl}
          alt={`Gallery ${index + 1}`} 
          fill 
          className="object-cover pointer-events-none" 
          unoptimized 
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
  videoUploading: string | null;
  uploadProgress: number;
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
  uploadVideo: (file: File, type: string, field: keyof PartnerShowroom) => Promise<void>;
  removeVideo: (field: keyof PartnerShowroom) => Promise<void>;
  toast: (options: { title: string; variant?: 'default' | 'destructive' }) => void;
}

export function GallerySection({
  form,
  showroom,
  isUpdating,
  imageUploading,
  videoUploading,
  uploadProgress,
  partnerId,
  getEditableFieldProps,
  updateShowroom,
  setForm,
  setImageUploading,
  uploadVideo,
  removeVideo,
  toast,
}: GallerySectionProps) {
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
      {/* Gallery Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Showroom Gallery</h3>
          <span className="text-sm text-muted-foreground">{form.showroomImages?.length || 0}/12</span>
        </div>
        
        {/* Guidance Note */}
        <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground/80">First 6 images</span> — Showcase your showroom, facilities, team, and brand infrastructure.{' '}
            <span className="font-medium text-foreground/80">Remaining images</span> — Used as ambient visuals across your profile sections for brand presence.
            <span className="block mt-1 text-muted-foreground/70">Drag images to reorder.</span>
          </p>
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
                      // Upload via presigned pipeline in parallel batches of 3
                      const batchSize = 3;
                      const uploadedKeys: string[] = [];
                      
                      for (let i = 0; i < toUpload.length; i += batchSize) {
                        const batch = toUpload.slice(i, i + batchSize);
                        const results = await Promise.all(
                          batch.map(async (file) => {
                            const result = await compressAndUploadShowroomImage(file, partnerId, 'gallery');
                            return result.key;
                          })
                        );
                        uploadedKeys.push(...results);
                      }

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
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
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
        </div>
      </section>

      {/* Virtual Tour */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Virtual Tour</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          {/* Upload Video Tour */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground/70 mb-2">Upload Video Tour</p>
            <VideoUpload
              value={form.showroomVideoTourFile || null}
              displayUrl={showroom.showroomVideoTourFileUrl}
              onUpload={(file) => uploadVideo(file, 'showroom-tour-video', 'showroomVideoTourFile')}
              onRemove={() => removeVideo('showroomVideoTourFile')}
              aspectRatio="aspect-video"
              label="Tour video • Max 50MB (compress to 1080p)"
              isUploading={videoUploading === 'showroomVideoTourFile'}
              uploadProgress={uploadProgress}
            />
          </div>
          
          {/* Or embed from YouTube/Vimeo */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/20" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-sidebar px-2 text-muted-foreground/50">or embed from</span>
            </div>
          </div>
          
          <EditableField
            {...getEditableFieldProps('showroomVideoTourUrl')}
            label="360° Tour / Video URL"
            value={form.showroomVideoTourUrl || null}
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            type="url"
          />
          
          {form.showroomVideoTourUrl && (
            <button
              onClick={async () => {
                await updateShowroom({ showroomVideoTourUrl: null });
              }}
              className="text-xs text-destructive hover:text-destructive/80 transition-colors"
            >
              Remove embed URL
            </button>
          )}
          
          {/* Virtual Tour Preview */}
          {form.showroomVideoTourUrl && (
            <VideoEmbedPreview url={form.showroomVideoTourUrl} aspectRatio="aspect-video" />
          )}
        </div>
      </section>

      {/* Ambient Style - Hidden from UI, using default 'modern' style */}
    </div>
  );
}
