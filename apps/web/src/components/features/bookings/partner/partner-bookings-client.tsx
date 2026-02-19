/**
 * Partner Bookings Client Component
 * Minimal macOS-inspired design with server-side filtering
 */

'use client';

import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { Combobox } from "@/components/ui/forms/combobox";
import { Box, RefreshCw, Search, ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/utils";
import { getThumbUrl } from "@/utils/storage";

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
  // Data state - now holds server-filtered results
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  
  // Filter state - sent to server
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const hasFetchedTeamRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search handler
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setCurrentPage(1);
  }, 400);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  // Fetch team data once on mount
  const fetchTeamData = useCallback(async () => {
    try {
      const response = await fetch('/api/partner/staff', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const teamData = await response.json();
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
      console.error('Error fetching team data:', err);
    }
  }, []);

  // Fetch bookings with server-side filtering
  const fetchBookings = useCallback(async (isRefresh = false) => {
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
        limit: String(ITEMS_PER_PAGE),
        offset: String((currentPage - 1) * ITEMS_PER_PAGE),
      });

      // Add server-side filters
      if (selectedStaffFilter !== 'all') {
        params.set('staffUserId', selectedStaffFilter);
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim());
      }

      const response = await fetch(`/api/bookings/partner-bookings?${params}`, {
        credentials: 'include',
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch bookings' }));
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data || []);
      setTotalBookings(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
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
  }, [partnerId, currentPage, selectedStaffFilter, statusFilter, debouncedSearch]);

  // Initial team fetch
  useEffect(() => {
    if (!hasFetchedTeamRef.current) {
      hasFetchedTeamRef.current = true;
      fetchTeamData();
    }
  }, [fetchTeamData]);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
    
    // Cleanup: abort in-flight requests on unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchBookings]);

  // Reset page when filters change (except page itself)
  const handleStaffFilterChange = useCallback((value: string) => {
    setSelectedStaffFilter(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  // Create a Map for O(1) team member lookups
  const teamMemberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    teamMembers.forEach(m => map.set(m.userId, m));
    return map;
  }, [teamMembers]);

  // Calculate all staff data including those with 0 bookings
  // Note: We no longer have all bookings, so we just use team members
  const allStaffData = useMemo(() => {
    // For server-side filtering, we build staff list from team members only
    const allStaff = teamMembers
      .filter(m => m.status === 'active')
      .map(m => ({
        staffUserId: m.userId,
        staffName: m.displayName,
        bookingCount: 0, // We don't track counts with server-side filtering
        isActive: true,
        avatar: m.avatar,
      }));
    
    return { allStaff, activeStaff: allStaff, staffWithBookings: [] };
  }, [teamMembers]);

  // Derived values
  const allStaffForDisplay = allStaffData.allStaff;

  // Pagination is now server-side - calculate total pages from server total
  const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE);

  // Status counts from server stats
  const statusCounts = useMemo(() => {
    if (!stats) {
      return {
        all: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      };
    }
    return {
      all: stats.totalBookings,
      pending: stats.pendingBookings,
      confirmed: stats.confirmedBookings,
      completed: stats.completedBookings,
      cancelled: stats.cancelledBookings,
      no_show: stats.noShowBookings,
    };
  }, [stats]);

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
    setDebouncedSearch('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = selectedStaffFilter !== 'all' || statusFilter !== 'all' || debouncedSearch.trim() !== '';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Bookings</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">{partnerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBookings(true)}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

        {/* Stats */}
        {stats && (
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div>
              <span className="text-xs text-muted-foreground">Today</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-yellow-500">{stats.todayBookings}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Upcoming</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.upcomingBookings}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Completed</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1 text-green-500">{stats.completedBookings}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Total</span>
              <p className="text-lg sm:text-xl font-semibold tracking-tight mt-1">{stats.totalBookings}</p>
            </div>
          </div>
        )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Row 1: Search + Staff */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-9 sm:h-10 pl-10 pr-8 rounded-lg sm:rounded-xl bg-secondary/50 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Staff Combobox */}
        {allStaffForDisplay.length > 0 && (
          <div className="w-full sm:w-48">
            <Combobox
              options={staffOptions}
              value={selectedStaffFilter}
              onValueChange={handleStaffFilterChange}
              placeholder="All Staff"
              searchPlaceholder="Search staff..."
              className="h-9 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/50 border-0"
            />
          </div>
        )}
        </div>

        {/* Row 2: Status Pills - Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const isActive = statusFilter === status;
            const count = statusCounts[status];
            return (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {config.label}
                {status !== 'all' && count > 0 && (
                  <span className="ml-1 sm:ml-1.5 text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors self-end sm:self-auto"
          >
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <p className="text-xs sm:text-sm text-destructive font-medium">{error}</p>
          <button
            onClick={() => fetchBookings(true)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground/60 mt-3">Loading bookings...</p>
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && bookings.length > 0 && (
        <>
          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted-foreground">
              {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
              {hasActiveFilters && ` (filtered)`}
            </p>
            {totalPages > 1 && (
              <p className="text-xs text-muted-foreground">{currentPage} / {totalPages}</p>
            )}
          </div>

          {/* List */}
          <div className="space-y-2">
            {bookings.map((booking) => {
              const normalizedStatus = normalizeStatus(booking.status);
              const statusLabel = STATUS_CONFIG[normalizedStatus]?.label || booking.status;
              const teamMember = booking.staffUserId ? teamMemberMap.get(booking.staffUserId) : null;
              const dateInfo = formatBookingDate(booking.scheduledStartTime);
              
              return (
                <div
                  key={booking.id}
                  className="group flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer border border-transparent hover:border-border/40"
                >
                  {/* Image */}
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {booking.listingThumbnail ? (
                      <img
                        src={getThumbUrl(booking.listingThumbnail) || booking.listingThumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Box className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold tracking-tight truncate">{booking.listingTitle}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="truncate">{booking.userName}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {dateInfo.label} {dateInfo.time}
                      </span>
                    </div>
                    {booking.staffName && (
                      <p className={cn("text-xs text-muted-foreground/70 mt-0.5", teamMember?.status === 'left' && 'opacity-50')}>
                        Staff: {booking.staffName}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${STATUS_CONFIG[normalizedStatus]?.bg || 'bg-secondary/50'} ${STATUS_CONFIG[normalizedStatus]?.color || 'text-muted-foreground'}`}>
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
      {!isLoading && !error && !hasActiveFilters && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No bookings yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Customer appointments will appear here</p>
        </div>
      )}

      {/* Empty - No Results */}
      {!isLoading && !error && hasActiveFilters && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Search className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or filter</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
