/**
 * Brand Avatar Component
 * Displays partner logo with fallback to initials
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

interface BrandAvatarProps {
  logoUrl?: string | null;
  brandName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-xl',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-24 h-24 text-3xl',
};

export function BrandAvatar({ 
  logoUrl, 
  brandName, 
  size = 'lg',
  className = '' 
}: BrandAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className={`rounded-xl bg-card border border-border/40 flex items-center justify-center flex-shrink-0 overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {logoUrl && !hasError ? (
        <img
          src={getPublicUrl(logoUrl) || logoUrl}
          alt={brandName}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-bold text-muted-foreground">
          {getInitials(brandName)}
        </span>
      )}
    </div>
  );
}
