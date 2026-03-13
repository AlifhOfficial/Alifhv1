/**
 * Image Upload Component - Revvup Design System
 * Multi-image upload with preview and drag-and-drop reordering
 * 
 * Uses client-side compression + direct R2 upload for WhatsApp-like speed:
 * 1. Compress images client-side (parallel)
 * 2. Upload directly to R2 (parallel, no server processing)
 * 3. CDN URLs ready immediately
 * 
 * Speed: ~3-5 seconds for 10 images
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
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
import { getPublicUrl } from '@/utils/storage';
import { compressAndUploadListingImages } from '@/lib/storage';

// ============================================================================
// Sortable Image Item
// ============================================================================

interface SortableImageProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
}

function SortableImage({ id, url, index, onRemove }: SortableImageProps) {
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
      className={`relative group aspect-square rounded-xl overflow-hidden bg-muted/50 ${
        isDragging ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Upload ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="w-full h-full bg-muted/40 pointer-events-none" />
      )}
      
      {/* Drag handle - top left (always visible on mobile, hover on desktop) */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-black/60 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      {/* Delete button - top right (always visible on mobile, hover on desktop) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/80"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Thumbnail badge */}
      {index === 0 && (
        <div className="absolute bottom-2 left-2 px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg">
          Thumbnail
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
  /**
   * VIN for organizing images in R2 storage
   * Required - images stored under listings/{date}/{vin}/
   */
  vin: string;
  /**
   * Delete images from storage when removed from the list
   * @default true
   */
  deleteOnRemove?: boolean;
}

export function ImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 30,
  label = 'Upload Images',
  description = 'Add up to ' + maxImages + ' images',
  deleteOnRemove = true,
  vin,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<'compressing' | 'uploading'>('compressing');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (!vin || vin.length < 11) {
      alert('Valid VIN is required for image uploads');
      return;
    }

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Basic client-side type check
    const invalidFiles = filesToUpload.filter(f => 
      !f.type.startsWith('image/') && f.type !== '' && f.type !== 'application/octet-stream'
    );
    
    if (invalidFiles.length > 0) {
      alert('Only image files are allowed');
      return;
    }

    // Validate file sizes (max 30MB per image before compression)
    const maxSize = 30 * 1024 * 1024;
    const oversizedFiles = filesToUpload.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 30MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadPhase('compressing');

    try {
      // Compress and upload all files in parallel (WhatsApp-like speed)
      const results = await compressAndUploadListingImages(
        filesToUpload,
        vin,
        (completed, total) => {
          setUploadProgress(Math.round((completed / total) * 100));
          // Switch to uploading phase after half the files are done compressing
          if (completed > total / 2) {
            setUploadPhase('uploading');
          }
        },
        5, // 5 concurrent uploads
      );
      
      // Store full-size keys (thumb can be derived)
      const uploadedKeys = results.map(r => r.fullKey);
      onChange([...value, ...uploadedKeys]);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = value[index];
    
    // Update UI immediately for responsiveness
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
    
    // Delete from R2 storage if enabled
    if (deleteOnRemove && imageUrl) {
      setDeleting(index);
      try {
        // Extract key from URL or use as-is if already a key
        let key = imageUrl;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          try {
            const url = new URL(imageUrl);
            key = url.pathname.replace(/^\//, '');
          } catch {
            // If URL parsing fails, use as-is
          }
        }
        
        await fetch('/api/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ key }),
        });
        // Silently handle deletion - don't block UI on failure
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
        // Don't alert user - image is already removed from UI
      } finally {
        setDeleting(null);
      }
    }
  };

  // DnD sensors for pointer, touch and keyboard
  // TouchSensor needs delay to not conflict with scroll on mobile
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

  // Handle drag end - reorder images
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {label && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Image Grid - Sortable */}
      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {value.map((url, index) => (
                <SortableImage
                  key={url}
                  id={url}
                  url={url}
                  index={index}
                  onRemove={() => removeImage(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  {uploadPhase === 'compressing' ? 'Optimizing...' : 'Uploading...'} {uploadProgress}%
                </p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop or tap • {value.length}/{maxImages}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {value.length >= maxImages && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Maximum {maxImages} images reached
        </p>
      )}
    </div>
  );
}
