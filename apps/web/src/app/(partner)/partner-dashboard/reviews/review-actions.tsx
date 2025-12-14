"use client";

import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { ReviewResponseForm } from "./review-response-form";

interface ReviewActionsProps {
  reviewId: string;
  existingResponse?: string | null;
}

export function ReviewActions({ reviewId, existingResponse }: ReviewActionsProps) {
  const { open } = useRightSidebar();

  return (
    <button
      onClick={() => open(
        existingResponse ? "Edit Response" : "Respond to Review",
        <ReviewResponseForm reviewId={reviewId} existingResponse={existingResponse} />
      )}
      className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted"
    >
      {existingResponse ? "Edit Response" : "Respond"}
    </button>
  );
}
