/**
 * Feedback Modal Component
 */

'use client';

import { Star, X } from 'lucide-react';
import { cn } from '@/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  rating: number;
  comment: string;
  isSubmitting: boolean;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function FeedbackModal({
  isOpen,
  rating,
  comment,
  isSubmitting,
  onRatingChange,
  onCommentChange,
  onSubmit,
  onClose,
}: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-50 bg-background border border-border/40 rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold tracking-tight">Rate Your Experience</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted/40 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-[15px] font-medium text-muted-foreground/70 mb-6">
          How was your test drive?
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => onRatingChange(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  star <= rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground hover:text-yellow-400"
                )}
              />
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            Comments (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="w-full px-4 py-3 bg-muted/20 border border-border/40 rounded-xl text-sm font-medium resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 rounded-full border border-border/40 hover:bg-muted/40 text-sm font-semibold tracking-tight transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
