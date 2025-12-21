/**
 * Admin Users List Component
 * 
 * Displays all users with search, filtering, and detailed view
 * - Search by email/phone
 * - Filter by role
 * - View full user details
 * - Shows KYC status, partner memberships, etc.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import React from 'react';
import { useAdminUsers, useAdminUserByEmail, useAdminUserByPhone, useAdminUserSearch } from '@/hooks/admin';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  MapPin,
  Star,
  Building2,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Crown,
  ShieldAlert,
  Ban,
} from 'lucide-react';
import { AdminUserDetailModal } from './admin-user-detail-modal';
import type { AdminUserData } from '@/hooks/admin';

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function AdminUsersList() {
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState<'user' | 'admin' | 'super_admin' | ''>('');
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Debounce search value to prevent excessive API calls
  const debouncedSearchValue = useDebounce(searchValue, 500);
  
  // Only search if we have enough characters and is a valid search
  const shouldSearch = useMemo(() => {
    const trimmed = debouncedSearchValue.trim();
    if (searchType === 'email') {
      return trimmed.length >= 3 && trimmed.includes('@') && trimmed.includes('.');
    }
    if (searchType === 'phone') {
      return trimmed.length >= 5;
    }
    return false;
  }, [debouncedSearchValue, searchType]);
  
  // List all users (default view)
  const { users, isLoading, pagination } = useAdminUsers({
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Search user by email (only when we have a complete email format)
  const { user: emailUser, isLoading: emailLoading } = useAdminUserByEmail(
    shouldSearch && searchType === 'email' ? debouncedSearchValue : null,
    shouldSearch && searchType === 'email'
  );

  // Search user by phone (only when we have enough digits)
  const { user: phoneUser, isLoading: phoneLoading } = useAdminUserByPhone(
    shouldSearch && searchType === 'phone' ? debouncedSearchValue : null,
    shouldSearch && searchType === 'phone'
  );

  const isSearching = emailLoading || phoneLoading;
  const searchedUser = searchType === 'email' ? emailUser : phoneUser;
  const displayUsers = shouldSearch && searchedUser ? [searchedUser] : users;

  // Filter by role
  const filteredUsers = roleFilter 
    ? displayUsers.filter(u => u.role === roleFilter)
    : displayUsers;

  const handleViewDetails = (user: AdminUserData) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const config = {
      super_admin: {
        icon: Crown,
        color: 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30',
        label: 'Super Admin',
      },
      admin: {
        icon: ShieldAlert,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30',
        label: 'Admin',
      },
      user: {
        icon: Users,
        color: 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-900/30',
        label: 'User',
      },
    }[role] || {
      icon: Users,
      color: 'text-muted-foreground bg-muted/20 border-border',
      label: role,
    };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading && !searchValue) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-600 dark:text-blue-400">Verified</p>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {users.filter(u => u.profile?.kycVerified).length}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-purple-600 dark:text-purple-400">Partner Staff</p>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {users.filter(u => u.partnerMemberships.length > 0).length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">Banned</p>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {users.filter(u => u.banned).length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              searchType === 'email' 
                ? 'Search by email (e.g., user@example.com)...' 
                : 'Search by phone (min 5 digits)...'
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'email' | 'phone')}
            className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>

          <div className="h-6 w-px bg-border" />

          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* No Results */}
      {searchValue && !searchedUser && !isSearching && (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">No user found</h3>
          <p className="text-sm text-muted-foreground">
            No user found with {searchType}: "{searchValue}"
          </p>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-card rounded-lg border border-border p-6 hover:border-border/60 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {user.banned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                          <Ban className="w-3 h-3" />
                          Banned
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {user.email}
                        {user.emailVerified && (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                      
                      {user.profile?.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {user.profile.phone}
                          {user.phoneVerified && (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(user)}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">KYC Status</p>
                  <div className="flex items-center gap-1.5">
                    {user.profile?.kycVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Not Verified</span>
                      </>
                    )}
                  </div>
                </div>

                {user.profile?.locationEmirate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.profile.locationEmirate}</span>
                    </div>
                  </div>
                )}

                {user.profile && user.profile.inventoryCount > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Listings</p>
                    <span className="text-sm font-medium">{user.profile.inventoryCount}</span>
                  </div>
                )}

                {user.partnerMemberships.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Partner Staff</p>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {user.partnerMemberships.length} Partner{user.partnerMemberships.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          !searchValue && (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No users found</h3>
              <p className="text-sm text-muted-foreground">
                No users match the selected filters
              </p>
            </div>
          )
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <AdminUserDetailModal
          user={selectedUser}
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
