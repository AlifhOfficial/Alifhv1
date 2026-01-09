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
import { 
  Loader2, 
  Camera,
  CheckCircle2,
  Star,
  X
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
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
        phone: profile.phone ?? '',
        bio: profile.description ?? '',
        tags: profile.tags ?? [],
      });
    }
  }, [profile]);

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
          payload.phone = form.phone.trim() || null;
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

  // Editable field component
  const EditableField = ({ 
    field, 
    label, 
    value, 
    placeholder,
    disabled = false,
    suffix,
  }: { 
    field: EditingField; 
    label: string; 
    value: string | null; 
    placeholder: string;
    disabled?: boolean;
    suffix?: React.ReactNode;
  }) => {
    // Only show editing if field is not null, not disabled, and matches current editing field
    const isEditing = field !== null && !disabled && editingField === field;
    
    return (
      <div 
        className={cn(
          "py-3 border-b border-border/20 last:border-0",
          !disabled && field !== null && "cursor-pointer hover:bg-muted/30 -mx-5 px-5 transition-colors"
        )}
        onClick={() => !disabled && field !== null && setEditingField(field)}
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

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : user?.name ?? 'User';

  const memberSinceYear = profile?.memberSince ? new Date(profile.memberSince).getFullYear() : null;

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
              {profile?.kycVerified && (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user?.email}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-0.5">
              Member since {memberSinceYear ?? '—'}
            </p>
            {!profile?.kycVerified && (
              <a 
                href="/kyc/verify" 
                className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-2 inline-block"
              >
                Get verified
              </a>
            )}
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
              {profile?.kycVerified ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  Verified
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
            <EditableField 
              field="phone" 
              label="Phone Number" 
              value={form.phone} 
              placeholder="+971 50 000 0000"
              suffix={profile?.phoneVerified ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : form.phone ? (
                <a 
                  href="/verify-phone" 
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  Verify
                </a>
              ) : null}
            />
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

      </div>
    </div>
  );
}
