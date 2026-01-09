/**
 * Partner Bookings Client Component
 * Minimal macOS-inspired design with client-side filtering
 */

'use client';

import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { Combobox } from "@/components/ui/forms/combobox";
import { Box, RefreshCw, Search, ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';

interface PartnerBookingsClientProps {
  partnerId: string;
  partnerName: string;
  userRole?: string;
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

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Normalize status values from API to our filter keys
const normalizeStatus = (status: string): StatusFilter => {
  const normalized = status.toLowerCase().replace(/[-\s]/g, '_');
  if (['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].includes(normalized)) {
    return normalized as StatusFilter;
  }
  return 'pending'; // fallback
};

const STATUS_CONFIG: Record<StatusFilter, { label: string; color: string; bg: string }> = {
  all: { label: 'All', color: 'text-foreground', bg: 'bg-secondary' },
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  confirmed: { label: 'Confirmed', color: 'text-green-600', bg: 'bg-green-500/10' },
  completed: { label: 'Completed', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-500/10' },
  no_show: { label: 'No Show', color: 'text-red-600', bg: 'bg-red-500/10' },
};

const ITEMS_PER_PAGE = 20;

export function PartnerBookingsClient({ 
  partnerId, 
  partnerName,
  userRole,
}: PartnerBookingsClientProps) {
  // Data state
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  
  // Filter state (all client-side)
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
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

  // Multi-filter bookings: staff + status + search (all client-side)
  const filteredBookings = useMemo(() => {
    let result = allBookings;
    
    // Staff filter
    if (selectedStaffFilter !== 'all') {
      result = result.filter(b => b.staffUserId === selectedStaffFilter);
    }
    
    // Status filter - normalize status before comparing
    if (statusFilter !== 'all') {
      result = result.filter(b => normalizeStatus(b.status) === statusFilter);
    }
    
    // Search filter (customer name, vehicle, email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.userName.toLowerCase().includes(query) ||
        b.userEmail.toLowerCase().includes(query) ||
        b.listingTitle.toLowerCase().includes(query) ||
        b.listingMake?.toLowerCase().includes(query) ||
        b.listingModel?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [allBookings, selectedStaffFilter, statusFilter, searchQuery]);

  // Pagination (client-side)
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStaffFilter, statusFilter, searchQuery]);

  // Calculate status counts for filter badges - normalize status
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: allBookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };
    allBookings.forEach(b => {
      const normalized = normalizeStatus(b.status);
      if (normalized in counts && normalized !== 'all') {
        counts[normalized]++;
      }
    });
    return counts;
  }, [allBookings]);

  // Staff options for combobox
  const staffOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Staff' }];
    allStaffForDisplay.forEach(staff => {
      options.push({
        value: staff.staffUserId,
        label: `${staff.staffName} (${staff.bookingCount})`,
      });
    });
    return options;
  }, [allStaffForDisplay]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedStaffFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = selectedStaffFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== '';

  // Format date helper
  const formatBookingDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) {
      return { label: 'Today', time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isToday: true };
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return { label: 'Tomorrow', time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isToday: false };
    }
    return { 
      label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), 
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isToday: false 
    };
  };

  return (
    <DashboardPageWrapper>
      {/* Header */}
      <DashboardPageHeader
        title="Bookings"
        description={partnerName}
      >
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </DashboardPageHeader>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-10">
            <div>
              <span className="text-xs text-muted-foreground">Today</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-yellow-500">{stats.todayBookings}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Upcoming</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.upcomingBookings}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Completed</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-green-500">{stats.completedBookings}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Total</span>
              <p className="text-xl font-semibold tracking-tight mt-1">{stats.totalBookings}</p>
            </div>
          </div>
        )}

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const isActive = statusFilter === status;
            const count = statusCounts[status];
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {config.label}
                {status !== 'all' && count > 0 && (
                  <span className="ml-1.5 text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Staff Combobox */}
        {allStaffForDisplay.length > 0 && (
          <div className="w-48">
            <Combobox
              options={staffOptions}
              value={selectedStaffFilter}
              onValueChange={setSelectedStaffFilter}
              placeholder="All Staff"
              searchPlaceholder="Search staff..."
              className="h-10 rounded-xl bg-secondary/50 border-0"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-secondary/50 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground mt-4">Loading...</p>
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && filteredBookings.length > 0 && (
        <>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted-foreground">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </p>
            {totalPages > 1 && (
              <p className="text-xs text-muted-foreground">{currentPage} / {totalPages}</p>
            )}
          </div>

          {/* List */}
          <div className="space-y-1">
            {paginatedBookings.map((booking) => {
              const normalizedStatus = normalizeStatus(booking.status);
              const statusLabel = STATUS_CONFIG[normalizedStatus]?.label || booking.status;
              const teamMember = booking.staffUserId ? teamMemberMap.get(booking.staffUserId) : null;
              const dateInfo = formatBookingDate(booking.scheduledStartTime);
              
              return (
                <div
                  key={booking.id}
                  className="group flex items-center gap-5 p-4 -mx-4 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  {/* Time */}
                  <div className="w-20 flex-shrink-0">
                    <p className="text-sm font-medium tracking-tight">{dateInfo.label}</p>
                    <p className="text-xs text-muted-foreground">{dateInfo.time}</p>
                  </div>

                  {/* Image */}
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {booking.listingThumbnail ? (
                      <img
                        src={booking.listingThumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Box className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium tracking-tight truncate">{booking.listingTitle}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {booking.userName}
                      {booking.staffName && (
                        <span className={teamMember?.status === 'left' ? 'opacity-50' : ''}>
                          {' · '}{booking.staffName}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_CONFIG[normalizedStatus]?.bg || 'bg-secondary/50'} ${STATUS_CONFIG[normalizedStatus]?.color || 'text-muted-foreground'}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty - No Data */}
      {!isLoading && !error && allBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium tracking-tight">No bookings yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Customer appointments will appear here</p>
        </div>
      )}

      {/* Empty - No Results */}
      {!isLoading && !error && allBookings.length > 0 && filteredBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Search className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium tracking-tight">No results</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-foreground hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
