"use client";

import { useState } from 'react';
import { Upload, ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Public R2 URL - embedded at build time
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

// Convert storage key to public URL
function getPublicUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (!R2_PUBLIC_URL) {
    console.warn('NEXT_PUBLIC_R2_PUBLIC_URL is not configured');
    return null;
  }
  return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
}

interface BrandingMediaSectionProps {
  heroImage: string;
  isEditing: boolean;
  onHeroImageChange: (value: string) => void;
}

export function BrandingMediaSection({
  heroImage,
  isEditing,
  onHeroImageChange,
}: BrandingMediaSectionProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // Reset input
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, HEIC, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', 'partner-hero-images');
      formData.append('fileName', file.name);
      formData.append('contentType', file.type);

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const payload = await response.json();
      if (!response.ok || !payload.key) {
        throw new Error(payload.error || 'Upload failed');
      }

      onHeroImageChange(payload.key);
      toast({
        title: 'Hero image uploaded',
        description: 'Your hero image has been uploaded successfully.',
      });
    } catch (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError instanceof Error ? uploadError.message : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Hero Image</label>
        {isEditing ? (
          <div className="space-y-2">
            <label className="group block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between gap-4 p-4 border border-dashed rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  {heroImage ? (
                    <img
                      src={getPublicUrl(heroImage) || heroImage}
                      alt="Hero"
                      className="w-32 h-20 object-cover border border-border"
                    />
                  ) : (
                    <div className="w-32 h-20 bg-muted flex items-center justify-center border border-border">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {heroImage ? 'Change Hero Image' : 'Upload Hero Image'}
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP • Max 5MB</p>
              </div>
            </label>
            {heroImage && (
              <button
                type="button"
                onClick={() => onHeroImageChange('')}
                className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                <X className="w-4 h-4" />
                Remove Hero Image
              </button>
            )}
          </div>
        ) : heroImage ? (
          <img src={getPublicUrl(heroImage) || heroImage} alt="Hero" className="w-48 h-32 object-cover border border-border" />
        ) : (
          <p className="text-sm text-muted-foreground">No hero image uploaded</p>
        )}
      </div>
    </div>
  );
}