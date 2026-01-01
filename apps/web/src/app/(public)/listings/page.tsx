/**
 * Inventory/Listings Page - Alifh Design System
 * Clean compact layout
 */

import { Suspense } from 'react';
import { InventoryPageClient } from './page-client';
import { Navbar } from '@/components/shared/navbar';

export default function InventoryPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      
      <Suspense fallback={<PageSkeleton />}>
        <InventoryPageClient />
      </Suspense>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex gap-0">
          <div className="w-64 flex-shrink-0 hidden lg:block" />
          <main className="flex-1 min-w-0 pl-8">
            <div className="h-20 bg-muted/20 rounded-lg animate-pulse" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
