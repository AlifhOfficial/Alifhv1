/**
 * Compare Tool Page
 * Side-by-side car comparison (max 3)
 * Shareable via URL params
 */

'use client';

import { Suspense } from 'react';
import { Share2, Trash2, Car } from 'lucide-react';
import { CompareProvider, useCompare, CompareTable, CarSelector, MAX_COMPARE } from '@/components/tools/compare';

function CompareContent() {
  const { items, clearAll, getShareUrl, canAdd } = useCompare();

  const handleShare = async () => {
    const url = getShareUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Car Comparison - Alifh',
          text: `Compare ${items.length} cars on Alifh`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
      }
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
            Tools
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Compare Cars</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xl">
          Add up to {MAX_COMPARE} cars to compare specifications side by side.
        </p>
      </header>

      {/* Empty State - Clean minimal design */}
      {items.length === 0 && (
        <div className="py-12">
          {/* Placeholder slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((slot) => (
              <div 
                key={slot}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-border/30 bg-muted/5 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                  <Car className="w-4 h-4 text-muted-foreground/30" />
                </div>
                <span className="text-xs text-muted-foreground/40">Slot {slot}</span>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground/60">
              Search for cars to start comparing
            </p>
            <div className="flex justify-center">
              <CarSelector />
            </div>
          </div>
        </div>
      )}

      {/* With cars selected */}
      {items.length > 0 && (
        <>
          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border/30">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {items.length} of {MAX_COMPARE} cars
              </span>
              {canAdd && <CarSelector />}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <CompareTable />

          {/* Footer Note */}
          <p className="text-[11px] text-muted-foreground/50 text-center pt-4">
            Highlighted values indicate notable differences. All data should be verified during inspection.
          </p>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="h-3 w-16 bg-muted/40 rounded animate-pulse" />
          <div className="h-7 w-48 bg-muted/40 rounded animate-pulse" />
          <div className="h-4 w-80 bg-muted/40 rounded animate-pulse" />
        </header>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <CompareProvider>
        <CompareContent />
      </CompareProvider>
    </Suspense>
  );
}
