/**
 * User Ban Notice Component
 * Shows ban notice to banned users with appeal option
 * Following profile-view design system
 */

'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface UserBanNoticeProps {
  banReason: string;
  banExpires: Date | null;
  userId?: string;
}

export function UserBanNotice({ banReason, banExpires, userId: _userId }: UserBanNoticeProps) {
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isTemporary = banExpires !== null;
  const hasExpired = banExpires ? new Date(banExpires) < new Date() : false;

  if (hasExpired) {
    return null;
  }

  const handleAppeal = async () => {
    if (!appealMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/appeals/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: appealMessage }),
      });

      if (!response.ok) throw new Error('Failed to submit appeal');

      setSubmitted(true);
      setAppealMessage('');
    } catch {
      alert('Failed to submit appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-10">
      
      <div className="flex flex-col items-center text-center space-y-6 mb-10">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="space-y-3">
          <h2 className="text-title3 font-semibold text-foreground">Account Suspended</h2>
          <p className="text-subhead text-muted-foreground/70 max-w-md">
            Your account has been temporarily restricted
          </p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <p className="text-caption1 text-muted-foreground/70">Reason</p>
          <p className="text-subhead text-foreground">
            {banReason}
          </p>
        </div>

        {isTemporary && banExpires && (
          <div className="space-y-2">
            <p className="text-caption1 text-muted-foreground/70">Expires</p>
            <p className="text-subhead text-foreground">
              {new Date(banExpires).toLocaleDateString('en-AE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        {!isTemporary && (
          <div className="space-y-2">
            <p className="text-subhead text-foreground">This is a permanent suspension.</p>
          </div>
        )}
      </div>

      {!showAppealForm && !submitted && (
        <div className="flex justify-center pt-6 border-t border-border/40">
          <button
            onClick={() => setShowAppealForm(true)}
            className="text-caption1 text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Submit an appeal
          </button>
        </div>
      )}

      {showAppealForm && !submitted && (
        <div className="space-y-6 pt-6 border-t border-border/40">
          <div className="space-y-2">
            <label className="text-subhead font-medium text-foreground">Your Appeal</label>
            <textarea
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="Explain why you believe this suspension should be reviewed..."
              className="w-full p-4 bg-background border border-border/40 rounded-xl focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 resize-none text-foreground"
              rows={4}
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAppeal}
              disabled={submitting || !appealMessage.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-subhead font-medium transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Appeal
            </button>
            <button
              onClick={() => {
                setShowAppealForm(false);
                setAppealMessage('');
              }}
              disabled={submitting}
              className="px-6 py-3 text-subhead font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="space-y-2 pt-6 border-t border-border/40">
          <p className="text-subhead text-green-500">
            Appeal submitted successfully. Our team will review your case within 24-48 hours.
          </p>
        </div>
      )}
    </div>
  );
}
