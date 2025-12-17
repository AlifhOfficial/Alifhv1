/**
 * Partner Profile Header Component
 */

"use client";

interface PartnerProfileHeaderProps {
  brandName: string;
  companyNameLegal: string;
  isVerified?: boolean;
  tier: string;
  badges?: string[];
  googleRating?: number | null;
  googleReviewCount: number;
  platformRating?: number | null;
  platformReviewCount: number;
  totalInventory: number;
  avgResponseTime?: number | null;
  responseRate?: number | null;
}

export function PartnerProfileHeader({
  brandName,
  companyNameLegal,
  isVerified,
  tier,
  badges,
  googleRating,
  googleReviewCount,
  platformRating,
  platformReviewCount,
  totalInventory,
  avgResponseTime,
  responseRate,
}: PartnerProfileHeaderProps) {
  return (
    <div className="flex-1 min-w-0 pt-3 space-y-4">
      <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-foreground">
              {brandName}
            </h1>
            {isVerified && (
              <div className="relative inline-flex items-center justify-center w-5 h-5" title="Verified Partner">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <circle cx="12" cy="12" r="10" className="text-primary" />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            )}
          </div>
        <p className="text-sm text-muted-foreground mt-1">{companyNameLegal}</p>
      </div>
      
      {/* Badges */}
      <div>
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="px-3 py-1.5 bg-foreground text-background text-xs font-medium"
                >
                  {badge}
                </div>
              ))}
            </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No badges assigned yet</p>
        )}
      </div>

      {/* Partner Stats */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-border/60">
          <div>
            <p className="text-xs text-muted-foreground">Google Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-foreground">
                {googleRating ? googleRating.toFixed(1) : '—'}
              </p>
              {googleRating && (
                <>
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-yellow-500 fill-current">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="text-xs text-muted-foreground">({googleReviewCount})</span>
                </>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Platform Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-foreground">
                {platformRating ? platformRating.toFixed(1) : '—'}
              </p>
              {platformRating && (
                <>
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-yellow-500 fill-current">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="text-xs text-muted-foreground">({platformReviewCount})</span>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Total Inventory</p>
            <p className="text-sm font-medium text-foreground">{totalInventory}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Avg Response Time</p>
            <p className="text-sm font-medium text-foreground">
              {avgResponseTime ? `${avgResponseTime}min` : '—'}
            </p>
          </div>

        <div>
          <p className="text-xs text-muted-foreground">Response Rate</p>
          <p className="text-sm font-medium text-foreground">
            {responseRate ? `${responseRate.toFixed(0)}%` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
