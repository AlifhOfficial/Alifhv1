/**
 * Admin Users List Component
 * Displays all users with search, filtering, and detailed view
 * Following profile-view design system
 */

'use client';

import { useState, useMemo } from 'react';
import React from 'react';
import { useAdminUsers, useAdminUserByEmail, useAdminUserByPhone } from '@/hooks/admin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  MapPin,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Crown,
  ShieldAlert,
  Ban,
  ChevronRight,
} from 'lucide-react';
import { AdminUserDetailModal } from './admin-user-detail-modal';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import type { AdminUserData } from '@/hooks/admin';

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

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
  const [roleFilter, setRoleFilter] = useState<'user' | 'admin' | 'super_admin' | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const debouncedSearchValue = useDebounce(searchValue, 500);
  
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
  
  const { users, isLoading } = useAdminUsers({
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { user: emailUser, isLoading: emailLoading } = useAdminUserByEmail(
    shouldSearch && searchType === 'email' ? debouncedSearchValue : null,
    shouldSearch && searchType === 'email'
  );

  const { user: phoneUser, isLoading: phoneLoading } = useAdminUserByPhone(
    shouldSearch && searchType === 'phone' ? debouncedSearchValue : null,
    shouldSearch && searchType === 'phone'
  );

  const isSearching = emailLoading || phoneLoading;
  const searchedUser = searchType === 'email' ? emailUser : phoneUser;
  const displayUsers = shouldSearch && searchedUser ? [searchedUser] : users;

  const filteredUsers = roleFilter && roleFilter !== 'all'
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
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        label: 'Super Admin',
      },
      admin: {
        icon: ShieldAlert,
        color: 'bg-primary-muted text-primary',
        label: 'Admin',
      },
      user: {
        icon: Users,
        color: 'bg-foreground/10 text-foreground',
        label: 'User',
      },
    }[role] || {
      icon: Users,
      color: 'bg-foreground/10 text-foreground',
      label: role,
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-caption1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading && !searchValue) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      
      {/* Stats */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 regular:grid-cols-4 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Total</span>
            <span className="text-title2 font-semibold text-primary">{users.length}</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Verified</span>
            <span className="text-title2 font-semibold text-success">
              {users.filter(u => u.profile?.kycVerified).length}
            </span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Partner Staff</span>
            <span className="text-title2 font-semibold text-foreground">
              {users.filter(u => u.partnerMemberships.length > 0).length}
            </span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-caption1 text-muted-foreground uppercase tracking-widest">Banned</span>
            <span className="text-title2 font-semibold text-destructive">
              {users.filter(u => u.banned).length}
            </span>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Users</h3>
        </div>

        <div className="flex flex-col regular:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={
                searchType === 'email' 
                  ? 'Search by email...' 
                  : 'Search by phone...'
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors placeholder:text-muted-foreground/30"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={searchType} onValueChange={(v) => setSearchType(v as 'email' | 'phone')}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {searchValue && !searchedUser && !isSearching && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-subhead text-muted-foreground">
              No user found with {searchType}: "{searchValue}"
            </p>
          </div>
        )}

        {/* Users List */}
        {filteredUsers.length > 0 ? (
          <div className="space-y-0 border border-border rounded-xl overflow-hidden divide-y divide-border">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-secondary/10 transition-colors">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      src={user.profile?.avatar}
                      name={user.name}
                      size="md"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-callout text-foreground">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        {user.banned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive-muted text-caption1 text-destructive">
                            <Ban className="w-3 h-3" />
                            Banned
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-subhead text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {user.email}
                          {user.emailVerified && (
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          )}
                        </div>
                        
                        {(user.profile?.phone || user.phoneNumber) && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {user.profile?.phone || user.phoneNumber}
                            {user.phoneNumberVerified && (
                              <CheckCircle2 className="w-3 h-3 text-success" />
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(user.createdAt).toLocaleDateString('en-AE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(user)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white text-subhead transition-colors"
                  >
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 regular:grid-cols-4 gap-4 pt-4 border-t border-border text-subhead">
                  <div>
                    <p className="text-caption1 text-muted-foreground mb-1">KYC Status</p>
                    <div className="flex items-center gap-1.5">
                      {user.profile?.kycVerified ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-success" />
                          <span className="text-success">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>

                  {user.profile?.locationEmirate && (
                    <div>
                      <p className="text-caption1 text-muted-foreground mb-1">Location</p>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{user.profile.locationEmirate}</span>
                      </div>
                    </div>
                  )}

                  {user.profile && user.profile.inventoryCount > 0 && (
                    <div>
                      <p className="text-caption1 text-muted-foreground mb-1">Listings</p>
                      <span className="font-medium">{user.profile.inventoryCount}</span>
                    </div>
                  )}

                  {user.partnerMemberships.length > 0 && (
                    <div>
                      <p className="text-caption1 text-muted-foreground mb-1">Partner Staff</p>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-primary font-medium">
                          {user.partnerMemberships.length} Partner{user.partnerMemberships.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          !searchValue && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-subhead text-muted-foreground">No users match the selected filters</p>
            </div>
          )
        )}
      </section>

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
