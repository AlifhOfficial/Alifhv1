/**
 * Profile Header Component
 */

'use client';

interface ProfileHeaderProps {
  displayName: string;
  kycVerified?: boolean;
  badges?: string[];
  inventoryCount?: number;
  carsSold?: number;
  memberSince?: string | Date;
  status?: string;
  createdAt?: string | Date;
  onRequestKycVerification: () => void;
}

export function ProfileHeader({
  displayName,
  kycVerified,
  badges,
  inventoryCount = 0,
  carsSold = 0,
  memberSince,
  status,
  createdAt,
  onRequestKycVerification,
}: ProfileHeaderProps) {
  return (
    <div className="flex-1 min-w-0 pt-3 space-y-4">
      {/* Name with KYC Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium text-foreground">
            {displayName}
          </h1>
          {kycVerified ? (
            <div className="relative inline-flex items-center justify-center w-5 h-5" title="Verified Account">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <circle cx="12" cy="12" r="10" className="text-primary" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          ) : (
            <div className="relative inline-flex items-center justify-center w-4 h-4" title="Not Verified">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <circle cx="12" cy="12" r="10" className="text-muted-foreground/40" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          )}
        </div>
        {!kycVerified && (
          <button
            onClick={onRequestKycVerification}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Request verification
          </button>
        )}
      </div>

      {/* Admin Badges */}
      <div>
        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge: string, idx: number) => (
              <div key={idx} className="px-3 py-1.5 bg-foreground text-background text-xs font-medium">
                {badge}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No badges assigned yet</p>
        )}
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-border/60">
        <div>
          <p className="text-xs text-muted-foreground">Listings</p>
          <p className="text-sm font-medium text-foreground">
            {inventoryCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sold</p>
          <p className="text-sm font-medium text-foreground">
            {carsSold}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Member since</p>
          <p className="text-sm font-medium text-foreground">
            {memberSince ? new Date(memberSince).getFullYear() : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-medium text-foreground">
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Profile created</p>
          <p className="text-sm font-medium text-foreground">
            {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
