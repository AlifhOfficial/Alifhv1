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

import { useState, useRef, useEffect } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
import { toast } from 'sonner';

// ============================================================================
// Upload narrative stages — car marketplace copy, text-only, no emojis
// ============================================================================

const UPLOAD_STAGES = [
  { until: 12, label: 'Looking at your photos…' },
  { until: 28, label: 'Arranging the shots…' },
  { until: 48, label: 'Sharpening the details…' },
  { until: 65, label: 'Correcting the colours…' },
  { until: 82, label: 'Almost showroom-ready…' },
  { until: 95, label: 'Finishing touches…' },
  { until: 100, label: 'Saving to your listing…' },
] as const;

function getUploadMessage(progress: number) {
  return UPLOAD_STAGES.find(s => progress < s.until)?.label ?? 'Saving to your listing…';
}

// ============================================================================
// Sortable Image Item
// ============================================================================

interface SortableImageProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
  blobOverride?: string; // blob URL from cache — avoids CDN re-fetch
}

function SortableImage({ id, url, index, onRemove, blobOverride }: SortableImageProps) {
  const imageUrl = blobOverride ?? getPublicUrl(url);
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
      className={`relative group aspect-video rounded-xl overflow-hidden bg-muted/50 ${
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
        <div className="absolute bottom-2 left-2 px-2.5 py-1.5 bg-primary text-primary-foreground text-caption1 rounded-lg">
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
  const [displayProgress, setDisplayProgress] = useState(0);
  const fakeAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [_deleting, setDeleting] = useState<number | null>(null);

  // Animate 0 → 40% immediately when upload starts for perceived speed
  useEffect(() => {
    if (uploading) {
      setDisplayProgress(0);
      let current = 0;
      fakeAnimRef.current = setInterval(() => {
        current += 4;
        if (current >= 40) {
          current = 40;
          clearInterval(fakeAnimRef.current!);
        }
        setDisplayProgress(current);
      }, 50);
    } else {
      if (fakeAnimRef.current) clearInterval(fakeAnimRef.current);
      setDisplayProgress(0);
    }
    return () => { if (fakeAnimRef.current) clearInterval(fakeAnimRef.current); };
  }, [uploading]);

  // Map real progress (0–100) to display range (40–100)
  useEffect(() => {
    if (uploadProgress > 0) {
      setDisplayProgress(prev => Math.max(prev, Math.round(40 + uploadProgress * 0.6)));
    }
  }, [uploadProgress]);
  const [dragActive, setDragActive] = useState(false);
  // Optimistic previews: blob URL shown immediately while uploading
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  // After upload: maps CDN key → blob URL so browser doesn't re-fetch from CDN
  const [blobCache, setBlobCache] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (!vin || vin.length < 11) {
      toast.error('VIN required', { 
        description: 'A valid VIN (minimum 11 characters) is required to upload listing images. Please go back and enter the VIN first.' 
      });
      return;
    }

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast.error(`Max ${maxImages} images reached`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // HEIC/HEIF can't be decoded by browser Canvas — treat as unsupported
    const UNSUPPORTED_TYPES = ['image/heic', 'image/heif'];
    const invalidFiles = filesToUpload.filter(f =>
      (!f.type.startsWith('image/') && f.type !== '' && f.type !== 'application/octet-stream') ||
      UNSUPPORTED_TYPES.includes(f.type.toLowerCase())
    );
    
    if (invalidFiles.length > 0) {
      toast.error("Can't read this image", {
        description: "This file format isn't supported in the browser. Try converting to JPG or PNG first.",
      });
      return;
    }

    // Validate file sizes (max 30MB per image before compression)
    const maxSize = 30 * 1024 * 1024;
    const oversizedFiles = filesToUpload.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('File too large', { description: `Each image must be under 30MB. ${oversizedFiles.length > 1 ? `${oversizedFiles.length} files are` : '1 file is'} too large.` });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Create blob URL previews immediately — user sees images right away
    const blobUrls = filesToUpload.map(f => URL.createObjectURL(f));
    setPendingPreviews(blobUrls);

    try {
      // Upload all files (preshrink + parallel Fly calls)
      const results = await compressAndUploadListingImages(
        filesToUpload,
        vin,
        (completed, total) => {
          setUploadProgress(Math.round((completed / total) * 100));
        },
      );

      // Map CDN key → blob URL so SortableImage keeps using local memory, no CDN re-fetch
      const newBlobCache: Record<string, string> = {};
      const uploadedKeys = results.map((r, i) => {
        newBlobCache[r.fullKey] = blobUrls[i];
        return r.fullKey;
      });
      setBlobCache(prev => ({ ...prev, ...newBlobCache }));
      onChange([...value, ...uploadedKeys]);
    } catch (error: any) {
      console.error('Upload error:', error);
      // Revoke on failure
      blobUrls.forEach(u => URL.revokeObjectURL(u));
      toast.error('Upload failed', { description: error.message || 'Something went wrong. Please try again.' });
    } finally {
      // Don't revoke blob URLs — they're still used in blobCache for display
      setPendingPreviews([]);
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = '';
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
    const imageKey = value[index];

    // Update UI immediately for responsiveness
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);

    // Revoke cached blob URL if present (free memory)
    if (blobCache[imageKey]) {
      URL.revokeObjectURL(blobCache[imageKey]);
      setBlobCache(prev => { const n = { ...prev }; delete n[imageKey]; return n; });
    }

    // Delete from R2 storage if enabled
    if (deleteOnRemove && imageKey) {
      setDeleting(index);
      try {
        // Extract key from URL or use as-is if already a key
        let key = imageKey;
        if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
          try {
            const url = new URL(imageKey);
            key = url.pathname.replace(/^\//, '');
          } catch {
            // If URL parsing fails, use as-is
          }
        }

        // Never attempt to delete static placeholder assets
        if (key.startsWith('static/')) {
          return;
        }
        
        await fetch('/api/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ key }),
        });
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
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
          <p className="text-subhead text-foreground mb-1">{label}</p>
          {description && <p className="text-caption1 text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Image Grid - Sortable (confirmed uploads) */}
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
                  blobOverride={blobCache[url]}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Optimistic previews — shown immediately while uploading in background */}
      {pendingPreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pendingPreviews.map((blobUrl) => (
            <div key={blobUrl} className="relative aspect-video rounded-xl overflow-hidden bg-muted/50">
              <img src={blobUrl} alt="Uploading…" className="w-full h-full object-cover opacity-75" />
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          onClick={!uploading ? handleClick : undefined}
          onDragEnter={!uploading ? handleDrag : undefined}
          onDragLeave={!uploading ? handleDrag : undefined}
          onDragOver={!uploading ? handleDrag : undefined}
          onDrop={!uploading ? handleDrop : undefined}
          className={`relative rounded-xl p-6 transition-colors ${
            uploading
              ? 'bg-muted/30 cursor-default'
              : dragActive
              ? 'border-2 border-dashed border-primary bg-primary/5 cursor-pointer'
              : 'border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
          }`}
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

          <div className="flex flex-col gap-3 w-full">
            {uploading ? (
              <>
                <p className="text-subhead text-foreground text-left transition-all duration-500">
                  {getUploadMessage(displayProgress)}
                </p>
                <Progress value={displayProgress} className="h-1.5" />
                <p className="text-caption1 text-muted-foreground text-left">
                  {displayProgress < 40 ? 'Preparing…' : `${displayProgress}% complete`}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="text-subhead text-muted-foreground">
                  Drop or tap • {value.length}/{maxImages}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {value.length >= maxImages && (
        <p className="text-caption1 text-muted-foreground text-center py-2">
          Maximum {maxImages} images reached
        </p>
      )}
    </div>
  );
}
