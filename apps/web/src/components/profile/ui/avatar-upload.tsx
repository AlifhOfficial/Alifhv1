/**
 * Avatar Upload Component
 */

'use client';

import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Avatar } from '@/components/ui/data-display/avatar';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  avatarUrl?: string | null;
  initials: string;
  onUpdate: (avatarKey: string | null) => Promise<any>;
  isUpdating: boolean;
}

export function AvatarUpload({ avatarUrl, initials, onUpdate, isUpdating }: AvatarUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleAvatarClick = () => {
    if (!avatarUploading && !isUpdating) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    try {
      const result = await onUpdate(null);
      if (result) {
        toast({
          title: 'Photo removed',
          description: 'Your profile photo has been removed.',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to remove photo',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
      setShowRemoveConfirm(false);
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

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', 'avatars');
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
          title: 'Photo updated',
          description: 'Your profile photo has been changed.',
        });
      }
    } catch (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError instanceof Error ? uploadError.message : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
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
        <button
          onClick={handleAvatarClick}
          disabled={avatarUploading || isUpdating}
          className="relative block"
        >
          <Avatar
            src={avatarUrl}
            initials={initials}
            size="xl"
            className="border-2 border-border"
          />
          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </button>
        
        {!avatarUploading && !isUpdating && (
          <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
            <button
              onClick={handleAvatarClick}
              className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5 text-foreground" />
            </button>
            {avatarUrl && (
              <button
                onClick={() => setShowRemoveConfirm(true)}
                className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5 text-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {showRemoveConfirm && (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm text-foreground mb-3">Remove profile photo?</p>
          <div className="flex gap-2">
            <button
              onClick={handleRemoveAvatar}
              disabled={avatarUploading}
              className="h-8 px-4 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Remove
            </button>
            <button
              onClick={() => setShowRemoveConfirm(false)}
              disabled={avatarUploading}
              className="h-8 px-4 text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
