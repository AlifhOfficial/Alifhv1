/**
 * Video Embed Preview Component
 * For previewing YouTube and Vimeo embeds
 */

'use client';

import React from 'react';
import { cn } from '@/utils';
import { Video } from 'lucide-react';
import type { VideoEmbedPreviewProps } from '../types';

// ============================================================================
// Helper Function
// ============================================================================

export function getVideoEmbedUrl(url: string | null): { embedUrl: string | null; platform: 'youtube' | 'vimeo' | 'unknown' } {
  if (!url) return { embedUrl: null, platform: 'unknown' };
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return { 
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`, 
      platform: 'youtube' 
    };
  }
  
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) {
    return { 
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0`, 
      platform: 'vimeo' 
    };
  }
  
  return { embedUrl: null, platform: 'unknown' };
}

// ============================================================================
// Component
// ============================================================================

export function VideoEmbedPreview({ url, aspectRatio = 'aspect-video' }: VideoEmbedPreviewProps) {
  const { embedUrl, platform } = getVideoEmbedUrl(url);
  
  if (!url) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center", aspectRatio)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Video className="w-5 h-5" />
          <span className="text-xs">Video preview will appear here</span>
        </div>
      </div>
    );
  }
  
  if (!embedUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center", aspectRatio)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground text-center px-4">
          <Video className="w-5 h-5" />
          <span className="text-xs">Paste a YouTube or Vimeo URL to preview</span>
          <span className="text-[10px] text-muted-foreground/60">e.g. youtube.com/watch?v=... or vimeo.com/...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-black border border-border/40", aspectRatio)}>
      <iframe
        src={embedUrl}
        title="Video preview"
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm">
        <span className="text-[10px] text-white/80 uppercase tracking-wider">
          {platform === 'youtube' ? 'YouTube' : 'Vimeo'}
        </span>
      </div>
    </div>
  );
}
