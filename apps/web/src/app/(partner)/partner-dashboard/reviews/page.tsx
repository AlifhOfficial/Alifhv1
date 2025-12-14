import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReviewActions } from "./review-actions";

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
      <div className="p-6 md:p-10 space-y-12">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Reviews</div>
            <div className="text-2xl font-semibold text-foreground">{reviews.length}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Average Rating</div>
            <div className="text-2xl font-semibold text-foreground">
              ⭐ {avgRating.toFixed(1)}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Response Rate</div>
            <div className="text-2xl font-semibold text-foreground">{responseRate.toFixed(0)}%</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Verified Purchases</div>
            <div className="text-2xl font-semibold text-foreground">
              {reviews.filter(r => r.isVerifiedPurchase).length}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-medium text-foreground mb-6">Rating Distribution</h2>
          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-foreground">{item.rating}</span>
                  <span className="text-sm text-muted-foreground">⭐</span>
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground w-16 text-right">
                  {item.count} ({item.percentage.toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-foreground">All Reviews</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            ✓ Verified Purchase
                          </span>
                        )}

                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          review.status === 'published' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {review.status}
                        </span>
                      </div>

                      {review.title && (
                        <h3 className="text-base font-medium text-foreground mb-2">
                          {review.title}
                        </h3>
                      )}

                      <div className="text-sm text-muted-foreground mb-2">
                        By {review.reviewer?.name || 'Anonymous'} • {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.review && (
                    <p className="text-sm text-foreground mb-4 leading-relaxed">
                      {review.review}
                    </p>
                  )}

                  {/* Category Ratings */}
                  {(review.communicationRating || review.vehicleConditionRating || review.processRating) && (
                    <div className="mb-4 pb-4 border-b border-border/60">
                      <div className="text-xs font-medium text-muted-foreground mb-3">Category Ratings</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {review.communicationRating && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Communication</span>
                            <span className="text-xs font-medium text-foreground">
                              {review.communicationRating}/5
                            </span>
                          </div>
                        )}
                        {review.vehicleConditionRating && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Vehicle Condition</span>
                            <span className="text-xs font-medium text-foreground">
                              {review.vehicleConditionRating}/5
                            </span>
                          </div>
                        )}
                        {review.processRating && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Process</span>
                            <span className="text-xs font-medium text-foreground">
                              {review.processRating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Helpful Counts */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span>👍 {review.helpfulCount ?? 0} helpful</span>
                  </div>

                  {/* Partner Response */}
                  {review.partnerResponse ? (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-foreground">Your Response</span>
                          <span className="text-xs text-muted-foreground">
                            • {formatDate(review.respondedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {review.partnerResponse}
                        </p>
                      </div>
                      <ReviewActions reviewId={review.id} existingResponse={review.partnerResponse} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>💬 No response yet</span>
                      </div>
                      <ReviewActions reviewId={review.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
