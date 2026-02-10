'use client';

/**
 * AmnaDialog – AI conversational search modal
 * Clean, neutral UI with purple accent outline.
 *
 * @module components/search/amna-dialog
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ── Quick suggestions — broad queries guaranteed to return data ──
const QUICK_SUGGESTIONS = [
  'Surprise me 🎲',
  'SUV under 100K',
  'Best first car?',
  'Something that turns heads',
  'Toyota or Nissan?',
  'Budget friendly',
];

interface AmnaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AmnaDialog({ open, onOpenChange }: AmnaDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Focus textarea when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Submit handler
  const handleSubmit = useCallback(async (text?: string) => {
    const q = (text ?? query).trim();
    if (!q || loading) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/listings/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      if (data.intent?.confidence > 0.1 && data.hasFilters && data.searchUrl && data.searchUrl !== '/listings') {
        const msg = data.message || data.intent?.summary || 'Found results for you!';
        setMessage(msg);
        await new Promise(r => setTimeout(r, 1200));
        router.push(data.searchUrl);
        onOpenChange(false);
        setQuery('');
      } else {
        const msg = data.message || "Couldn't map that to filters — showing all cars";
        setMessage(msg);
        await new Promise(r => setTimeout(r, 2000));
        router.push('/listings');
        onOpenChange(false);
        setQuery('');
      }
    } catch {
      setMessage("Something went wrong — showing all cars");
      await new Promise(r => setTimeout(r, 1200));
      router.push('/listings');
      onOpenChange(false);
      setQuery('');
    } finally {
      setLoading(false);
      setMessage(null);
    }
  }, [query, loading, router, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent
        className={cn(
          'sm:max-w-[480px] p-0 gap-0 overflow-hidden',
          'border-2 border-violet-500/40 rounded-2xl',
          'shadow-lg',
        )}
      >
        <DialogTitle className="sr-only">Talk to Amna – AI Car Search</DialogTitle>

        {/* ── Loading Overlay ── */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-background/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in-0 duration-200 rounded-2xl">
            <div className="flex flex-col items-center gap-4 px-6">
              <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
              <p className="text-sm font-semibold text-foreground text-center">
                {message || 'Finding cars for you...'}
              </p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-2">
          <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">Ask Amna</h3>
            <p className="text-[11px] text-muted-foreground/60">Describe what you're looking for</p>
          </div>
        </div>

        {/* ── Textarea ── */}
        <div className="px-5 py-2">
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder='e.g. "SUV under 100K" or "best car for a family"'
            rows={2}
            disabled={loading}
            className={cn(
              'w-full rounded-lg border border-border/50 bg-muted/20 px-3.5 py-2.5 resize-none',
              'text-sm text-foreground',
              'placeholder:text-muted-foreground/40',
              'focus:outline-none focus:border-violet-500/40',
              'transition-colors duration-150',
              'disabled:opacity-50',
            )}
          />
        </div>

        {/* ── Quick Suggestions ── */}
        <div className="px-5 pb-3">
          <p className="text-[10px] font-medium text-muted-foreground/40 mb-1.5 uppercase tracking-wider">Try asking</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  handleSubmit(s);
                }}
                disabled={loading}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium',
                  'bg-muted/50 text-muted-foreground',
                  'border border-border/40',
                  'hover:bg-muted hover:text-foreground',
                  'transition-colors duration-100',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Submit Bar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/20">
          <span className="text-[10px] text-muted-foreground/40">
            Enter to send
          </span>
          <button
            onClick={() => handleSubmit()}
            disabled={!query.trim() || loading}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold',
              'transition-all duration-150',
              query.trim() && !loading
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            Ask
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
