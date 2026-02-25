/**
 * Video Upload Component
 * For uploading and displaying video files with hover preview
 * 
 * Behavior:
 * - New upload: Stores video in R2, saves key to database
 * - Replace: Uploads new video, deletes old from R2, updates database
 * - Remove: Deletes from R2, clears database field
 */

'use client';

import React, { useRef } from 'react';
import { cn } from '@/utils';
import { getPublicUrl } from '@/utils';
import { Video, X, Loader2, CheckCircle2, RefreshCw, Upload } from 'lucide-react';
import type { VideoUploadProps } from '../types';

export function VideoUpload({ 
  value, 
  displayUrl, 
  onUpload, 
  onRemove, 
  aspectRatio = 'aspect-video', 
  label, 
  isUploading, 
  uploadProgress 
}: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await onUpload(file);
  };

  // Use displayUrl if available (from server), otherwise build from key
  const videoUrl = displayUrl || (value ? getPublicUrl(value) : null);
  
  // Determine if this is a saved video (has a value/key stored)
  const hasSavedVideo = !!value;

  return (
    <div className="space-y-2">
      <div className={cn("relative overflow-hidden rounded-xl bg-muted/30 border border-border/40 group", aspectRatio)}>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              onMouseEnter={() => videoRef.current?.play()}
              onMouseLeave={() => {
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              }}
            />
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-white" />
                  )}
                  <span className="text-xs text-white font-medium">Replace</span>
                </button>
                <button
                  onClick={onRemove}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/50 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                  <span className="text-xs text-white font-medium">Remove</span>
                </button>
              </div>
              {hasSavedVideo && (
                <p className="text-[10px] text-white/70 text-center px-4">
                  Replacing will delete the current video
                </p>
              )}
            </div>
            {/* Status badge */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-green-600/90 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span className="text-[10px] text-white font-medium uppercase tracking-wider">Saved</span>
            </div>
            {/* Hover to preview hint */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-white/80">Hover to preview</span>
            </div>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                {/* Progress ring */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="opacity-20"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (125.6 * (uploadProgress || 0)) / 100}
                      className="text-primary transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                    {uploadProgress || 0}%
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">Uploading video...</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    Please don't close this page
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="p-3 rounded-full bg-muted/50">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{label}</span>
                <span className="text-[10px] text-muted-foreground/60">MP4, WebM, MOV • Max 50MB</span>
                <span className="text-[10px] text-muted-foreground/40">Compress to 720p/1080p first • WebM preferred</span>
              </div>
            )}
          </button>
        )}
      </div>
      
      {/* Helper text when video is saved */}
      {hasSavedVideo && !isUploading && (
        <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          Served via CDN for fast global delivery
        </p>
      )}
    </div>
  );
}
