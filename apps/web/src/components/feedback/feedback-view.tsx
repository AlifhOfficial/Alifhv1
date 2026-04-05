/**
 * Feedback View - Dashboard Integration
 * 
 * Matches profile & settings design system
 * Clean, minimal, tap-to-interact pattern
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Send, CheckCircle2, Clock, Archive, Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type Feedback = {
  id: string;
  title: string;
  content: string;
  status: 'new' | 'reviewed' | 'archived';
  isRead: boolean;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_RESPONSE = 'We have received your feedback and taken note. Thank you for writing to us.';

// ============================================================================
// Status Components
// ============================================================================

function getStatusIcon(status: string) {
  switch (status) {
    case 'new':
      return <Clock className="w-3.5 h-3.5 text-warning" />;
    case 'reviewed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    case 'archived':
      return <Archive className="w-3.5 h-3.5 text-muted-foreground" />;
    default:
      return null;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'new':
      return 'Pending';
    case 'reviewed':
      return 'Reviewed';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function FeedbackView() {
  const { session: user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedbackList(data.feedback || []);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFeedback();
    }
  }, [user, fetchFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Feedback submitted!', description: 'Thank you for your feedback' });
        setTitle('');
        setContent('');
        fetchFeedback();
      } else {
        toast({ title: 'Failed to submit', description: data.error || 'Please try again', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'An error occurred while submitting feedback', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-title3 font-semibold tracking-tight">Feedback</h1>
          <p className="text-subhead text-muted-foreground mt-0.5">Share your thoughts and help us improve</p>
        </div>

        {/* Submit Form */}
        <section>
          <div className="rounded-xl border border-border/40 bg-sidebar p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-caption1 text-muted-foreground">
                  Subject
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your feedback"
                  required
                  maxLength={100}
                  className="w-full h-11 bg-background border border-border/40 rounded-lg px-3.5 text-subhead text-foreground outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/40"
                />
                <p className="text-[10px] text-muted-foreground/50 tabular-nums text-right">{title.length}/100</p>
              </div>

              <div className="space-y-3">
                <label className="text-caption1 text-muted-foreground">
                  Message
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us what you think..."
                  required
                  maxLength={2000}
                  rows={6}
                  className="w-full bg-background border border-border/40 rounded-lg px-3.5 py-3 text-subhead text-foreground outline-none focus:border-foreground/40 transition-colors resize-none placeholder:text-muted-foreground/40 leading-relaxed"
                />
                <p className="text-[10px] text-muted-foreground/50 tabular-nums text-right">{content.length}/2000</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="h-11 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-subhead font-semibold tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* History */}
        <section>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-subhead font-bold tracking-tight text-foreground">Submission History</h3>
              <span className="text-caption1 tabular-nums text-muted-foreground/60 bg-muted/50 px-2.5 py-1 rounded-full">
                {feedbackList.length}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 rounded-xl border border-border/40 bg-sidebar">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/50" />
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-border/40 bg-sidebar">
                <Send className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-subhead text-muted-foreground/60">No feedback submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedbackList.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4 hover:border-border/50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-subhead font-semibold tracking-tight text-foreground">
                          {feedback.title}
                        </h4>
                        <p className="text-caption2 text-muted-foreground/60">
                          {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-caption2 text-muted-foreground flex-shrink-0">
                        {getStatusIcon(feedback.status)}
                        {getStatusLabel(feedback.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-subhead text-muted-foreground/80 leading-relaxed">
                      {feedback.content}
                    </p>

                    {/* Response */}
                    {(feedback.adminNote || feedback.status === 'reviewed') && (
                      <div className="pt-3 border-t border-border/20 space-y-2">
                        <p className="text-caption2 uppercase tracking-wider font-medium text-muted-foreground/60">
                          Response
                        </p>
                        <p className="text-subhead text-foreground/80 leading-relaxed">
                          {feedback.adminNote || DEFAULT_RESPONSE}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
