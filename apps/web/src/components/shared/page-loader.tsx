'use client';

/**
 * PageLoader - Premium loading experience
 * 
 * Minimal, elegant loading indicator with smooth animations.
 * Used for page transitions and initial auth loading states.
 * 
 * @module components/shared/page-loader
 */

import { useEffect, useState } from 'react';
import { BRAND_LOGO_SVG } from '@/lib/brand-assets';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  message?: string;
  /** Compact mode for inline/card loaders */
  compact?: boolean;
}

export function PageLoader({ message, compact = false }: PageLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Stagger the content reveal for smoother entrance
    const timer = setTimeout(() => setShowContent(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center justify-center py-16">
        <PulseLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className={cn(
        'flex flex-col items-center gap-10 transition-all duration-500 ease-out',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        {/* Logo */}
        <div
          aria-label="Revvup"
          className={cn(
            'relative text-foreground transition-opacity duration-300',
            mounted ? 'opacity-90' : 'opacity-0'
          )}
        >
          <img
            src={BRAND_LOGO_SVG}
            alt="Revvup"
            className="h-14 w-auto invert dark:invert-0"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        
        {/* Elegant dot loader */}
        <PulseLoader />
        
        {/* Optional message with fade */}
        {message && (
          <p className={cn(
            'text-footnote text-muted-foreground/50 font-medium tracking-tight transition-opacity duration-500 delay-200',
            showContent ? 'opacity-100' : 'opacity-0'
          )}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/** Elegant pulsing dots loader */
function PulseLoader() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="size-1.5 rounded-full bg-foreground/30 animate-pulse"
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}

/** Minimal spinner for buttons/actions */
function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('relative size-4', className)}>
      <div className="absolute inset-0 rounded-full border-[1.5px] border-current/10" />
      <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-current/50 animate-spin will-change-transform" />
    </div>
  );
}

/** Inline loader for buttons/small areas */
export function InlineLoader({ className }: { className?: string }) {
  return <Spinner className={className} />;
}

/** Skeleton loader for content placeholders */
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded-md bg-muted/50',
      className
    )} />
  );
}
