/**
 * Partner Bookings Client Component
 * Displays partner's bookings with staff filtering and stats
 * Consistent with PartnerInventoryClient pattern
 */

'use client';

import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { Calendar, Users, Clock, CheckCircle2 } from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";

interface PartnerBookingsClientProps {
  partnerId: string;
  partnerName: string;
  userRole?: string; // owner | admin | staff
}

interface BookingData {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledStartTime: Date;
  userName: string;
  userEmail: string;
  listingTitle: string;
  listingThumbnail: string | null;
  listingMake: string;
  listingModel: string;
  listingYear: number;
  listingId?: string;
  staffUserId?: string | null;
  staffName?: string | null;
  staffAvatar?: string | null;
  createdAt: Date;
}

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  todayBookings: number;
  upcomingBookings: number;
}

interface StaffBookingStats {
  staffUserId: string;
  staffName: string;
  bookingCount: number;
  avatar?: string | null;
  isActive?: boolean;
}

interface TeamMember {
  id: string;
  userId: string;
  status: 'active' | 'left';
  displayName: string;
  username: string;
  avatar: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending' },
  confirmed: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Confirmed' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Cancelled' },
  no_show: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'No Show' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rejected' },
};

export function PartnerBookingsClient({ 
  partnerId, 
  partnerName,
  userRole,
}: PartnerBookingsClientProps) {
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    // Cancel any in-flight request to prevent race conditions
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        partnerId,
        includeStats: '1',
        limit: '100',
      });

      // Fetch bookings and team data in parallel
      const [bookingsResponse, teamResponse] = await Promise.all([
        fetch(`/api/bookings/partner-bookings?${params}`, {
          credentials: 'include',
          cache: 'no-store',
          signal: abortControllerRef.current.signal,
        }),
        fetch('/api/partner/staff', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: abortControllerRef.current.signal,
        }),
      ]);

      if (!bookingsResponse.ok) {
        const errorData = await bookingsResponse.json().catch(() => ({ error: 'Failed to fetch bookings' }));
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const data = await bookingsResponse.json();
      setAllBookings(data.data || []);
      if (data.stats) {
        setStats(data.stats);
      }

      // Process team data if available
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const allStaff = teamData.data || [];
        
        // Find and store owner's userId
        const owner = allStaff.find((m: any) => m.isOwner || m.role === 'owner');
        if (owner) {
          setOwnerUserId(owner.userId);
        }
        
        // Filter out owners - they shouldn't appear in staff list for filtering
        const members = allStaff
          .filter((m: any) => !m.isOwner && m.role !== 'owner')
          .map((m: any) => ({
            id: m.id,
            userId: m.userId,
            status: m.status,
            displayName: m.displayName || m.userName || m.userEmail,
            username: m.userEmail?.split('@')[0] || '',
            avatar: m.userAvatar,
          }));
        setTeamMembers(members);
      }
    } catch (err) {
      // Ignore aborted requests - they are intentional
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [partnerId]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
    
    // Cleanup: abort in-flight requests on unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  // Create a Map for O(1) team member lookups
  const teamMemberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    teamMembers.forEach(m => map.set(m.userId, m));
    return map;
  }, [teamMembers]);

  // Calculate all staff data including those with 0 bookings
  const allStaffData = useMemo(() => {
    const staffMap = new Map<string, StaffBookingStats>();
    
    // Build stats from bookings (for staff who have bookings)
    allBookings.forEach(booking => {
      if (booking.staffUserId && booking.staffName && booking.staffUserId !== ownerUserId) {
        const existing = staffMap.get(booking.staffUserId);
        if (existing) {
          existing.bookingCount++;
        } else {
          const teamMember = teamMemberMap.get(booking.staffUserId);
          const isActive = teamMember ? teamMember.status === 'active' : true;
          
          staffMap.set(booking.staffUserId, {
            staffUserId: booking.staffUserId,
            staffName: booking.staffName,
            bookingCount: 1,
            avatar: teamMember?.avatar || booking.staffAvatar,
            isActive,
          });
        }
      }
    });
    
    // Add active team members who don't have any bookings yet
    teamMembers.forEach(m => {
      if (m.status === 'active' && !staffMap.has(m.userId)) {
        staffMap.set(m.userId, {
          staffUserId: m.userId,
          staffName: m.displayName,
          bookingCount: 0,
          isActive: true,
          avatar: m.avatar,
        });
      }
    });
    
    // Convert to array and sort: active staff first, then resigned, each sorted by booking count
    const allStaff = Array.from(staffMap.values()).sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b.bookingCount - a.bookingCount;
    });
    
    const activeStaff = allStaff.filter(s => s.isActive !== false);
    const staffWithBookings = allStaff.filter(s => s.bookingCount > 0);
    
    return { allStaff, activeStaff, staffWithBookings };
  }, [allBookings, teamMembers, teamMemberMap, ownerUserId]);

  // Derived values
  const allStaffForDisplay = allStaffData.allStaff;

  // Filter bookings by selected staff
  const filteredBookings = useMemo(() => {
    if (selectedStaffFilter === 'all') return allBookings;
    return allBookings.filter(b => b.staffUserId === selectedStaffFilter);
  }, [allBookings, selectedStaffFilter]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
      {/* Header */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
            <p className="text-sm text-muted-foreground mt-2">
              View and manage customer bookings for your dealership
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="space-y-6">
            {/* Primary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border">
              <div className="p-8 text-center">
                <Calendar className="w-5 h-5 text-yellow-500 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground mb-1">Today</p>
                <p className="text-xl font-semibold text-yellow-500">{stats.todayBookings}</p>
              </div>
              <div className="p-8 text-center">
                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
                <p className="text-xl font-semibold text-blue-500">{stats.upcomingBookings}</p>
              </div>
              <div className="p-8 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-xl font-semibold text-green-500">{stats.completedBookings}</p>
              </div>
              <div className="p-8 text-center">
                <Users className="w-5 h-5 text-foreground mx-auto mb-3" />
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-xl font-semibold text-foreground">{stats.totalBookings}</p>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="text-lg font-semibold text-yellow-500">{stats.pendingBookings}</p>
              </div>
              <div className="p-4 rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
                <p className="text-lg font-semibold text-green-500">{stats.confirmedBookings}</p>
              </div>
              <div className="p-4 rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Cancelled</p>
                <p className="text-lg font-semibold text-red-500">{stats.cancelledBookings}</p>
              </div>
              <div className="p-4 rounded-xl border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">No Show</p>
                <p className="text-lg font-semibold text-red-500">{stats.noShowBookings}</p>
              </div>
            </div>
          </div>
        )}

        {/* Staff Bookings */}
        {allStaffForDisplay.length > 0 && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Staff Bookings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Bookings received for each staff member's listings
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allStaffForDisplay.map((staff) => (
                <button
                  key={staff.staffUserId}
                  onClick={() => setSelectedStaffFilter(staff.staffUserId)}
                  className={`p-6 rounded-xl border text-left transition-colors ${
                    selectedStaffFilter === staff.staffUserId
                      ? 'border-blue-500 bg-blue-500/10'
                      : staff.isActive === false
                        ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                        : 'border-border hover:bg-secondary/10'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar
                      size="md"
                      src={staff.avatar}
                      name={staff.staffName}
                      className={staff.isActive === false ? 'opacity-60' : ''}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${staff.isActive === false ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {staff.staffName}
                        </p>
                        {staff.isActive === false ? (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-xs font-medium">Resigned</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-semibold ${staff.isActive === false ? 'text-red-500' : 'text-blue-500'}`}>{staff.bookingCount}</p>
                    <p className="text-xs text-muted-foreground">{staff.bookingCount === 1 ? 'booking' : 'bookings'}</p>
                    {staff.isActive === false && staff.bookingCount > 0 && (
                      <span className="text-xs text-red-500">needs attention</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Filter Actions */}
            {selectedStaffFilter !== 'all' && (() => {
              const selectedStaff = allStaffForDisplay.find(s => s.staffUserId === selectedStaffFilter);
              const isResigned = selectedStaff?.isActive === false;
              
              return (
                <div className={`flex items-center justify-between p-4 rounded-xl border ${
                  isResigned 
                    ? 'border-red-500/20 bg-red-500/10' 
                    : 'border-blue-500/20 bg-blue-500/10'
                }`}>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Showing bookings for <span className="font-medium">{selectedStaff?.staffName}</span>'s listings
                      {isResigned && (
                        <span className="ml-2 text-red-500">(Resigned - these bookings may need attention)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedStaffFilter('all')}
                      className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors"
                    >
                      Show All
                    </button>
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </section>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading bookings...</p>
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && filteredBookings.length > 0 && (
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Recent Bookings</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
              {selectedStaffFilter !== 'all' && ` for ${allStaffForDisplay.find(s => s.staffUserId === selectedStaffFilter)?.staffName}`}
            </p>
          </div>

          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusInfo = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
              const teamMember = booking.staffUserId ? teamMemberMap.get(booking.staffUserId) : null;
              
              return (
                <div
                  key={booking.id}
                  className="rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="w-32 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {booking.listingThumbnail ? (
                        <img
                          src={booking.listingThumbnail}
                          alt={booking.listingTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-medium">{booking.listingTitle}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Customer: {booking.userName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.scheduledStartTime).toLocaleString()}
                          </p>
                          
                          {/* Staff Member Info */}
                          {booking.staffName && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <UserAvatar
                                size="xs"
                                src={teamMember?.avatar || booking.staffAvatar}
                                name={booking.staffName}
                              />
                              <span>
                                Listing by <span className="font-medium text-foreground">{booking.staffName}</span>
                                {teamMember?.status === 'left' && (
                                  <span className="ml-1 text-red-500">(Resigned)</span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State - No bookings at all */}
      {!isLoading && !error && allBookings.length === 0 && (
        <div className="rounded-xl border border-border p-16 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
          <p className="text-sm text-muted-foreground">
            Customer bookings will appear here once they schedule appointments
          </p>
        </div>
      )}

      {/* Empty State - No bookings in current filter */}
      {!isLoading && !error && allBookings.length > 0 && filteredBookings.length === 0 && (
        <div className="rounded-xl border border-border p-16 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No bookings</h3>
          <p className="text-sm text-muted-foreground">
            No bookings found for {allStaffForDisplay.find(s => s.staffUserId === selectedStaffFilter)?.staffName}'s listings
          </p>
        </div>
      )}

    </div>
  );
}
