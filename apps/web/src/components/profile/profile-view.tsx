/**
 * Profile View - Clean & Minimal
 * 
 * Tap-to-edit per field pattern
 * Follows our established design system
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile, type UserProfileUpdate, useUserStats } from '@/hooks/profile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { authClient } from '@/lib/auth/client';
import { 
  Loader2, 
  Camera,
  CheckCircle2,
  Star,
  X,
  Clock
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { KycVerificationModal } from '@/components/kyc';
import { cn } from '@/utils/cn';

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

export function ProfileView() {
  const { session: user } = useAuth();
  const { profile, updateProfile, refresh, isLoading: profileLoading } = useUserProfile();
  const { stats } = useUserStats();
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

      await updateProfile(payload);
      await refresh();
      setEditingField(null);
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
  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
      toast({ title: 'Invalid file type', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Max 5MB', variant: 'destructive' });
      return;
    }

    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (profile?.avatar) {
        fd.append('previousKey', profile.avatar);
      }
      const res = await fetch('/api/storage/upload-avatar', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await updateProfile({ avatar: data.key });
      toast({ title: 'Photo updated' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
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
      toast({ title: 'Photo removed' });
    } catch {
      toast({ title: 'Failed to remove', variant: 'destructive' });
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
        toast({ title: 'Invalid code', description: error.message, variant: 'destructive' });
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
          !disabled && field !== null && "cursor-pointer hover:bg-muted/30 -mx-5 px-5 transition-colors",
          disabled && onDisabledClick && "cursor-pointer -mx-5 px-5"
        )}
        onClick={() => {
          if (disabled && onDisabledClick) {
            onDisabledClick();
          } else if (!disabled && field !== null) {
            setEditingField(field);
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-muted-foreground/70">{label}</p>
              {suffix}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={String(value || '')}
                  onChange={(e) => updateField({ [field as string]: e.target.value })}
                  placeholder={placeholder}
                  className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveField(field);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); saveField(field); }}
                  disabled={saving}
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                >
                  {saving ? '...' : 'Save'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className={cn("text-sm font-medium text-foreground", disabled && "text-foreground/70")}>
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

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="avatar" 
              onChange={uploadAvatar} 
              disabled={avatarUploading}
            />
            <label 
              htmlFor="avatar" 
              className={cn(
                "block cursor-pointer transition-opacity",
                avatarUploading ? "opacity-50" : "hover:opacity-90"
              )}
            >
              <UserAvatar 
                key={profile?.avatarUrl || 'no-avatar'}
                src={profile?.avatarUrl}
                name={displayName}
                size="xl" 
                className="w-24 h-24 border-4 border-background shadow-sm"
                useGeneratedAvatar={profile?.preferences?.useGeneratedAvatar ?? true}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
          
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{displayName}</h1>
              {profile?.kycVerified && !isKycExpired && (
                <CheckCircle2 className={cn(
                  "w-5 h-5 text-blue-500 transition-opacity",
                  isExpiringSoon && "opacity-50 animate-pulse"
                )} />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user?.email}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-0.5">
              Member since {memberSinceYear ?? '—'}
            </p>
            
            {/* KYC Status Messages */}
            {isKycExpired ? (
              <button 
                onClick={() => setKycModalOpen(true)}
                className="text-xs text-red-500 hover:text-red-600 font-medium mt-2 inline-block"
              >
                Verification expired - Renew now
              </button>
            ) : profile?.kycStatus === 'pending' ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium mt-2">
                <Clock className="w-3.5 h-3.5" />
                Under Review
              </div>
            ) : profile?.kycStatus === 'rejected' ? (
              <button 
                onClick={() => setKycModalOpen(true)}
                className="text-xs text-red-500 hover:text-red-600 font-medium mt-2 inline-block"
              >
                Verification failed - Try again
              </button>
            ) : !profile?.kycVerified ? (
              <button 
                onClick={() => setKycModalOpen(true)}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-2 inline-block"
              >
                Get verified
              </button>
            ) : showResubmit ? (
              <button 
                onClick={() => setKycModalOpen(true)}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-2 inline-block"
              >
                Renew verification
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 border-y border-border/40 divide-x divide-border/40 bg-sidebar rounded-xl">
          <div className="p-5 flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70">Listings</span>
            <span className="text-xl font-bold text-foreground">{stats?.listingsCount ?? '—'}</span>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70">Sold</span>
            <span className="text-xl font-bold text-foreground">{stats?.soldCount ?? '—'}</span>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70">Response</span>
            <span className="text-xl font-bold text-foreground">
              {stats?.responseRate !== null && stats?.responseRate !== undefined ? `${stats.responseRate}%` : '—'}
            </span>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70">Rating</span>
            <span className="text-xl font-bold text-foreground">
              {profile?.platformRating ? (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {profile.platformRating.toFixed(1)}
                </span>
              ) : '—'}
            </span>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70">Status</span>
            <span className="text-xl font-bold text-foreground">
              {profile?.kycVerified && !isKycExpired ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className={cn(
                    "w-5 h-5 text-blue-500 transition-opacity",
                    isExpiringSoon && "opacity-50"
                  )} />
                  <span className={cn(isExpiringSoon && "text-amber-500")}>
                    {isExpiringSoon ? 'Expiring' : 'Verified'}
                  </span>
                </span>
              ) : isKycExpired ? (
                <span className="flex items-center gap-1.5 text-red-500">
                  <X className="w-5 h-5" />
                  Expired
                </span>
              ) : profile?.kycStatus === 'pending' ? (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Clock className="w-5 h-5" />
                  In Review
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
        </div>

        {/* Awards & Badges */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Awards & Badges</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            {profile?.badges && profile.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((badge, i) => (
                  <span 
                    key={i} 
                    className="px-4 py-2 rounded-lg bg-muted/30 text-foreground text-sm font-semibold border border-border/40"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[15px] font-medium text-muted-foreground/60 mb-2">No badges earned yet</p>
                <a 
                  href="/badges" 
                  className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Learn more about badges
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Personal Information */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Personal Information</h3>
          
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
                  description: 'Please email support@alifh.com to change your verified email address. This protects you from fraudulent activities.',
                });
              } : undefined}
              suffix={profile?.emailVerified ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <a 
                  href="/verify-email" 
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  Verify
                </a>
              )}
            />
            
            {/* Phone Number - Custom inline with +971 prefix */}
            <div className="py-3 border-b border-border/20 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-muted-foreground/70">Phone Number</p>
                {(profile?.phoneNumberVerified || phoneJustVerified) ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : form.phone && phoneVerifyStep === 'idle' ? (
                  <button
                    onClick={sendPhoneOTP}
                    className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                  >
                    Verify
                  </button>
                ) : null}
              </div>
              
              {phoneVerifyStep === 'otp' ? (
                // OTP input step
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
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
                      className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={otpCountdown > 0 ? undefined : sendPhoneOTP}
                      disabled={otpCountdown > 0}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend code'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={verifyPhoneOTP}
                        disabled={otp.length !== 6}
                        className="text-xs text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button
                        onClick={cancelPhoneVerify}
                        className="text-xs text-muted-foreground hover:text-foreground font-semibold"
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
                  <span className="text-sm text-muted-foreground">Sending...</span>
                </div>
              ) : editingField === 'phone' ? (
                // Edit phone number
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">+971</span>
                  <input
                    autoFocus
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => updateField({ phone: e.target.value.replace(/[^\d]/g, '').slice(0, 9) })}
                    placeholder="50 000 0000"
                    className="flex-1 h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    maxLength={9}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveField('phone');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => saveField('phone')}
                    disabled={saving}
                    className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Cancel
                  </button>
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
                        description: 'Please email support@alifh.com to change your verified phone number. This protects you from fraudulent activities.',
                      });
                    } else {
                      setEditingField('phone');
                    }
                  }}
                >
                  <p className="text-sm font-medium text-foreground">
                    {form.phone ? `+971 ${form.phone}` : <span className="text-muted-foreground/50">Tap to add</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bio */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Bio</h3>
          
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
                    onChange={(e) => updateField({ bio: e.target.value })}
                    placeholder="Tell others about yourself..."
                    rows={4}
                    className="w-full p-4 bg-muted/20 rounded-xl border border-border/40 focus:ring-1 focus:ring-primary/30 outline-none resize-none placeholder:text-muted-foreground/50 text-foreground font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground/70">{form.bio.length} characters</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); saveField('bio'); }}
                        disabled={saving}
                        className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                        className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                    {form.bio || <span className="text-muted-foreground/50">Tap to add bio</span>}
                  </p>
                  {form.bio && (
                    <p className="text-xs text-muted-foreground/70 mt-2">{form.bio.length} characters</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Tags */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold tracking-tight text-foreground">Tags</h3>
            <span className="text-sm font-semibold text-muted-foreground/70">{form.tags.length}/3 selected</span>
          </div>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="flex flex-wrap gap-3">
              {TAGS.map(tag => {
                const isSelected = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold transition-all border inline-flex items-center gap-2 cursor-pointer",
                      isSelected 
                        ? "bg-muted/40 text-foreground border-border/60" 
                        : "bg-muted/30 text-foreground/90 border-border/40 hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    {tag}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* KYC Expiry Info - Bottom */}
        {profile?.kycVerified && !isKycExpired && kycExpiryDate && (
          <section>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={cn(
                    "w-5 h-5 text-blue-500",
                    isExpiringSoon && "opacity-50"
                  )} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Identity Verified</p>
                    <p className={cn(
                      "text-xs font-medium mt-0.5",
                      isExpiringSoon ? "text-amber-500" : "text-muted-foreground/70"
                    )}>
                      {isExpiringSoon 
                        ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}` 
                        : `Valid until ${kycExpiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      }
                    </p>
                  </div>
                </div>
                {showResubmit && (
                  <button 
                    onClick={() => setKycModalOpen(true)}
                    className="text-xs text-blue-500 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors"
                  >
                    Renew
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

      </div>
      
      {/* KYC Verification Modal */}
      <KycVerificationModal 
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onVerified={() => {
          setKycModalOpen(false);
          refresh();
          toast({ title: 'Identity verified!', description: 'Your profile is now verified.' });
        }}
      />
    </div>
  );
}