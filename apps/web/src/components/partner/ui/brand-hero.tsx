/**
 * Brand Hero Component
 * Displays partner hero image with gradient fallback
 * Handles R2 storage keys automatically
 */

'use client';

import { useState } from 'react';

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

interface BrandHeroProps {
  heroImageUrl?: string | null;
  brandName: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
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
  className = ''
}: BrandHeroProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden ${heightClasses[height]} ${className}`}>
      {heroImageUrl && !hasError ? (
        <img
          src={getPublicUrl(heroImageUrl) || heroImageUrl}
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
