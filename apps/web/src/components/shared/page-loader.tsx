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

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Fetching the latest content...' }: PageLoaderProps) {
  const { resolvedTheme } = useTheme();

  // Use a safe default - dark theme logo works on both while mounting
  const logoSrc = resolvedTheme === 'light' 
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
          className="opacity-80"
        />
      </div>
      
      {/* Loading message */}
      <p className="text-sm text-muted-foreground/70 font-medium tracking-tight">
        {message}
      </p>
    </div>
  );
}
