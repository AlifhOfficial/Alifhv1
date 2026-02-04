/**
 * Slide: Opener
 * Bold brand statement with prominent logo.
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

function useLogoSrc() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return '/assets/Revvup_logo_White.svg';
  return resolvedTheme === 'light' 
    ? '/assets/Revvup_logo_Black.svg' 
    : '/assets/Revvup_logo_White.svg';
}

export function SlideOpener() {
  const logoSrc = useLogoSrc();
  
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-sidebar">
      <div className="max-w-[1600px] mx-auto text-center">
        
        {/* Logo - Prominent */}
        <div className="mb-16">
          <Image
            src={logoSrc}
            alt="Revvup"
            width={200}
            height={60}
            className="h-12 sm:h-14 lg:h-16 w-auto mx-auto mb-8"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center leading-relaxed text-foreground">
          <span className="text-primary">Stop Paying</span> Commissions.
          <br />
          <span className="text-primary">Start Keeping</span> 100%.
        </p>

      </div>
    </section>
  );
}
