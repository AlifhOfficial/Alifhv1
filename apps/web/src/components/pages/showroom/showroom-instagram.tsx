/**
 * Showroom Instagram Feed
 * Clean, minimal Instagram section that matches showroom theme.
 */

'use client';

import { Instagram, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomInstagramProps {
  showroom: ShowroomData;
}

export function ShowroomInstagram({ showroom }: ShowroomInstagramProps) {
  const theme = getAmbientTheme(showroom.ambientStyle);
  
  // Only show if Instagram is enabled and handle exists
  if (!showroom.instagramFeedEnabled || !showroom.instagramHandle) {
    return null;
  }

  const handle = showroom.instagramHandle.replace('@', '');
  const profileUrl = `https://instagram.com/${handle}`;

  return (
    <section 
      id="instagram"
      className={cn(theme.sectionSpacing, 'px-4 sm:px-6 lg:px-8')}
    >
      <div className="max-w-[1600px] mx-auto">
        
        {/* Minimal Card Layout */}
        <div className={cn(
          'relative overflow-hidden',
          'border border-border/40 rounded-2xl',
          'bg-muted/20'
        )}>
          <div className="px-6 py-12 sm:px-12 sm:py-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
              
              {/* Left: Instagram Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full',
                    'bg-foreground/5 border border-border/50',
                    'flex items-center justify-center'
                  )}>
                    <Instagram className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className={cn(
                      'text-[11px] uppercase tracking-[0.15em]',
                      theme.labelClass,
                      'text-muted-foreground/60'
                    )}>
                      Follow Us
                    </p>
                    <p className={cn(
                      'text-lg',
                      theme.subheadingClass,
                      'text-foreground'
                    )}>
                      @{handle}
                    </p>
                  </div>
                </div>
                
                <p className={cn(
                  'text-sm max-w-md',
                  theme.bodyClass,
                  'text-muted-foreground/70'
                )}>
                  Stay updated with our latest arrivals, behind-the-scenes, and automotive content.
                </p>
              </div>
              
              {/* Right: CTA */}
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group inline-flex items-center gap-2',
                  'h-11 px-6',
                  'bg-primary text-primary-foreground',
                  'text-sm font-medium rounded-lg',
                  'hover:bg-primary/90',
                  'transition-all duration-200'
                )}
              >
                View on Instagram
                <ArrowUpRight className={cn(
                  'w-4 h-4',
                  'transition-transform duration-200',
                  'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                )} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
