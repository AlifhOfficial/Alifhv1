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
import Image from 'next/image';
import { cn, getPublicUrl } from '@/utils';

interface BrandAvatarProps {
  /** Logo storage key or full URL */
  logoUrl?: string | null;
  /** Brand name for alt text and initials fallback */
  brandName: string;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-sm',
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-xl',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-24 h-24 text-3xl',
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
  className = '' 
}: BrandAvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  // Resolve storage key to public URL
  const resolvedUrl = React.useMemo(() => {
    if (!logoUrl) return null;
    return getPublicUrl(logoUrl);
  }, [logoUrl]);

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
        <Image
          src={resolvedUrl}
          alt={brandName}
          fill
          sizes="(max-width: 768px) 64px, 96px"
          className="object-cover"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          priority={false}
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
