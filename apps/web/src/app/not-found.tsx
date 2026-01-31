/**
 * Custom 404 Not Found Page
 * 
 * Bold, immersive error page with prominent branding.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || resolvedTheme === 'charcoal');
  const logoSrc = isDark ? '/assets/Alifh_logo_White.svg' : '/assets/Alifh_logo_Black.svg';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top section with logo */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 pt-20">
        <div className={cn(
          'transition-all duration-700 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <Image
            src={logoSrc}
            alt="Alifh"
            width={200}
            height={64}
            priority
            className="h-16 sm:h-20 w-auto"
          />
        </div>
      </div>

      {/* Center divider with 404 */}
      <div className={cn(
        'flex items-center justify-center gap-6 py-8 transition-all duration-700 delay-100',
        mounted ? 'opacity-100' : 'opacity-0'
      )}>
        <div className="h-px w-16 sm:w-24 bg-border" />
        <span className="text-xs font-semibold tracking-[0.3em] text-muted-foreground/40 uppercase">
          404
        </span>
        <div className="h-px w-16 sm:w-24 bg-border" />
      </div>

      {/* Bottom section with content */}
      <div className={cn(
        'flex-1 flex flex-col items-center justify-start pt-8 pb-20 px-6 transition-all duration-700 delay-200',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
        {/* Message */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
            This page doesn't exist
          </h1>
          <p className="text-muted-foreground/60 text-[15px]">
            The link may be broken or the page may have been removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className={cn(
              'h-12 px-8 inline-flex items-center justify-center rounded-full',
              'text-[15px] font-semibold tracking-tight transition-all duration-200',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            Go to homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className={cn(
              'h-12 px-8 inline-flex items-center justify-center rounded-full',
              'text-[15px] font-semibold tracking-tight transition-all duration-200',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
