/**
 * Feedback Modal Component
 * Clean centered modal design
 */

'use client';

import { Star } from 'lucide-react';
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

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-xs rounded-xl border border-border/40 bg-card p-6 shadow-xl">
        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-500" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Rate Your Experience
            </h3>
            <p className="text-sm text-muted-foreground">
              How was your test drive?
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => onRatingChange(star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    "w-7 h-7 transition-colors",
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/20 hover:text-amber-400/50"
                  )}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          {rating > 0 && (
            <p className="text-sm font-semibold text-foreground -mt-2">
              {ratingLabels[rating]}
            </p>
          )}

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Tell us more (optional)"
            rows={3}
            className="w-full px-3 py-2.5 bg-muted/30 border border-border/40 rounded-lg text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all"
          />

          {/* Actions */}
          <div className="flex flex-col w-full gap-2 pt-2">
            <button
              onClick={onSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={onClose}
              className="w-full h-10 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
