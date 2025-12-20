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
  experienceYears?: number | null;
  
  // ❌ Removed: totalInventory, avgResponseTime, responseRate
  // Calculate these on-demand when needed
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
}: PartnerProfileHeaderProps) {
  return (
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {brandName}
        </h1>
        <div className={`w-5 h-5 ${isVerified ? 'text-green-500' : 'text-muted-foreground/40'}`} title={isVerified ? 'Verified Partner' : 'Not Verified'}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>
      
      {/* Badges */}
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
        <p className="text-sm text-muted-foreground py-2">No badges</p>
      )}

    </div>
  );
}

export function PartnerProfileStats({
  googleRating,
  googleReviewCount,
  platformRating,
  platformReviewCount,
  experienceYears,
  tier,
}: Pick<PartnerProfileHeaderProps, 'googleRating' | 'googleReviewCount' | 'platformRating' | 'platformReviewCount' | 'experienceYears' | 'tier'>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Google Rating</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xl font-semibold tracking-tight">{googleRating ? googleRating.toFixed(1) : '—'}</p>
          {googleRating && (
            <>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-500 fill-current">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-xs text-muted-foreground">({googleReviewCount})</span>
            </>
          )}
        </div>
      </div>
      
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Platform Rating</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xl font-semibold tracking-tight">{platformRating ? platformRating.toFixed(1) : '—'}</p>
          {platformRating && (
            <>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-500 fill-current">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-xs text-muted-foreground">({platformReviewCount})</span>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Experience</p>
        <p className="text-xl font-semibold tracking-tight">{experienceYears ? `${experienceYears}+ yrs` : '—'}</p>
      </div>

      {/* ❌ Removed stats (calculate on-demand):
          - Total Inventory
          - Response Time
          - Response Rate
      */}
    </div>
  );
}
