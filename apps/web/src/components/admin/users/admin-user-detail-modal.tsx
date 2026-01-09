/**
 * Admin User Detail Modal
 * Shows complete user information
 * Following profile-view design system
 */

'use client';

import type { AdminUserData } from '@/hooks/admin';
import { AdminUserOperations } from '@/components/admin/user-operations';
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
import { UserAvatar } from '@/components/ui/data-display/user-avatar';

interface AdminUserDetailModalProps {
  user: AdminUserData;
  open: boolean;
  onClose: () => void;
}

export function AdminUserDetailModal({ user, open, onClose }: AdminUserDetailModalProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'admin':
        return <ShieldAlert className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-foreground" />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-xl shadow-xl m-4">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <h2 className="text-lg font-medium">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-12">
          
          {/* User Header */}
          <section className="flex items-start gap-4">
            <UserAvatar
              src={user.profile?.avatar}
              name={user.name}
              size="lg"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{user.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getRoleIcon(user.role)}
                <span className="capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              {user.banned && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/10 text-sm text-red-600 dark:text-red-400">
                  <Ban className="w-3.5 h-3.5" />
                  Banned{user.banReason && `: ${user.banReason}`}
                </div>
              )}
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-6">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-base font-medium tracking-tight">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </div>
                <p className="text-sm font-medium">{user.email}</p>
                <div className="flex items-center gap-1.5">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">Not Verified</span>
                    </>
                  )}
                </div>
              </div>

              {user.profile?.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </div>
                  <p className="text-sm font-medium">{user.profile.phone || user.phoneNumber}</p>
                  <div className="flex items-center gap-1.5">
                    {user.phoneNumberVerified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-500">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-500">Not Verified</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Profile Info */}
          {user.profile && (
            <section className="space-y-6">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-base font-medium tracking-tight">Profile</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">
                    {[user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ') || 'N/A'}
                  </p>
                </div>

                {user.profile.locationEmirate && (
                  <div>
                    <p className="text-muted-foreground mb-1">Location</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        {user.profile.locationCity && `${user.profile.locationCity}, `}
                        {user.profile.locationEmirate}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground mb-1">Member Since</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {user.profile.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Bio</p>
                  <p className="text-sm">{user.profile.description}</p>
                </div>
              )}
            </section>
          )}

          {/* KYC Status */}
          <section className="space-y-6">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-base font-medium tracking-tight">KYC Verification</h3>
            </div>
            
            <div className="rounded-xl border border-border p-4">
              {user.profile?.kycVerified ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-500">KYC Verified</p>
                    {user.profile.kycVerifiedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Verified on {formatDate(user.profile.kycVerifiedAt)}
                      </p>
                    )}
                    {user.kyc && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                        <p>Type: {user.kyc.type}</p>
                        {user.kyc.verifiedBy && <p>Verified by: {user.kyc.verifiedBy}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Not Verified</p>
                    {user.kyc && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                        <p>Status: {user.kyc.status}</p>
                        {user.kyc.rejectionReason && (
                          <p className="text-red-500 mt-1">Reason: {user.kyc.rejectionReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Activity Stats */}
          {user.profile && (
            <section className="space-y-6">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-base font-medium tracking-tight">Activity</h3>
              </div>
              
              <div className="grid grid-cols-3 border-y border-border divide-x divide-border">
                <div className="p-6 text-center">
                  <Package className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Listings</p>
                  <p className="text-lg font-semibold text-blue-500">{user.profile.inventoryCount}</p>
                </div>

                {user.profile.rating !== null && user.profile.rating !== undefined && (
                  <div className="p-6 text-center">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <p className="text-lg font-semibold text-foreground">{user.profile.rating.toFixed(1)}</p>
                  </div>
                )}

                {user.profile.lastActiveAt && (
                  <div className="p-6 text-center">
                    <Clock className="w-5 h-5 text-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Last Active</p>
                    <p className="text-xs font-medium">{formatDate(user.profile.lastActiveAt)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Partner Memberships */}
          {user.partnerMemberships.length > 0 && (
            <section className="space-y-6">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-base font-medium tracking-tight">Partner Memberships</h3>
              </div>
              
              <div className="space-y-0 border border-border rounded-xl overflow-hidden divide-y divide-border">
                {user.partnerMemberships.map((membership) => (
                  <div key={membership.staffId} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{membership.partnerBrandName}</p>
                        <p className="text-xs text-muted-foreground">{membership.partnerName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium">
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
                          Primary
                        </span>
                      )}
                      <span>Joined {formatDate(membership.joinedAt)}</span>
                      <span className={
                        membership.status === 'active' ? 'text-green-500 font-medium' : ''
                      }>
                        {membership.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags & Badges */}
          {user.profile && (user.profile.tags.length > 0 || user.profile.badges.length > 0) && (
            <section className="space-y-6">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-base font-medium tracking-tight">Tags & Badges</h3>
              </div>
              
              <div className="space-y-4">
                {user.profile.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-secondary/50 text-xs">
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
                        <span key={i} className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Admin Operations */}
          <section className="space-y-6 pt-6 border-t border-border">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-base font-medium tracking-tight">Admin Operations</h3>
            </div>
            <AdminUserOperations user={user} onOperationComplete={onClose} />
          </section>

        </div>
      </div>
    </div>
  );
}
