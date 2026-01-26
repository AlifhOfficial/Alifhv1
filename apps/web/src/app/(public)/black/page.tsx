/**
 * Black Directory Page
 * 
 * Premium showroom directory for Black tier members.
 * Showcases verified dealerships with signature showroom pages.
 */

import { Suspense } from 'react';
import { BlackDirectoryView } from '@/components/pages/black';

export const metadata = {
  title: 'Black | Signature Showrooms | Alifh',
  description: 'Curated collection of premium dealerships and signature showrooms from verified Black tier partners.',
};

export default function BlackPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BlackDirectoryView />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header Skeleton */}
      <header className="sticky top-16 z-30 bg-background">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto space-y-4">
            <div className="h-7 w-16 bg-muted rounded mx-auto animate-pulse" />
            <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </header>
      
      {/* Cards skeleton */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1600px] mx-auto space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full rounded-xl bg-sidebar border border-sidebar-border overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:min-h-[420px]">
                {/* Media - 75% */}
                <div className="w-full lg:w-[75%] aspect-[16/9] lg:aspect-auto bg-muted animate-pulse" />
                
                {/* Content - 25% */}
                <div className="flex-1 lg:w-[25%] p-6 sm:p-8 flex flex-col">
                  <div className="flex-1">
                    <div className="h-14 w-20 bg-muted rounded mb-5 animate-pulse" />
                    <div className="h-7 w-40 bg-muted rounded mb-3 animate-pulse" />
                    <div className="h-5 w-full max-w-[200px] bg-muted/60 rounded animate-pulse" />
                    <div className="flex gap-4 mt-6">
                      <div className="h-4 w-16 bg-muted/40 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-muted/40 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-5 mt-6 border-t border-border/40">
                    <div className="h-5 w-16 bg-muted/40 rounded animate-pulse" />
                    <div className="h-5 w-20 bg-muted/40 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
