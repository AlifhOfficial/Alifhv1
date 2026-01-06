'use client';

/**
 * PageLoader - Full screen loading state with logo
 * 
 * Shows the Alifh logo with a subtle pulse animation and loading message.
 * Used for page transitions and initial auth loading states.
 * 
 * @module components/shared/page-loader
 */

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Fetching the latest content...' }: PageLoaderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use white logo as default (works on dark bg during SSR)
  // Only switch to black logo after mount when we know the theme
  const logoSrc = mounted && resolvedTheme === 'light'
    ? '/assets/Alifh_logo_Black.svg' 
    : '/assets/Alifh_logo_White.svg';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      {/* Logo with pulse animation */}
      <div className="relative animate-pulse">
        <Image
          src={logoSrc}
          alt="Alifh"
          width={120}
          height={40}
          priority
          className={mounted ? 'opacity-80' : 'opacity-0'}
        />
      </div>
      
      {/* Loading message */}
      <p className="text-sm text-muted-foreground/70 font-medium tracking-tight">
        {message}
      </p>
    </div>
  );
}
