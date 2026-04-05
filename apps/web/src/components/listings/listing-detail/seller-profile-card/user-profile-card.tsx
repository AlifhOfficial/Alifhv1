'use client';

import Link from 'next/link';
import { 
  CheckCircle2, 
  Star, 
  Clock, 
  MapPin, 
  Award,
  Package,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { useSellerStats } from '@/hooks/listings';
import type { UserSellerData } from '@/hooks/listings';
import { formatResponseTime } from './utils';

interface UserProfileCardProps {
  sellerData: UserSellerData;
}

export function UserProfileCard({ sellerData }: UserProfileCardProps) {
  const profile = sellerData.userProfile;
  
  const { stats, isLoading: statsLoading } = useSellerStats('user', sellerData.userId, sellerData.userStats ?? null);
  
  if (!profile) return null;

  const name = profile.userName ?? 
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ?? 
    'Private Seller';
  const avatar = profile.avatar;
  const memberSince = profile.memberSince ?? profile.userCreatedAt ?? new Date();
  const memberSinceYear = new Date(memberSince).getFullYear();
  const hasRating = profile.platformRating !== null && profile.platformRating !== undefined;
  const location = [profile.locationCity, profile.locationEmirate].filter(Boolean).join(', ');
  const badges = profile.badges ?? [];
  const tags = profile.tags ?? [];
  const kycVerified = profile.kycVerified ?? false;
  const emailVerified = profile.emailVerified ?? false;
  const phoneVerified = profile.phoneNumberVerified ?? false;

  return (
    <div className="space-y-5">
      {/* Header with Name and Avatar */}
      <UserHeader 
        name={name}
        avatar={avatar}
        kycVerified={kycVerified}
        location={location}
        memberSinceYear={memberSinceYear}
      />

      {/* Badges */}
      <UserBadges 
        badges={badges}
        emailVerified={emailVerified}
        phoneVerified={phoneVerified}
      />

      {/* Description */}
      {profile?.description && (
        <p className="text-subhead text-muted-foreground leading-relaxed font-medium whitespace-pre-line">
          {profile.description}
        </p>
      )}

      {/* Stats Grid */}
      <UserStatsGrid 
        userId={sellerData.userId}
        stats={stats}
        statsLoading={statsLoading}
        hasRating={hasRating}
        profile={profile}
      />

      {/* Tags */}
      <UserTags tags={tags} />
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface UserHeaderProps {
  name: string;
  avatar?: string | null;
  kycVerified: boolean;
  location: string;
  memberSinceYear: number;
}

function UserHeader({ name, avatar, kycVerified, location, memberSinceYear }: UserHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-headline sm:text-title3 font-bold tracking-tight text-foreground truncate">{name}</h3>
          {kycVerified && (
            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
          )}
        </div>
        
        {location && (
          <div className="flex items-center gap-2 mt-1.5 text-subhead text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate font-semibold">{location}</span>
          </div>
        )}

        <p className="text-subhead text-muted-foreground mt-1.5 font-semibold">
          Member since {memberSinceYear}
        </p>
      </div>

      {/* Avatar */}
      <UserAvatar 
        src={avatar}
        name={name}
        size="md"
        className="w-14 h-14 flex-shrink-0"
      />
    </div>
  );
}

interface UserBadgesProps {
  badges: string[];
  emailVerified: boolean;
  phoneVerified: boolean;
}

function UserBadges({ badges, emailVerified, phoneVerified }: UserBadgesProps) {
  if (badges.length === 0 && !emailVerified && !phoneVerified) return null;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 text-subhead font-semibold text-muted-foreground"
        >
          <Award className="w-4 h-4 text-amber-500" />
          {badge}
        </span>
      ))}
      {emailVerified && (
        <span className="inline-flex items-center gap-1.5 text-subhead font-semibold text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Email
        </span>
      )}
      {phoneVerified && (
        <span className="inline-flex items-center gap-1.5 text-subhead font-semibold text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Phone
        </span>
      )}
    </div>
  );
}

interface UserStatsGridProps {
  userId: string;
  stats: ReturnType<typeof useSellerStats>['stats'];
  statsLoading: boolean;
  hasRating: boolean;
  profile: NonNullable<UserSellerData['userProfile']>;
}

function UserStatsGrid({ userId, stats, statsLoading, hasRating, profile }: UserStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      {/* Inventory - Clickable */}
      <Link 
        href={`/listings?sellerId=${userId}`}
        className="space-y-1 group"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-subhead font-semibold text-muted-foreground/70">Inventory</span>
        </div>
        {statsLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <p className="text-headline font-bold tabular-nums text-foreground">
              {stats && 'listingsCount' in stats ? stats.listingsCount : 0}
            </p>
            <span className="text-caption1 font-semibold text-primary group-hover:underline">View all →</span>
          </>
        )}
      </Link>

      {/* Response Time */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-subhead font-semibold text-muted-foreground/70">Response</span>
        </div>
        <p className="text-headline font-bold tabular-nums text-foreground">
          {statsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : stats?.responseTime ? (
            formatResponseTime(stats.responseTime)
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </p>
      </div>

      {/* Response Rate */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-subhead font-semibold text-muted-foreground/70">Rate</span>
        </div>
        <p className="text-headline font-bold tabular-nums text-foreground">
          {statsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : stats?.responseRate ? (
            `${stats.responseRate}%`
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </p>
      </div>

      {/* Rating */}
      {hasRating && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-subhead font-semibold text-muted-foreground/70">Rating</span>
          </div>
          <p className="text-headline font-bold tabular-nums text-foreground">
            {profile.platformRating!.toFixed(1)}
            <span className="text-subhead font-medium text-muted-foreground ml-1">({profile.platformReviewCount})</span>
          </p>
        </div>
      )}
    </div>
  );
}

function UserTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-footnote uppercase tracking-wider font-bold text-muted-foreground/70">Tags</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 text-subhead font-semibold bg-muted text-foreground/80 rounded-lg"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
