"use client";

import { useState } from "react";
import { respondToReview, deleteReviewResponse } from "../actions";
import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";

interface ReviewResponseFormProps {
  reviewId: string;
  existingResponse?: string | null;
}

export function ReviewResponseForm({ reviewId, existingResponse }: ReviewResponseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState(existingResponse || "");
  const { close } = useRightSidebar();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim()) return;

    setLoading(true);
    setError(null);

    const result = await respondToReview(reviewId, response);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to submit response");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete your response?")) return;

    setLoading(true);
    const result = await deleteReviewResponse(reviewId);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to delete response");
    }
    setLoading(false);
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Your Response</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={8}
            placeholder="Thank you for your review..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Be professional and address the customer's feedback
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          {existingResponse && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              Delete Response
            </button>
          )}
          
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !response.trim()}
              className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Submitting..." : existingResponse ? "Update Response" : "Submit Response"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
