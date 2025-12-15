import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReviewActions } from "./review-actions";
import { 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  ThumbsUp, 
  Reply, 
  CheckCircle2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

export default async function PartnerReviewsPage() {
  const user = await requireAuth();

  // Fetch partner data
  const membership = await db
    .select({
      partnerId: schema.partnerStaff.partnerId,
      role: schema.partnerStaff.role,
    })
    .from(schema.partnerStaff)
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    redirect('/partner-dashboard');
  }

  const partnerId = membership[0].partnerId;

  // Fetch all reviews
  const reviews = await db
    .select({
      id: schema.partnerReview.id,
      rating: schema.partnerReview.rating,
      title: schema.partnerReview.title,
      review: schema.partnerReview.review,
      isVerifiedPurchase: schema.partnerReview.isVerifiedPurchase,
      communicationRating: schema.partnerReview.communicationRating,
      vehicleConditionRating: schema.partnerReview.vehicleConditionRating,
      processRating: schema.partnerReview.processRating,
      helpfulCount: schema.partnerReview.helpfulCount,
      status: schema.partnerReview.status,
      partnerResponse: schema.partnerReview.partnerResponse,
      respondedAt: schema.partnerReview.respondedAt,
      createdAt: schema.partnerReview.createdAt,
      reviewer: {
        name: schema.user.name,
      },
    })
    .from(schema.partnerReview)
    .leftJoin(schema.user, eq(schema.partnerReview.userId, schema.user.id))
    .where(eq(schema.partnerReview.partnerId, partnerId))
    .orderBy(desc(schema.partnerReview.createdAt));

  // Calculate stats
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
  
  const respondedReviews = reviews.filter(r => r.partnerResponse).length;
  const responseRate = reviews.length > 0 ? (respondedReviews / reviews.length * 100) : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length * 100) : 0
  }));

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <DashboardDisplayArea
      title="Customer Reviews"
      description="Manage and respond to customer feedback"
    >
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-10">
        
        {/* Unified Summary Section */}
        <div className="flex flex-col md:flex-row gap-8 pb-10 border-b border-border/40">
          {/* Big Rating */}
          <div className="flex flex-col justify-center min-w-[140px]">
            <div className="text-5xl font-semibold tracking-tight text-foreground mb-2">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-amber-500 text-amber-500' : 'fill-muted/20 text-muted/20'}`} 
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {reviews.length} reviews
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 max-w-sm pt-2">
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3 text-xs">
                  <span className="w-3 font-medium text-muted-foreground">{item.rating}</span>
                  <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics - Minimalist */}
          <div className="flex-1 flex items-center justify-end gap-12">
            <div className="text-right">
              <div className="text-2xl font-medium text-foreground">{responseRate.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Response Rate</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-medium text-foreground">
                {reviews.filter(r => r.isVerifiedPurchase).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Verified Buyers</div>
            </div>
          </div>
        </div>

        {/* Reviews List - Clean & Linear */}
        <div className="space-y-8">
          {reviews.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {reviews.map((review) => (
                <div key={review.id} className="py-8 first:pt-0">
                  <div className="flex items-start gap-4">
                    {/* Avatar Placeholder */}
                    <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center shrink-0 text-sm font-medium text-muted-foreground">
                      {review.reviewer?.name?.charAt(0) || 'A'}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">
                            {review.reviewer?.name || 'Anonymous'}
                          </span>
                          {review.isVerifiedPurchase && (
                            <div className="group relative" title="Verified Purchase">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            • {formatDate(review.createdAt)}
                          </span>
                        </div>
                        
                        {/* Status Indicator - Minimal Dot */}
                        <div className="flex items-center gap-3">
                          {review.status === 'pending' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/10" title="Pending Approval" />
                          )}
                          <ReviewActions reviewId={review.id} existingResponse={review.partnerResponse} />
                        </div>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'fill-muted/20 text-muted/20'}`} 
                          />
                        ))}
                      </div>

                      {/* Title & Body */}
                      {review.title && (
                        <h3 className="text-sm font-medium text-foreground mb-1">
                          {review.title}
                        </h3>
                      )}
                      {review.review && (
                        <p className="text-sm text-foreground/90 leading-relaxed mb-4 max-w-3xl">
                          {review.review}
                        </p>
                      )}

                      {/* Category Ratings - Inline Text */}
                      {(review.communicationRating || review.vehicleConditionRating || review.processRating) && (
                        <div className="flex items-center gap-6 mb-4 text-xs text-muted-foreground">
                          {review.communicationRating && (
                            <div className="flex items-center gap-1.5">
                              <span>Communication</span>
                              <span className="font-medium text-foreground">{review.communicationRating}/5</span>
                            </div>
                          )}
                          {review.vehicleConditionRating && (
                            <div className="flex items-center gap-1.5">
                              <span>Vehicle</span>
                              <span className="font-medium text-foreground">{review.vehicleConditionRating}/5</span>
                            </div>
                          )}
                          {review.processRating && (
                            <div className="flex items-center gap-1.5">
                              <span>Process</span>
                              <span className="font-medium text-foreground">{review.processRating}/5</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Partner Response - Threaded Style */}
                      {review.partnerResponse && (
                        <div className="mt-4 pl-4 border-l-2 border-border/60">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">Response</span>
                            <span className="text-xs text-muted-foreground">
                              • {formatDate(review.respondedAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.partnerResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
