/**
 * Brand Hero Component
 * Displays partner hero image with gradient fallback
 * Handles R2 storage keys automatically
 */

'use client';

import { useState } from 'react';
import { getAppImageUrl } from '@/utils';

interface BrandHeroProps {
  heroImageUrl?: string | null;
  brandName: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Updated timestamp for cache busting (Date, string, or timestamp) */
  updatedAt?: Date | string | number | null;
}

const heightClasses = {
  sm: 'h-40',
  md: 'h-56',
  lg: 'h-72',
};

export function BrandHero({ 
  heroImageUrl, 
  brandName,
  height = 'md',
  className = '',
  updatedAt
}: BrandHeroProps) {
  const [hasError, setHasError] = useState(false);
  
  // Resolve URL with cache busting
  const resolvedUrl = heroImageUrl
    ? getAppImageUrl(heroImageUrl, updatedAt ? new Date(updatedAt).getTime() : undefined)
    : null;

  return (
    <div className={`relative w-full overflow-hidden ${heightClasses[height]} ${className}`}>
      {resolvedUrl && !hasError ? (
        <img
          src={resolvedUrl}
          alt={brandName}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted via-muted/50 to-muted" />
      )}
    </div>
  );
}
