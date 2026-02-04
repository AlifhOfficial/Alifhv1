/**
 * Slide: Close
 * Final call to action.
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

export function SlideClose() {
  const logoSrc = useLogoSrc();
  
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-sidebar">
      <div className="max-w-[1600px] mx-auto text-center">
        
        {/* Logo */}
        <Image
          src={logoSrc}
          alt="Revvup"
          width={160}
          height={48}
          className="h-10 sm:h-12 w-auto mx-auto mb-12"
        />

        {/* CTA */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-6">
          Ready to Try Something Different?
        </h2>
        <p className="text-xl text-muted-foreground max-w-md mx-auto mb-16">
          Apply takes 5 minutes. We review manually and respond within 2-3 days.
        </p>

        {/* Contact */}
        <p className="text-lg text-muted-foreground/60">partners@revvup.ae</p>

      </div>
    </section>
  );
}
