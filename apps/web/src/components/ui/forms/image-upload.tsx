/**
 * Image Upload Component - Revvup Design System
 * Multi-image upload with preview and drag-and-drop
 * 
 * Uses presigned URL pipeline for fast uploads:
 * 1. Get presigned URL → 2. Upload to R2 → 3. Process → CDN URL
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getPublicUrl } from '@/utils/storage';
import { uploadListingImage, type ListingUploadResult } from '@/lib/storage';
import { Button } from './button';

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
    
    // Basic client-side type check (server does magic byte detection for full validation)
    const invalidFiles = filesToUpload.filter(f => 
      !f.type.startsWith('image/') && f.type !== '' && f.type !== 'application/octet-stream'
    );
    
    if (invalidFiles.length > 0) {
      alert('Only image files are allowed');
      return;
    }

    // Validate file sizes (max 30MB per image - presigned pipeline handles large files)
    const maxSize = 30 * 1024 * 1024;
    const oversizedFiles = filesToUpload.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 30MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload files sequentially for better progress tracking
      const uploadedKeys: string[] = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const result = await uploadListingImage(file, vin, (percent) => {
          // Calculate overall progress across all files
          const baseProgress = (i / filesToUpload.length) * 100;
          const fileProgress = (percent / filesToUpload.length);
          setUploadProgress(Math.round(baseProgress + fileProgress));
        });
        // Store the full-size key (thumb can be derived from it)
        uploadedKeys.push(result.fullKey);
      }
      
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

  // Move image to first position (set as thumbnail)
  const setAsThumbnail = (index: number) => {
    if (index === 0) return; // Already thumbnail
    const newImages = [...value];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);
    onChange(newImages);
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

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-muted/50">
              <img 
                src={getPublicUrl(url) || url} 
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Delete button - top right */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Set as thumbnail button - bottom left (only show if not already thumbnail) */}
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => setAsThumbnail(index)}
                  className="absolute bottom-2 left-2 px-2.5 py-1.5 bg-black/60 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  Mark thumbnail
                </button>
              )}
              {/* Thumbnail badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg">
                  Thumbnail
                </div>
              )}
            </div>
          ))}
        </div>
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
                  {uploadProgress > 60 ? 'Processing...' : `${uploadProgress}%`}
                </p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop or tap • {value.length}/{maxImages}
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  HEIC may take 5-10s to process
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
