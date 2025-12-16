import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export default async function ReviewsPage() {
  const user = await requireRole("admin");

  // Fetch reviews with partner and user info
  const reviews = await db
    .select({
      id: schema.partnerReview.id,
      rating: schema.partnerReview.rating,
      title: schema.partnerReview.title,
      review: schema.partnerReview.review,
      communicationRating: schema.partnerReview.communicationRating,
      vehicleConditionRating: schema.partnerReview.vehicleConditionRating,
      processRating: schema.partnerReview.processRating,
      status: schema.partnerReview.status,
      isVerifiedPurchase: schema.partnerReview.isVerifiedPurchase,
      helpfulCount: schema.partnerReview.helpfulCount,
      partnerResponse: schema.partnerReview.partnerResponse,
      createdAt: schema.partnerReview.createdAt,
      partner: {
        id: schema.partner.id,
        brandName: schema.partner.brandName,
        companyNameLegal: schema.partner.companyNameLegal,
      },
      user: {
        name: schema.user.name,
      },
    })
    .from(schema.partnerReview)
    .leftJoin(schema.partner, eq(schema.partnerReview.partnerId, schema.partner.id))
    .leftJoin(schema.user, eq(schema.partnerReview.userId, schema.user.id))
    .orderBy(desc(schema.partnerReview.createdAt))
    .limit(100);

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const publishedCount = reviews.filter(r => r.status === 'published').length;
  const flaggedCount = reviews.filter(r => r.status === 'flagged').length;

  return (
    <DashboardDisplayArea
      title="Reviews"
      description="Moderate and manage partner reviews"
    >
      <div className="p-6 md:p-10">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Pending</div>
            <div className="text-2xl font-semibold text-foreground">{pendingCount}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Published</div>
            <div className="text-2xl font-semibold text-foreground">{publishedCount}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Flagged</div>
            <div className="text-2xl font-semibold text-foreground">{flaggedCount}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Reviews</div>
            <div className="text-2xl font-semibold text-foreground">{reviews.length}</div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">All Reviews</h2>
            <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {review.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-yellow-600">
                          {'⭐'.repeat(review.rating ?? 0)}
                          {' '}
                          {review.rating}/5
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            ✓ Verified Purchase
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          review.status === 'published' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          review.status === 'flagged' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {review.status}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground mb-3">
                        For:{' '}
                        <Link 
                          href={`/admin-dashboard/partners/${review.partner?.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {review.partner?.brandName || review.partner?.companyNameLegal}
                        </Link>
                        {' • '}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>

                      {review.title && (
                        <h4 className="text-sm font-medium text-foreground mb-2">{review.title}</h4>
                      )}

                      {review.review && (
                        <p className="text-sm text-muted-foreground mb-4">{review.review}</p>
                      )}

                      {/* Category Ratings */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {review.communicationRating && (
                          <div>
                            <div className="text-xs text-muted-foreground">Communication</div>
                            <div className="text-sm text-foreground mt-1">
                              {'⭐'.repeat(review.communicationRating)}
                            </div>
                          </div>
                        )}
                        
                        {review.vehicleConditionRating && (
                          <div>
                            <div className="text-xs text-muted-foreground">Vehicle Condition</div>
                            <div className="text-sm text-foreground mt-1">
                              {'⭐'.repeat(review.vehicleConditionRating)}
                            </div>
                          </div>
                        )}
                        
                        {review.processRating && (
                          <div>
                            <div className="text-xs text-muted-foreground">Process</div>
                            <div className="text-sm text-foreground mt-1">
                              {'⭐'.repeat(review.processRating)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Partner Response */}
                      {review.partnerResponse && (
                        <div className="mt-4 p-4 bg-muted/30 border border-border/40 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-2">Partner Response</div>
                          <p className="text-sm text-foreground">{review.partnerResponse}</p>
                        </div>
                      )}

                      {/* Engagement */}
                      {review.helpfulCount && review.helpfulCount > 0 && (
                        <div className="mt-4 text-xs text-muted-foreground">
                          {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
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
