/**
 * BrandAvatar Component - Single Source of Truth for Partner/Brand Logos
 * 
 * This component is the ONLY way to display brand/partner logos throughout the app.
 * Automatically handles R2 storage key to public URL conversion.
 * 
 * For user avatars, use UserAvatar instead.
 * 
 * @example
 * <BrandAvatar logoUrl={partner.logo} brandName={partner.brandName} />
 */

'use client';

import * as React from 'react';
import { cn, getAppImageUrl } from '@/utils';

interface BrandAvatarProps {
  /** Logo storage key or full URL */
  logoUrl?: string | null;
  /** Brand name for alt text and initials fallback */
  brandName: string;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Updated timestamp for cache busting (Date, string, or timestamp) */
  updatedAt?: Date | string | number | null;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

/**
 * Generates initials from brand name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'B';
}

export function BrandAvatar({ 
  logoUrl, 
  brandName, 
  size = 'lg',
  className = '',
  updatedAt
}: BrandAvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  // If logoUrl is already a full URL (from API), use it directly
  // Otherwise resolve storage key to public URL
  const resolvedUrl = React.useMemo(() => {
    if (!logoUrl) return null;
    const cacheBuster = updatedAt ? new Date(updatedAt).getTime() : undefined;
    return getAppImageUrl(logoUrl, cacheBuster);
  }, [logoUrl, updatedAt]);

  // Reset error state when URL changes
  React.useEffect(() => {
    setHasError(false);
  }, [resolvedUrl]);

  const showImage = resolvedUrl && !hasError;

  return (
    <div 
      className={cn(
        "relative rounded-full bg-card border border-border/40 flex items-center justify-center flex-shrink-0 overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <img
          key={resolvedUrl}
          src={resolvedUrl}
          alt={brandName}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-bold text-muted-foreground">
          {getInitials(brandName)}
        </span>
      )}
    </div>
  );
}

export type { BrandAvatarProps };
