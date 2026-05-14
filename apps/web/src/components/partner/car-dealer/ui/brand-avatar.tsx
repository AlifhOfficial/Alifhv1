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
  size?: 'compact' | 'regular' | 'large' | 'xlarge' | 'xxlarge' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Updated timestamp for cache busting (Date, string, or timestamp) */
  updatedAt?: Date | string | number | null;
  /** Native image loading behavior for the brand logo */
  loading?: React.ImgHTMLAttributes<HTMLImageElement>['loading'];
  /** Native image fetch priority for above-the-fold brand logos */
  fetchPriority?: React.ImgHTMLAttributes<HTMLImageElement>['fetchPriority'];
}

type CanonicalBrandAvatarSize = 'compact' | 'regular' | 'large' | 'xlarge' | 'xxlarge';

const sizeClasses: Record<CanonicalBrandAvatarSize, string> = {
  compact: 'w-6 h-6 text-caption1',
  regular: 'w-8 h-8 text-caption1',
  large: 'w-10 h-10 text-subhead',
  xlarge: 'w-12 h-12 text-callout',
  xxlarge: 'w-16 h-16 text-headline',
};

const sizeMap: Record<NonNullable<BrandAvatarProps['size']>, CanonicalBrandAvatarSize> = {
  compact: 'compact',
  regular: 'regular',
  large: 'large',
  xlarge: 'xlarge',
  xxlarge: 'xxlarge',
  xs: 'compact',
  sm: 'regular',
  md: 'large',
  lg: 'xlarge',
  xl: 'xxlarge',
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
  size = 'xlarge',
  className = '',
  updatedAt,
  loading = 'lazy',
  fetchPriority,
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
        sizeClasses[sizeMap[size]],
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
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
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
