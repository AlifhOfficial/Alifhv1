/**
 * User Ban Notice Component
 * Shows ban notice to banned users with appeal option
 * Following profile-view design system
 */

'use client';

import { useState } from 'react';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';

interface UserBanNoticeProps {
  banReason: string;
  banExpires: Date | null;
  userId?: string;
}

export function UserBanNotice({ banReason, banExpires, userId }: UserBanNoticeProps) {
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
    } catch (error) {
      alert('Failed to submit appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-8 space-y-6">
      
      <div className="flex gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-medium tracking-tight text-red-900 dark:text-red-100 mb-1">
              Account Suspended
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Your account has been temporarily restricted
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-red-800 dark:text-red-200 uppercase tracking-wider">
              Reason
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {banReason}
            </p>
          </div>

          {isTemporary && banExpires && (
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <Clock className="w-4 h-4" />
              <span>
                Expires: {new Date(banExpires).toLocaleDateString('en-AE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {!isTemporary && (
            <p className="text-sm text-red-700 dark:text-red-300">
              This is a permanent suspension.
            </p>
          )}

          {!showAppealForm && !submitted && (
            <button
              onClick={() => setShowAppealForm(true)}
              className="text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
            >
              Think this is a mistake? Submit an appeal →
            </button>
          )}
        </div>
      </div>

      {showAppealForm && !submitted && (
        <div className="space-y-4 pl-10">
          <div className="space-y-2">
            <label className="text-xs font-medium text-red-800 dark:text-red-200 uppercase tracking-wider">
              Your Appeal
            </label>
            <textarea
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="Explain why you believe this suspension should be reviewed..."
              className="w-full h-24 p-3 bg-white dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl text-sm text-red-900 dark:text-red-100 placeholder:text-red-400 dark:placeholder:text-red-600 focus:outline-none focus:border-red-500 resize-none"
              disabled={submitting}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAppeal}
              disabled={submitting || !appealMessage.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Appeal
            </button>
            <button
              onClick={() => {
                setShowAppealForm(false);
                setAppealMessage('');
              }}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="pl-10 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Appeal submitted successfully. Our team will review your case within 24-48 hours.
          </p>
        </div>
      )}
      
    </div>
  );
}
