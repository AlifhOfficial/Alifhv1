'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Car, 
  Calendar, 
  Heart, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Plus,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { DashboardPageLayout } from '@/components/shared/layout';
import { PartnerApplicationStatus, UserBanNotice } from '@/components/dashboards/user';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { useUserProfile } from '@/hooks/profile';

type UserStats = {
  listingsCount: number;
  soldCount: number;
  responseRate: number | null;
};

type UpcomingBooking = {
  id: string;
  partnerName: string;
  listing: {
    make: string;
    model: string;
    year: number;
  };
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: string;
};

type RecentListing = {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  price: number | null;
  thumbnail: string | null;
  status: string;
  viewCount: number;
  inquiryCount: number;
};

type RecentActivity = {
  id: string;
  type: 'favorite' | 'superlike';
  listingId: string;
  listingTitle: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

interface UserDashboardOverviewProps {
  user: any;
}

export function UserDashboardOverview({ user }: UserDashboardOverviewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [bookings, setBookings] = useState<UpcomingBooking[]>([]);
  const [listings, setListings] = useState<RecentListing[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [superlikeQuota, setSuperlikeQuota] = useState({ used: 0, total: 5, remaining: 5 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Subscribe to profile updates for instant avatar sync
  const { profile } = useUserProfile();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes, listingsRes, favoritesRes, unreadRes, conversationsRes] = await Promise.all([
          fetch('/api/user/stats', { credentials: 'include' }),
          fetch('/api/bookings?limit=3', { credentials: 'include' }),
          fetch('/api/listings/my-listings?limit=4&status=published', { credentials: 'include' }),
          fetch('/api/engagement/favorites-status', { credentials: 'include' }),
          fetch('/api/conversations/unread-count', { credentials: 'include' }),
          fetch('/api/conversations?limit=5', { credentials: 'include' }),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          const upcoming = data.bookings?.filter((b: UpcomingBooking) => 
            ['pending', 'confirmed'].includes(b.status) && 
            new Date(b.scheduledStartTime) > new Date()
          ).slice(0, 3) || [];
          setBookings(upcoming);
        }

        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setListings(data.listings?.slice(0, 4) || []);
        }

        if (favoritesRes.ok) {
          const data = await favoritesRes.json();
          setFavoritesCount(data.favorites?.length || 0);
          
          // Set superlike quota
          if (data.quota) {
            setSuperlikeQuota({
              used: data.quota.currentMonthSuperlikesUsed || 0,
              total: data.quota.maxSuperlikesPerMonth || 5,
              remaining: (data.quota.maxSuperlikesPerMonth || 5) - (data.quota.currentMonthSuperlikesUsed || 0),
            });
          }

          // Build recent activity from favorites and superlikes
          const activities: RecentActivity[] = [];
          
          if (data.favorites && Array.isArray(data.favorites)) {
            data.favorites.slice(0, 3).forEach((fav: any) => {
              activities.push({
                id: fav.id || Math.random().toString(),
                type: 'favorite',
                listingId: fav.listingId || fav,
                listingTitle: fav.title || 'Saved listing',
                createdAt: fav.createdAt || new Date().toISOString(),
              });
            });
          }

          if (data.superlikes && Array.isArray(data.superlikes)) {
            data.superlikes.slice(0, 2).forEach((sl: any) => {
              activities.push({
                id: sl.id || Math.random().toString(),
                type: 'superlike',
                listingId: sl.listingId || sl,
                listingTitle: sl.title || 'Superliked listing',
                createdAt: sl.createdAt || new Date().toISOString(),
              });
            });
          }

          // Sort by date and take top 5
          activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentActivity(activities.slice(0, 5));
        }

        if (unreadRes.ok) {
          const data = await unreadRes.json();
          setUnreadCount(data.unreadCount || 0);
        }

        if (conversationsRes.ok) {
          const data = await conversationsRes.json();
          const convos = data.conversations?.slice(0, 5).map((c: any) => ({
            id: c.id,
            partnerName: c.otherParticipant?.name || c.partner?.name || 'User',
            partnerAvatar: c.otherParticipant?.avatarUrl || c.partner?.logo || null,
            lastMessage: c.lastMessagePreview || 'No messages yet',
            lastMessageAt: c.lastMessageAt || c.updatedAt,
            unreadCount: c.unreadCount || 0,
          })) || [];
          setConversations(convos);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDateString = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Extract user info - prefer profile hook for instant sync, fall back to server data
  const firstName = profile?.firstName || user?.profile?.firstName || user?.name?.split(' ')[0] || 'there';
  const lastName = profile?.lastName || user?.profile?.lastName || user?.name?.split(' ')[1] || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : (user?.name || 'User');
  // Use profile hook for instant sync of avatar/preferences
  const avatarUrl = profile?.avatarUrl || user?.profile?.avatarUrl || user?.avatarUrl || null;
  const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? user?.useGeneratedAvatar ?? true;
  const kycVerified = profile?.kycVerified || user?.profile?.kycVerified || false;
  const locationEmirate = profile?.locationEmirate || user?.profile?.locationEmirate || null;
  const locationCity = profile?.locationCity || user?.profile?.locationCity || null;
  const memberSince = profile?.memberSince || user?.profile?.memberSince || user?.createdAt || null;

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <DashboardPageLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Ban Notice */}
        {user?.banned && user?.banReason && (
          <UserBanNotice 
            banReason={user.banReason} 
            banExpires={user.banExpires || undefined} 
            userId={user.id}
          />
        )}

        {/* Partner Application Status */}
        <PartnerApplicationStatus />

        {/* Hero Section - Greeting */}
        <section>
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {getGreeting()}, {firstName}!
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{getTimeString()}</span>
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>All systems operational</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-0.5">{getDateString()}</p>
            </div>

            {/* Profile Summary - Desktop Only */}
            <div className="hidden lg:flex items-center gap-4 border-l border-border pl-6">
              <UserAvatar
                src={avatarUrl}
                name={fullName}
                size="md"
                className="flex-shrink-0"
                useGeneratedAvatar={useGeneratedAvatar}
              />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{fullName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {kycVerified ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Shield className="w-3 h-3" />
                      <span>Pending</span>
                    </div>
                  )}
                  {locationEmirate && (
                    <>
                      <span className="text-border">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{locationEmirate}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <Link 
                    href="/user-dashboard/profile"
                    className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <span className="text-border">•</span>
                  <Link 
                    href="/user-dashboard/settings"
                    className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Overview</h3>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 border border-border rounded-xl divide-x divide-border overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="w-5 h-5 bg-muted rounded mx-auto mb-2" />
                  <div className="w-14 h-3 bg-muted rounded mx-auto mb-1.5" />
                  <div className="w-10 h-5 bg-muted rounded mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 border border-border rounded-xl divide-x divide-border overflow-hidden">
              <Link 
                href="/user-dashboard/listings/my-listings"
                className="p-6 text-center hover:bg-muted/50 transition-colors"
              >
                <Car className="w-4 h-4 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-0.5">Listings</p>
                <p className="text-lg font-semibold text-blue-500">{stats?.listingsCount || 0}</p>
              </Link>

              <Link 
                href="/user-dashboard/bookings"
                className="p-6 text-center hover:bg-muted/50 transition-colors"
              >
                <Calendar className="w-4 h-4 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-0.5">Bookings</p>
                <p className="text-lg font-semibold text-green-500">{bookings.length}</p>
              </Link>

              <Link 
                href="/user-dashboard/favorites"
                className="p-6 text-center hover:bg-muted/50 transition-colors"
              >
                <Heart className="w-4 h-4 text-yellow-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-0.5">Favorites</p>
                <p className="text-lg font-semibold text-yellow-500">{favoritesCount}</p>
              </Link>

              <Link 
                href="/user-dashboard/messaging"
                className="p-6 text-center hover:bg-muted/50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-0.5">Messages</p>
                <p className="text-lg font-semibold">{unreadCount}</p>
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming Bookings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Upcoming Appointments</h3>
            {bookings.length > 0 && (
              <Link 
                href="/user-dashboard/bookings"
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border-l-2 border-border pl-4 py-2 animate-pulse">
                  <div className="w-28 h-4 bg-muted rounded mb-1.5" />
                  <div className="w-40 h-3 bg-muted rounded mb-1.5" />
                  <div className="w-20 h-3 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="border-l-2 border-green-500 pl-4 py-1">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-sm font-medium">{booking.partnerName || 'Unknown Dealer'}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.listing 
                          ? `${booking.listing.year} ${booking.listing.make} ${booking.listing.model}`
                          : 'Listing no longer available'}
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-xs font-medium">
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(booking.scheduledStartTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })} at {new Date(booking.scheduledStartTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-xl p-8 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground mb-3">No upcoming appointments</p>
              <Link 
                href="/listings"
                className="inline-flex px-4 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          )}
        </section>

        {/* Active Listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your Listings</h3>
            {listings.length > 0 && (
              <Link 
                href="/user-dashboard/listings/my-listings"
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-border rounded-xl animate-pulse overflow-hidden">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-3">
                    <div className="w-20 h-3 bg-muted rounded mb-1.5" />
                    <div className="w-14 h-4 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/user-dashboard/listings/${listing.id}/edit`}
                  className="group border border-border rounded-xl hover:bg-muted/50 transition-colors overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {listing.thumbnail ? (
                      <img 
                        src={listing.thumbnail} 
                        alt={`${listing.make} ${listing.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-muted-foreground opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium truncate mb-0.5">
                      {listing.year} {listing.make} {listing.model}
                    </p>
                    <p className="text-sm font-semibold text-blue-500 mb-1">
                      AED {listing.price?.toLocaleString() || 'N/A'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{listing.viewCount} views</span>
                      <span className="text-border">•</span>
                      <span>{listing.inquiryCount} inquiries</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-xl p-8 text-center">
              <Car className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground mb-3">No active listings yet</p>
              <Link 
                href="/user-dashboard/listings/new"
                className="inline-flex px-4 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
              >
                Create Listing
              </Link>
            </div>
          )}
        </section>

        {/* Recent Activity & Messages Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recent Activity</h3>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                    <div className="w-7 h-7 bg-muted rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="w-28 h-3 bg-muted rounded" />
                      <div className="w-20 h-2.5 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-muted/50 transition-colors rounded">
                    <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'superlike' 
                        ? 'bg-yellow-500/10' 
                        : 'bg-blue-500/10'
                    }`}>
                      {activity.type === 'superlike' ? (
                        <Heart className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Heart className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">
                        {activity.type === 'superlike' ? 'Superliked' : 'Saved'} {activity.listingTitle}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Superlike Quota */}
                <div className="pt-3 mt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Superlike Quota</p>
                    <p className="text-xs font-medium">
                      {superlikeQuota.remaining}/{superlikeQuota.total}
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all"
                      style={{ width: `${(superlikeQuota.used / superlikeQuota.total) * 100}%` }}
                    />
                  </div>
                </div>

                <Link
                  href="/user-dashboard/favorites"
                  className="block text-center text-xs text-blue-500 hover:text-blue-600 transition-colors pt-3"
                >
                  View All Activity →
                </Link>
              </div>
            ) : (
              <div className="border border-border rounded-xl p-6 text-center">
                <Heart className="w-6 h-6 text-muted-foreground mx-auto mb-1.5 opacity-40" />
                <p className="text-xs text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>

          {/* Recent Messages */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Messages</h3>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-xl animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="w-24 h-3 bg-muted rounded" />
                      <div className="w-36 h-2.5 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/user-dashboard/messaging?conversation=${conv.id}`}
                    className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <UserAvatar
                      src={conv.partnerAvatar}
                      name={conv.partnerName}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-xs font-medium truncate">{conv.partnerName}</p>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-medium">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </Link>
                ))}

                <Link
                  href="/user-dashboard/messaging"
                  className="block text-center text-xs text-blue-500 hover:text-blue-600 transition-colors pt-2"
                >
                  View All Messages →
                </Link>
              </div>
            ) : (
              <div className="border border-border rounded-xl p-6 text-center">
                <MessageSquare className="w-6 h-6 text-muted-foreground mx-auto mb-1.5 opacity-40" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/user-dashboard/listings/new"
              className="group border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-sm font-medium">Post Listing</p>
              <p className="text-xs text-muted-foreground">Sell your car</p>
            </Link>

            <Link
              href="/listings"
              className="group border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-green-500" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-sm font-medium">Browse Cars</p>
              <p className="text-xs text-muted-foreground">Find your next car</p>
            </Link>

            <Link
              href="/user-dashboard/profile"
              className="group border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-yellow-500" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-sm font-medium">Edit Profile</p>
              <p className="text-xs text-muted-foreground">Update your info</p>
            </Link>

            <Link
              href="/user-dashboard/settings"
              className="group border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-foreground" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-sm font-medium">Settings</p>
              <p className="text-xs text-muted-foreground">Manage preferences</p>
            </Link>
          </div>
        </section>
      </div>
    </DashboardPageLayout>
  );
}
