/**
 * Profile View - Clean & Minimal
 * 
 * Edit mode with explicit save
 * Follows a modern, minimal design system (Mobbin-inspired)
 */

'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useUserProfile, type UserProfileUpdate } from '@/hooks/profile';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Loader2, 
  Camera,
  Check,
  X
} from 'lucide-react';
import { Avatar } from '@/components/ui/data-display/avatar';
import { cn } from '@/utils/cn';

const LocationMap = lazy(() => 
  import('./sections/location-map').then(mod => ({ default: mod.LocationMap }))
);

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

interface ProfileViewProps {
  userName?: string | null;
  userEmail?: string | null;
}

// ============================================================================
// Main Component
// ============================================================================

export function ProfileView({ userName, userEmail }: ProfileViewProps) {
  const { profile, updateProfile, refresh } = useUserProfile();
  const { toast } = useToast();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    city: '',
    emirate: '',
    lat: 25.2048,
    lng: 55.2708,
    tags: [] as string[],
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const isGeocodingRef = React.useRef(false);

  // Initialize form from profile
  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        bio: profile.description ?? '',
        city: profile.locationCity ?? '',
        emirate: profile.locationEmirate ?? '',
        lat: profile.locationLat ?? 25.2048,
        lng: profile.locationLng ?? 55.2708,
        tags: profile.tags ?? [],
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  // Update form field
  const updateField = (updates: Partial<typeof form>) => {
    setForm(f => ({ ...f, ...updates }));
  };

  // Save changes
  const save = async () => {
    setSaving(true);
    try {
      const payload: UserProfileUpdate = {
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        description: form.bio.trim() || undefined,
        locationCity: form.city.trim() || undefined,
        locationEmirate: form.emirate.trim() || undefined,
        locationLat: form.lat,
        locationLng: form.lng,
        tags: form.tags,
      };
      await updateProfile(payload);
      await refresh();
      toast({ title: 'Profile saved' });
      setEditing(false);
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const cancel = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        bio: profile.description ?? '',
        city: profile.locationCity ?? '',
        emirate: profile.locationEmirate ?? '',
        lat: profile.locationLat ?? 25.2048,
        lng: profile.locationLng ?? 55.2708,
        tags: profile.tags ?? [],
      });
    }
    setEditing(false);
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
      fd.append('directory', 'avatars');
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error();
      await updateProfile({ avatar: data.key });
      await refresh();
      toast({ title: 'Photo updated' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Fetch current location (browser geolocation)
  const handleUseCurrentLocation = () => {
    if (isGeocodingRef.current) return; // Prevent duplicate calls
    
    if (!navigator.geolocation) {
      toast({
        title: 'Not supported',
        description: 'Location services are not available in your browser',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingLocation(true);
    isGeocodingRef.current = true;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Reverse geocode to get address details
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
          );
          const data = await res.json();
          
          updateField({
            lat,
            lng,
            city: data?.address?.city || data?.address?.town || form.city,
            emirate: data?.address?.state || form.emirate,
          });
          
          toast({
            title: 'Location set',
            description: 'Your current location has been detected',
          });
        } catch {
          updateField({ lat, lng });
          toast({
            title: 'Location set',
            description: 'Location coordinates set. Please enter city/emirate manually.',
          });
        } finally {
          setIsLoadingLocation(false);
          isGeocodingRef.current = false;
        }
      },
      () => {
        setIsLoadingLocation(false);
        isGeocodingRef.current = false;
        toast({
          title: 'Permission denied',
          description: 'Please allow location access or enter manually',
          variant: 'destructive',
        });
      }
    );
  };

  // Location select from map click
  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const data = await res.json();
      updateField({
        lat,
        lng,
        city: data?.address?.city || data?.address?.town || form.city,
        emirate: data?.address?.state || form.emirate,
      });
    } catch {
      updateField({ lat, lng });
    }
  };

  // Tag toggle
  const toggleTag = (tag: string) => {
    if (form.tags.includes(tag)) {
      updateField({ tags: form.tags.filter(t => t !== tag) });
    } else if (form.tags.length < 3) {
      updateField({ tags: [...form.tags, tag] });
    } else {
      toast({ title: 'Max 3 tags', variant: 'destructive' });
    }
  };

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : userName ?? 'User';

  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  const memberSinceYear = profile?.memberSince ? new Date(profile.memberSince).getFullYear() : null;
  
  const completionChecks = [
    Boolean(form.firstName?.trim()),
    Boolean(form.lastName?.trim()),
    Boolean(form.phone?.trim()),
    Boolean(form.bio?.trim()),
    Boolean(form.city?.trim()),
    Boolean(form.emirate?.trim()),
    Boolean(form.tags?.length),
    Boolean(profile?.avatarUrl),
  ];
  const completionFilled = completionChecks.filter(Boolean).length;
  const completionTotal = completionChecks.length;
  const completionPercent = Math.round((completionFilled / completionTotal) * 100);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-8 py-16 space-y-16">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
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
                <Avatar 
                  src={profile?.avatarUrl} 
                  initials={initials} 
                  size="xl" 
                  className="w-24 h-24 border border-border/40 shadow-sm" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </label>
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
              
              <div className="flex flex-wrap gap-3 pt-4">
                {profile?.kycVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium tracking-wide uppercase shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                {profile?.badges?.map((badge, i) => (
                  <span key={i} className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
                    {badge}
                  </span>
                ))}
                <span className="text-xs text-muted-foreground py-1 flex items-center">
                  Member since {memberSinceYear ?? '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {editing ? (
              <>
                <button
                  onClick={cancel}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid - Minimalist & High Contrast */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Status</span>
            <span className="text-lg font-medium text-foreground flex items-center gap-2">
              {profile?.kycVerified ? (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  Verified
                </>
              ) : 'Unverified'}
            </span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Completion</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium text-foreground">{completionPercent}%</span>
              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden max-w-[80px]">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tags</span>
            <span className="text-lg font-medium text-foreground">{form.tags.length} / 3</span>
          </div>
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Location</span>
            <span className="text-lg font-medium text-foreground truncate" title={`${form.city}, ${form.emirate}`}>
              {form.city || 'Not set'}
            </span>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-12">
          
          {/* Personal Information */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => updateField({ firstName: e.target.value })}
                  disabled={!editing}
                  placeholder="Enter first name"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => updateField({ lastName: e.target.value })}
                  disabled={!editing}
                  placeholder="Enter last name"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <input
                  value={userEmail ?? ''}
                  disabled
                  className="w-full h-10 bg-transparent border-b border-border text-muted-foreground/70 cursor-not-allowed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateField({ phone: e.target.value })}
                  disabled={!editing}
                  placeholder="+971 50 000 0000"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
              </div>
            </div>
          </section>

          {/* Bio */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Bio</h3>
            </div>
            <div className="space-y-2">
              <textarea
                value={form.bio}
                onChange={(e) => updateField({ bio: e.target.value })}
                disabled={!editing}
                rows={4}
                placeholder="Tell others about yourself..."
                className="w-full p-4 bg-secondary/20 rounded-xl border-0 focus:ring-1 focus:ring-foreground/20 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40"
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.bio.length} characters
              </p>
            </div>
          </section>

          {/* Tags */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Tags</h3>
              <span className="text-sm text-muted-foreground">{form.tags.length}/3 selected</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {TAGS.map(tag => {
                const isSelected = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => editing && toggleTag(tag)}
                    disabled={!editing}
                    className={cn(
                      "px-4 py-2.5 rounded-md text-sm font-medium transition-all border",
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-background text-muted-foreground border-input hover:border-foreground/50 hover:text-foreground",
                      !editing && !isSelected && "opacity-50",
                      !editing && "cursor-default"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Location */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Location</h3>
              {editing && (
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLoadingLocation}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                >
                  {isLoadingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                  Auto-detect
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">City</label>
                <input
                  value={form.city}
                  onChange={(e) => updateField({ city: e.target.value })}
                  disabled={!editing}
                  placeholder="Dubai"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Emirate</label>
                <input
                  value={form.emirate}
                  onChange={(e) => updateField({ emirate: e.target.value })}
                  disabled={!editing}
                  placeholder="Dubai"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-border/40 bg-secondary/10">
              <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">Loading map...</div>}>
                <LocationMap 
                  latitude={form.lat} 
                  longitude={form.lng} 
                  onLocationSelect={editing ? handleLocationSelect : undefined} 
                />
              </Suspense>
            </div>
            {editing && (
              <p className="text-xs text-muted-foreground">
                Click on the map to pin your exact location.
              </p>
            )}
          </section>

        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} ALIFH LLC</p>
            <div className="flex gap-6">
              <a href="/data-policy" className="hover:text-foreground transition-colors">Data Policy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
