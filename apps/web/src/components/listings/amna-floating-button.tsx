/**
 * AmnaFloatingButton - Floating magic circle for Amna AI
 * Positioned at bottom right corner
 */

'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { AmnaDialog } from '@/components/search/amna-dialog';

export function AmnaFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center size-12 rounded-full border-2 border-violet-500 bg-background text-violet-500 hover:bg-violet-500/10 active:scale-95 transition-all"
        aria-label="Talk to Amna AI"
      >
        <Zap className="size-5" />
      </button>

      <AmnaDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
