/**
 * Admin User Detail Modal
 * 
 * Shows complete user information including:
 * - Account details
 * - Profile information
 * - KYC status
 * - Partner memberships
 * - Activity stats
 */

'use client';

import type { AdminUserData } from '@/hooks/admin';
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Building2,
  User,
  Clock,
  Star,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Crown,
  ShieldAlert,
  Users,
  Ban,
  X,
} from 'lucide-react';

interface AdminUserDetailModalProps {
  user: AdminUserData;
  open: boolean;
  onClose: () => void;
}

export function AdminUserDetailModal({ user, open, onClose }: AdminUserDetailModalProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'admin':
        return <ShieldAlert className="w-5 h-5 text-blue-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
          {/* Header with Avatar and Name */}
          <div className="flex items-start gap-4 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <div className="flex items-center gap-2">
                {getRoleIcon(user.role)}
                <span className="text-sm font-medium capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              {user.banned && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400">
                  <Ban className="w-4 h-4" />
                  Account Banned
                  {user.banReason && `: ${user.banReason}`}
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {user.emailVerified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">Not Verified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {user.profile?.phone && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <p className="text-sm font-medium">{user.profile.phone}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {user.phoneVerified ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600 dark:text-red-400">Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Member Since</p>
                  <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
                  <p className="text-sm font-medium">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          {user.profile && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile Information
              </h3>
              <div className="space-y-3">
                {(user.profile.firstName || user.profile.lastName) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Full Name:</span>
                    <span className="text-sm font-medium">
                      {[user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}

                {user.profile.locationEmirate && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                      <p className="text-sm font-medium">
                        {user.profile.locationCity && `${user.profile.locationCity}, `}
                        {user.profile.locationEmirate}
                      </p>
                    </div>
                  </div>
                )}

                {user.profile.description && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm">{user.profile.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KYC Status */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              KYC Verification
            </h3>
            <div className="p-4 rounded-lg bg-muted/30">
              {user.profile?.kycVerified ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">KYC Verified</p>
                    {user.profile.kycVerifiedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Verified on {formatDate(user.profile.kycVerifiedAt)}
                      </p>
                    )}
                    {user.kyc && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Type: {user.kyc.type}</p>
                        {user.kyc.verifiedBy && <p>Verified by: {user.kyc.verifiedBy}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Not Verified</p>
                    {user.kyc && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Status: {user.kyc.status}</p>
                        {user.kyc.rejectionReason && (
                          <p className="text-red-600 dark:text-red-400 mt-1">
                            Reason: {user.kyc.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Stats */}
          {user.profile && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Activity & Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <Package className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Listings</p>
                  <p className="text-lg font-bold">{user.profile.inventoryCount}</p>
                </div>

                {user.profile.rating !== null && user.profile.rating !== undefined && (
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-lg font-bold">{user.profile.rating.toFixed(1)}</p>
                  </div>
                )}

                {user.profile.lastActiveAt && (
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Last Active</p>
                    <p className="text-xs font-medium">{formatDate(user.profile.lastActiveAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Partner Memberships */}
          {user.partnerMemberships.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Partner Memberships
              </h3>
              <div className="space-y-2">
                {user.partnerMemberships.map((membership) => (
                  <div
                    key={membership.staffId}
                    className="p-4 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{membership.partnerBrandName}</p>
                        <p className="text-sm text-muted-foreground">{membership.partnerName}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {membership.staffRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {membership.isOwner && (
                        <span className="inline-flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Owner
                        </span>
                      )}
                      {membership.isPrimaryContact && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Primary Contact
                        </span>
                      )}
                      <span>Joined {formatDate(membership.joinedAt)}</span>
                      <span className={`font-medium ${
                        membership.status === 'active' ? 'text-green-600 dark:text-green-400' : ''
                      }`}>
                        {membership.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Badges */}
          {user.profile && (user.profile.tags.length > 0 || user.profile.badges.length > 0) && (
            <div>
              <h3 className="font-semibold mb-3">Tags & Badges</h3>
              <div className="space-y-3">
                {user.profile.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md bg-muted text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.profile.badges.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Badges</p>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.badges.map((badge, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
