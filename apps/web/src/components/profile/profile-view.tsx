/**
 * Profile View - Clean & Minimal
 * 
 * Tap-to-edit per field pattern
 * Follows our established design system
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile, type UserProfileUpdate } from '@/hooks/profile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { authClient } from '@/lib/auth/client';
import { compressAndUploadAvatar } from '@/lib/storage';
import { 
  Loader2, 
  Camera,
  CheckCircle2,
  Star,
  X
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { KycVerificationModal } from '@/components/kyc';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import type { UserProfileResponse } from '@/hooks/profile/user/use-user-profile';

// ============================================================================
// Constants
// ============================================================================

const TAGS = [
  'Easy to Deal With',
  'Open to Inspection',
  'Clear Communicator',
  'Fair Pricing Expectations',
  'Serious Seller',
  'Maintenance-Focused',
  'Service-Conscious',
  'Preventive Maintenance Mindset',
  'Record-Keeping Owner',
  'Timely Servicing',
];

// ============================================================================
// Types
// ============================================================================

type EditingField = null | 'firstName' | 'lastName' | 'phone' | 'bio' | 'tags';

// ============================================================================
// Main Component
// ============================================================================

interface ProfileViewProps {
  initialData?: UserProfileResponse | null;
}

export function ProfileView({ initialData }: ProfileViewProps) {
  const { session: user, refetch: refetchSession } = useAuth();
  const { profile, updateProfile, refresh, isLoading: profileLoading, stats } = useUserProfile(initialData);
  const { toast } = useToast();

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Phone verification state
  const [phoneVerifyStep, setPhoneVerifyStep] = useState<'idle' | 'otp' | 'verifying'>('idle');
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [phoneJustVerified, setPhoneJustVerified] = useState(false);
  
  // KYC modal state
  const [kycModalOpen, setKycModalOpen] = useState(false);

  // Passkey state
  const [_passkeys, _setPasskeys] = useState<Array<{ id: string; name: string | null; createdAt: Date | null }>>([]);
  const [_loadingPasskeys, _setLoadingPasskeys] = useState(false);
  const [_addingPasskey, _setAddingPasskey] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    tags: [] as string[],
  });

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone?.replace(/^\+971/, '') ?? '',
        bio: profile.description ?? '',
        tags: profile.tags ?? [],
      });
    }
  }, [profile]);

  // Reset form when editing field changes (cancel unsaved edits when clicking away)
  const prevEditingField = React.useRef<EditingField>(null);
  useEffect(() => {
    // When switching from editing one field to another (or to null), reset unsaved changes
    if (prevEditingField.current !== null && prevEditingField.current !== editingField && profile) {
      setForm(f => ({
        ...f,
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone?.replace(/^\+971/, '') ?? '',
        bio: profile.description ?? '',
        // Don't reset tags - they auto-save
      }));
    }
    prevEditingField.current = editingField;
  }, [editingField, profile]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Update form field
  const updateField = (updates: Partial<typeof form>) => {
    setForm(f => ({ ...f, ...updates }));
  };

  // Save single field
  const saveField = async (field: EditingField) => {
    if (!field) return;
    
    setSaving(true);
    try {
      const payload: UserProfileUpdate = {};
      
      switch (field) {
        case 'firstName':
          payload.firstName = form.firstName.trim() || null;
          break;
        case 'lastName':
          payload.lastName = form.lastName.trim() || null;
          break;
        case 'phone':
          // Save with +971 prefix
          const cleanPhone = form.phone.replace(/[^\d]/g, '');
          payload.phone = cleanPhone ? `+971${cleanPhone}` : null;
          break;
        case 'bio':
          payload.description = form.bio.trim() || null;
          break;
        case 'tags':
          payload.tags = form.tags;
          break;
      }

      // updateProfile's onSuccess handles cache update and session refresh
      await updateProfile(payload);
      setEditingField(null);
      toast({ title: 'Saved' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        bio: profile.description ?? '',
        tags: profile.tags ?? [],
      });
    }
    setEditingField(null);
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // Basic check - compression handles more
    if (!file.type.startsWith('image/') && file.type !== '' && file.type !== 'application/octet-stream') {
      toast({ title: 'Only image files are allowed', variant: 'destructive' });
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast({ title: 'Max 30MB', variant: 'destructive' });
      return;
    }

    setAvatarUploading(true);
    try {
      // Client-side compression + direct R2 upload (fast!)
      const result = await compressAndUploadAvatar(file);
      await updateProfile({ avatar: result.key });
      toast({ title: 'Photo updated' });
    } catch (err: any) {
      toast({ title: err.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Remove avatar
  const removeAvatar = async () => {
    if (!profile?.avatar) return;
    
    setAvatarUploading(true);
    try {
      await updateProfile({ avatar: null });
      // Force session refresh to update all UI instantly
      await refetchSession();
      toast({ title: 'Photo removed' });
    } catch (err: any) {
      toast({ title: err.message || 'Failed to remove photo', variant: 'destructive' });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Tag toggle
  const toggleTag = async (tag: string) => {
    let newTags: string[];
    if (form.tags.includes(tag)) {
      newTags = form.tags.filter(t => t !== tag);
    } else if (form.tags.length < 3) {
      newTags = [...form.tags, tag];
    } else {
      toast({ title: 'Max 3 tags', variant: 'destructive' });
      return;
    }
    updateField({ tags: newTags });
    // Immediately save tags
    try {
      await updateProfile({ tags: newTags });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  // Send phone OTP
  const sendPhoneOTP = async () => {
    const cleanPhone = form.phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 9) {
      toast({ title: 'Invalid phone', description: 'Enter 9 digits after +971', variant: 'destructive' });
      return;
    }

    const fullPhone = `+971${cleanPhone}`;
    setPhoneVerifyStep('verifying');
    
    try {
      const { error } = await authClient.phoneNumber.sendOtp({
        phoneNumber: fullPhone,
      });

      if (error) {
        // Check for Twilio fraud block error
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('blocked') || errorMsg.includes('fraud') || errorMsg.includes('60410')) {
          toast({ 
            title: 'Number temporarily blocked', 
            description: 'This phone number has been temporarily blocked by our SMS provider. Please try a different number or contact support.',
            variant: 'destructive' 
          });
        } else {
          toast({ title: 'Failed to send code', description: error.message, variant: 'destructive' });
        }
        setPhoneVerifyStep('idle');
        return;
      }

      setPhoneVerifyStep('otp');
      setOtpCountdown(60);
      toast({ title: 'Code sent!', description: 'Check your phone' });
    } catch (err: any) {
      const errorMsg = err.message?.toLowerCase() || '';
      if (errorMsg.includes('blocked') || errorMsg.includes('fraud') || errorMsg.includes('60410')) {
        toast({ 
          title: 'Number temporarily blocked', 
          description: 'This phone number has been temporarily blocked by our SMS provider. Please try a different number or contact support.',
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Error', description: err.message || 'Failed to send code', variant: 'destructive' });
      }
      setPhoneVerifyStep('idle');
    }
  };

  // Verify phone OTP
  const verifyPhoneOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: 'Invalid code', description: 'Enter 6-digit code', variant: 'destructive' });
      return;
    }

    const cleanPhone = form.phone.replace(/[^\d]/g, '');
    const fullPhone = `+971${cleanPhone}`;
    setPhoneVerifyStep('verifying');

    try {
      const { error } = await authClient.phoneNumber.verify({
        phoneNumber: fullPhone,
        code: otp,
        updatePhoneNumber: true,
      });

      if (error) {
        // Show appropriate error based on the actual error message
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('already') || errorMsg.includes('linked') || errorMsg.includes('exists')) {
          toast({ title: 'Phone already registered', description: 'This number is linked to another account', variant: 'destructive' });
        } else if (errorMsg.includes('expired')) {
          toast({ title: 'Code expired', description: 'Please request a new code', variant: 'destructive' });
        } else {
          toast({ title: 'Invalid code', description: error.message, variant: 'destructive' });
        }
        setPhoneVerifyStep('otp');
        return;
      }

      toast({ title: 'Phone verified!' });
      setPhoneJustVerified(true);
      setPhoneVerifyStep('idle');
      setOtp('');
      await refresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Verification failed', variant: 'destructive' });
      setPhoneVerifyStep('otp');
    }
  };

  // Cancel phone verification
  const cancelPhoneVerify = () => {
    setPhoneVerifyStep('idle');
    setOtp('');
  };

  // Editable field component
  const EditableField = ({ 
    field, 
    label, 
    value, 
    placeholder,
    disabled = false,
    suffix,
    onDisabledClick,
  }: { 
    field: EditingField; 
    label: string; 
    value: string | null; 
    placeholder: string;
    disabled?: boolean;
    suffix?: React.ReactNode;
    onDisabledClick?: () => void;
  }) => {
    // Only show editing if field is not null, not disabled, and matches current editing field
    const isEditing = field !== null && !disabled && editingField === field;
    
    return (
      <div 
        className={cn(
          "py-3 border-b border-border/20 last:border-0",
          !disabled && field !== null && !isEditing && "cursor-pointer hover:bg-muted/30 -mx-5 px-5 transition-colors",
          disabled && onDisabledClick && "cursor-pointer -mx-5 px-5"
        )}
        onClick={() => {
          if (disabled && onDisabledClick) {
            onDisabledClick();
          } else if (!disabled && field !== null && !isEditing) {
            setEditingField(field);
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-subhead font-semibold text-muted-foreground/70">{label}</p>
              {suffix}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={String(value || '')}
                  onChange={(e) => updateField({ [field as string]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full h-10 bg-muted/20 rounded-lg px-3 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveField(field);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                    className="text-caption1 text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); saveField(field); }}
                    disabled={saving}
                    className="text-caption1 text-primary hover:text-primary font-semibold"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className={cn("text-subhead text-foreground", disabled && "text-foreground/70")}>
                {value || <span className="text-muted-foreground/50">{disabled ? '—' : 'Tap to add'}</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Display name: prefer first + last, fallback to first only, then user.name, then 'User'
  const displayName = profile?.firstName 
    ? profile.lastName 
      ? `${profile.firstName} ${profile.lastName}` 
      : profile.firstName
    : user?.name ?? 'User';

  const memberSinceYear = profile?.memberSince ? new Date(profile.memberSince).getFullYear() : null;

  // KYC expiry logic
  const kycExpiryDate = profile?.kycExpiryDate ? new Date(profile.kycExpiryDate) : null;
  const now = new Date();
  const isKycExpired = kycExpiryDate ? now > kycExpiryDate : false;
  const daysUntilExpiry = kycExpiryDate ? Math.ceil((kycExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const showResubmit = daysUntilExpiry !== null && daysUntilExpiry <= 60; // 2 months = ~60 days
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  // Loading state - Skeleton
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Header: Avatar + Info */}
          <div className="flex items-start gap-3 sm:gap-5">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
            <div className="flex-1 pt-1 sm:pt-2 space-y-2">
              <Skeleton className="h-5 sm:h-6 w-40" />
              <Skeleton className="h-3 sm:h-4 w-52" />
              <Skeleton className="h-3 sm:h-4 w-28" />
            </div>
          </div>

          {/* Identity Card */}
          <Skeleton className="h-[72px] w-full rounded-xl" />

          {/* Stats Grid - 4 cols */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden">
            <Skeleton className="h-[72px]" />
            <Skeleton className="h-[72px]" />
            <Skeleton className="h-[72px]" />
            <Skeleton className="h-[72px]" />
          </div>

          {/* Section */}
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-5">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="avatar" 
              onChange={handleAvatarUpload} 
              disabled={avatarUploading}
            />
            <label 
              htmlFor="avatar" 
              className="block cursor-pointer"
            >
              <UserAvatar 
                key={profile?.avatarUrl || 'no-avatar'}
                src={profile?.avatarUrl}
                name={displayName}
                size="xl" 
                className={cn(
                  "w-20 h-20 sm:w-24 sm:h-24 border-4 border-background shadow-sm transition-opacity",
                  avatarUploading && "opacity-50"
                )}
                useGeneratedAvatar={profile?.preferences?.useGeneratedAvatar ?? true}
              />
              <div className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity",
                avatarUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {avatarUploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </label>
            {/* Remove avatar button */}
            {profile?.avatar && !avatarUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeAvatar();
                }}
                className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex-1 min-w-0 pt-1 sm:pt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-headline sm:text-title3 font-semibold tracking-tight truncate">{displayName}</h1>
              {profile?.kycVerified && !isKycExpired && (
                <CheckCircle2 className={cn(
                  "w-5 h-5 text-primary transition-opacity",
                  isExpiringSoon && "opacity-50 animate-pulse"
                )} />
              )}
            </div>
            <p className="text-caption1 sm:text-subhead text-muted-foreground mt-0.5 truncate">
              {user?.email}
            </p>
            <p className="text-caption1 sm:text-subhead text-muted-foreground/70 mt-0.5">
              Member since {memberSinceYear ?? '—'}
            </p>
          </div>
        </div>

        {/* Identity Verification Status */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <p className={cn(
                "text-subhead font-semibold",
                profile?.kycVerified && !isKycExpired ? "text-foreground" :
                isKycExpired || profile?.kycStatus === 'rejected' ? "text-destructive" :
                profile?.kycStatus === 'pending' ? "text-warning" :
                "text-foreground"
              )}>
                {profile?.kycVerified && !isKycExpired ? 'Identity Verified' :
                 isKycExpired ? 'Verification Expired' :
                 profile?.kycStatus === 'pending' ? 'Under Review' :
                 profile?.kycStatus === 'rejected' ? 'Verification Failed' :
                 'Identity Not Verified'}
              </p>
              <p className={cn(
                "text-caption1 mt-0.5",
                isExpiringSoon ? "text-warning" : "text-muted-foreground/70"
              )}>
                {profile?.kycVerified && !isKycExpired && kycExpiryDate ? (
                  isExpiringSoon 
                    ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}` 
                    : `Valid until ${kycExpiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                ) : isKycExpired ? (
                  'Please verify again to continue'
                ) : profile?.kycStatus === 'pending' ? (
                  'We\'re reviewing your documents'
                ) : profile?.kycStatus === 'rejected' ? (
                  profile.kycRejectionReason || 'Please try again with valid documents'
                ) : (
                  'Verify to build trust and unlock features'
                )}
              </p>
            </div>
            {(!profile?.kycVerified || isKycExpired || profile?.kycStatus === 'rejected' || showResubmit) && profile?.kycStatus !== 'pending' && (
              <button 
                onClick={() => setKycModalOpen(true)}
                className="text-caption1 text-primary hover:text-primary font-semibold px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors w-full sm:w-auto text-center"
              >
                {isKycExpired || profile?.kycStatus === 'rejected' ? 'Try Again' : 
                 showResubmit ? 'Renew' : 'Verify'}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-border/40 bg-sidebar rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col gap-1 border-r border-b md:border-b-0 border-border/40">
            <span className="text-caption1 sm:text-subhead font-semibold text-muted-foreground/70">Listings</span>
            <span className="text-headline sm:text-title3 font-bold text-foreground">{stats?.listingsCount ?? '—'}</span>
          </div>
          <div className="p-4 sm:p-5 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-border/40">
            <span className="text-caption1 sm:text-subhead font-semibold text-muted-foreground/70">Sold</span>
            <span className="text-headline sm:text-title3 font-bold text-foreground">{stats?.soldCount ?? '—'}</span>
          </div>
          <div className="p-4 sm:p-5 flex flex-col gap-1 border-r border-border/40">
            <span className="text-caption1 sm:text-subhead font-semibold text-muted-foreground/70">Response</span>
            <span className="text-headline sm:text-title3 font-bold text-foreground">
              {stats?.responseRate !== null && stats?.responseRate !== undefined ? `${stats.responseRate}%` : '—'}
            </span>
          </div>
          <div className="p-4 sm:p-5 flex flex-col gap-1">
            <span className="text-caption1 sm:text-subhead font-semibold text-muted-foreground/70">Rating</span>
            <span className="text-headline sm:text-title3 font-bold text-foreground">
              {profile?.platformRating ? (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning fill-yellow-500" />
                  {profile.platformRating.toFixed(1)}
                </span>
              ) : '—'}
            </span>
          </div>
        </div>

        {/* Awards & Badges */}
        <section>
          <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">Awards & Badges</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            {profile?.badges && profile.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((badge, i) => (
                  <span 
                    key={i} 
                    className="px-4 py-2 rounded-lg bg-muted/30 text-foreground text-subhead font-semibold border border-border/40"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-subhead text-muted-foreground/60 mb-2">No badges earned yet</p>
                <a 
                  href="/badges" 
                  className="text-subhead text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Learn more about badges
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Personal Information */}
        <section>
          <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">Personal Information</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <EditableField 
              field="firstName" 
              label="First Name" 
              value={form.firstName} 
              placeholder="Enter first name"
            />
            <EditableField 
              field="lastName" 
              label="Last Name" 
              value={form.lastName} 
              placeholder="Enter last name"
            />
            <EditableField 
              field={null} 
              label="Email Address" 
              value={user?.email ?? ''} 
              placeholder=""
              disabled
              onDisabledClick={profile?.emailVerified ? () => {
                toast({ 
                  title: 'Cannot change verified email', 
                  description: 'Please email support@revvup.ae to change your verified email address. This protects you from fraudulent activities.',
                });
              } : undefined}
              suffix={profile?.emailVerified ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <a 
                  href="/verify-email" 
                  className="text-caption1 text-primary hover:text-primary font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  Verify
                </a>
              )}
            />
            
            {/* Phone Number - Custom inline with +971 prefix */}
            <div className="py-3 border-b border-border/20 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-subhead font-semibold text-muted-foreground/70">Phone Number</p>
                {(profile?.phoneNumberVerified || phoneJustVerified) ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : form.phone && phoneVerifyStep === 'idle' ? (
                  <button
                    onClick={sendPhoneOTP}
                    className="text-caption1 text-primary hover:text-primary font-semibold"
                  >
                    Verify
                  </button>
                ) : null}
              </div>
              
              {phoneVerifyStep === 'otp' ? (
                // OTP input step
                <div className="space-y-3">
                  <p className="text-caption1 text-muted-foreground">
                    Enter the 6-digit code sent to +971{form.phone}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-center text-headline font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={otpCountdown > 0 ? undefined : sendPhoneOTP}
                      disabled={otpCountdown > 0}
                      className="text-caption1 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend code'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={verifyPhoneOTP}
                        disabled={otp.length !== 6}
                        className="text-caption1 text-primary hover:text-primary font-semibold disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button
                        onClick={cancelPhoneVerify}
                        className="text-caption1 text-muted-foreground hover:text-foreground font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : phoneVerifyStep === 'verifying' ? (
                // Loading state
                <div className="flex items-center gap-2 h-10">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-subhead text-muted-foreground">Sending...</span>
                </div>
              ) : editingField === 'phone' ? (
                // Edit phone number
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-subhead text-muted-foreground shrink-0">+971</span>
                    <input
                      autoFocus
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) => updateField({ phone: e.target.value.replace(/[^\d]/g, '').slice(0, 9) })}
                      placeholder="50 000 0000"
                      className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-subhead focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      maxLength={9}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveField('phone');
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={cancelEdit}
                      className="text-caption1 text-muted-foreground hover:text-foreground font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveField('phone')}
                      disabled={saving}
                      className="text-caption1 text-primary hover:text-primary font-semibold"
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                // Display phone number
                <div 
                  className={cn(
                    "-mx-5 px-5 py-1 transition-colors rounded",
                    (profile?.phoneNumberVerified || phoneJustVerified) 
                      ? "cursor-default" 
                      : "cursor-pointer hover:bg-muted/30"
                  )}
                  onClick={() => {
                    if (profile?.phoneNumberVerified || phoneJustVerified) {
                      toast({ 
                        title: 'Cannot change verified phone', 
                        description: 'Please email support@revvup.ae to change your verified phone number. This protects you from fraudulent activities.',
                      });
                    } else {
                      setEditingField('phone');
                    }
                  }}
                >
                  <p className="text-subhead text-foreground">
                    {form.phone ? `+971 ${form.phone}` : <span className="text-muted-foreground/50">Tap to add</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bio */}
        <section>
          <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">Bio</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div 
              className={cn(
                "py-3",
                editingField !== 'bio' && "cursor-pointer hover:bg-muted/30 -mx-5 px-5 rounded-lg transition-colors"
              )}
              onClick={() => editingField !== 'bio' && setEditingField('bio')}
            >
              {editingField === 'bio' ? (
                <div className="space-y-3">
                  <textarea
                    autoFocus
                    value={form.bio}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 2000);
                      updateField({ bio: value });
                    }}
                    placeholder="Tell others about yourself..."
                    rows={4}
                    maxLength={2000}
                    className="w-full p-4 bg-muted/20 rounded-xl border border-border/40 focus:ring-1 focus:ring-primary/30 outline-none resize-none placeholder:text-muted-foreground/50 text-foreground font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                    <p className={cn("text-caption1", form.bio.length >= 2000 ? "text-destructive" : "text-muted-foreground/70")}>{form.bio.length}/2000 characters</p>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                        className="text-caption1 text-muted-foreground hover:text-foreground font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); saveField('bio'); }}
                        disabled={saving}
                        className="text-caption1 text-primary hover:text-primary font-semibold"
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-subhead text-foreground whitespace-pre-wrap">
                    {form.bio || <span className="text-muted-foreground/50">Tap to add bio</span>}
                  </p>
                  {form.bio && (
                    <p className="text-caption1 text-muted-foreground/70 mt-2">{form.bio.length}/2000 characters</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Tags */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-subhead font-bold tracking-tight text-foreground">Tags</h3>
            <span className="text-subhead font-semibold text-muted-foreground/70">{form.tags.length}/3 selected</span>
          </div>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {TAGS.map(tag => {
                const isSelected = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-caption1 sm:text-subhead font-semibold transition-all border inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer",
                      isSelected 
                        ? "bg-muted/40 text-foreground border-border/60" 
                        : "bg-muted/30 text-foreground/90 border-border/40 hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    {tag}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-success" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

      </div>
      
      {/* KYC Verification Modal */}
      <KycVerificationModal 
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onVerified={() => setKycModalOpen(false)}
      />
    </div>
  );
}
