/**
 * Logo Upload Component - Partner Profile
 * Follows the exact pattern of user avatar upload
 */

'use client';

import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
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

interface LogoUploadProps {
  logoUrl?: string | null;
  brandName: string;
  onUpdate: (logoKey: string | null) => Promise<any>;
  isUpdating: boolean;
}

export function LogoUpload({ logoUrl, brandName, onUpdate, isUpdating }: LogoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogoClick = () => {
    if (!logoUploading && !isUpdating) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveLogo = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLogoUploading(true);
    try {
      await onUpdate(null);
      toast({
        title: 'Logo removed',
        description: 'Your company logo has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to remove logo',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
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

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', 'partner-logos');
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

      const result = await onUpdate(payload.key);
      if (result) {
        toast({
          title: 'Logo updated',
          description: 'Your company logo has been changed.',
        });
      }
    } catch (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError instanceof Error ? uploadError.message : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="group relative flex-shrink-0">
        <div className="relative">
          {logoUrl ? (
            <img
              src={getPublicUrl(logoUrl) || logoUrl}
              alt={brandName}
              className="w-20 h-20 object-cover border-2 border-border bg-background rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 border-2 border-border bg-background rounded-lg flex items-center justify-center">
              <span className="text-xl font-semibold text-foreground tracking-tight">
                {getInitials(brandName)}
              </span>
            </div>
          )}
          {logoUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
        
        {!logoUploading && !isUpdating && (
          <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogoClick();
              }}
              className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
              title="Change logo"
            >
              <Camera className="w-3.5 h-3.5 text-foreground" />
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors shadow-sm"
                title="Remove logo"
              >
                <X className="w-3.5 h-3.5 text-destructive" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
