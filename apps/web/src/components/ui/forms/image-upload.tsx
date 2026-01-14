/**
 * Image Upload Component - Alifh Design System
 * Multi-image upload with preview and drag-and-drop
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  directory?: string;
  label?: string;
  description?: string;
  /**
   * Use optimized listing image endpoint with Sharp/WebP conversion
   * When true, uses /api/storage/upload-listing-image for better quality & smaller files
   */
  optimized?: boolean;
  /**
   * Delete images from storage when removed from the list
   * When true, calls DELETE /api/storage/delete to remove from R2
   * @default true for optimized uploads
   */
  deleteOnRemove?: boolean;
  /**
   * VIN for organizing images in R2 storage
   * Required for optimized uploads - images stored under listings/{vin}-xxx/
   */
  vin?: string;
}

export function ImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 10,
  directory = 'listings',
  label = 'Upload Images',
  description = 'Add up to ' + maxImages + ' images',
  optimized = false,
  deleteOnRemove = true,
  vin,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate file types - optimized endpoint supports more formats
    const validTypes = optimized 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = filesToUpload.filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      const allowedFormats = optimized ? 'JPG, PNG, WebP, or HEIC' : 'JPG, PNG, and WebP';
      alert(`Only ${allowedFormats} images are allowed`);
      return;
    }

    // Validate file sizes (max 10MB per image)
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = filesToUpload.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use optimized endpoint for listing images (Sharp/WebP conversion)
        // Falls back to generic upload for non-listing images
        const endpoint = optimized 
          ? '/api/storage/upload-listing-image'
          : '/api/storage/upload';
        
        if (optimized && vin) {
          // Pass VIN for organized storage: listings/{vin}-xxx/
          formData.append('vin', vin);
        }
        
        if (!optimized) {
          // Only needed for generic endpoint
          formData.append('directory', directory);
          formData.append('contentType', file.type);
          formData.append('cacheControl', 'public, max-age=31536000, immutable');
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          credentials: 'include', // Include auth cookies for optimized endpoint
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.url || data.key;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
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
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border/40 bg-muted">
              <img 
                src={url} 
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded">
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
            accept={optimized 
              ? "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif" 
              : "image/jpeg,image/jpg,image/png,image/webp"
            }
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm font-medium text-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drop images here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP up to 10MB • {value.length}/{maxImages} images
                  </p>
                </div>
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
