/**
 * Image Upload Component
 * For uploading and displaying images with hover actions
 */

'use client';

import React, { useRef } from 'react';
import { cn } from '@/utils';
import { getPublicUrl } from '@/utils';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import type { ImageUploadProps } from '../types';

export function ImageUpload({ 
  value, 
  displayUrl, 
  onUpload, 
  onRemove, 
  aspectRatio = 'aspect-video', 
  label, 
  isUploading 
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await onUpload(file);
  };

  // Use displayUrl if available (from server), otherwise build from key
  const imageUrl = displayUrl || (value ? getPublicUrl(value) : null);

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted/30 border border-border/40 group", aspectRatio)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {imageUrl ? (
        <>
          <img
            key={imageUrl}
            src={imageUrl}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={onRemove}
              disabled={isUploading}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/50 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              <span className="text-[10px] text-muted-foreground">Processing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Upload className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
