/**
 * Feedback Modal Component
 * macOS-inspired minimal design
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-50 bg-card border border-sidebar-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">
            Rate Your Experience
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            How was your test drive?
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1 mb-6">
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
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/20 hover:text-amber-400/50"
                )}
              />
            </button>
          ))}
        </div>

        {/* Rating Label */}
        {rating > 0 && (
          <p className="text-center text-sm font-medium text-foreground mb-4">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Great'}
            {rating === 5 && 'Excellent'}
          </p>
        )}

        {/* Comment */}
        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Tell us more about your experience (optional)"
            rows={3}
            className="w-full px-4 py-3 bg-sidebar border border-sidebar-border rounded-xl text-sm resize-none focus:outline-none focus:border-foreground/30 transition-all placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-full border border-sidebar-border hover:bg-sidebar-accent text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
