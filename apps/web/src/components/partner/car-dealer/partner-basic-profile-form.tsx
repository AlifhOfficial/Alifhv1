/**
 * Partner Basic Profile Form - Redesigned
 * 
 * Clean implementation following profile-view pattern
 * Uses usePartnerProfile hook for state management
 * Explicit edit mode with save/cancel actions
 */

'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePartnerProfile } from '@/hooks/partner/car-dealer/use-partner-profile';
import { usePartnerStats } from '@/hooks/partner/car-dealer/use-partner-stats';
import { 
  Camera, Loader2, Upload, Star, MapPin
} from 'lucide-react';
import { BrandAvatar } from './ui/brand-avatar';
import { cn } from '@/utils/cn';
import { getPublicUrl } from '@/utils';

const LocationMap = lazy(() => 
  import('@/components/profile/sections/location-map').then(mod => ({ default: mod.LocationMap }))
);

// ============================================================================
// Constants
// ============================================================================

const SPECIALTIES = [
  'Luxury Vehicles', 'Sports Cars', 'SUVs', 'Electric Vehicles',
  'Classic Cars', 'Motorcycles', 'Commercial Vehicles', 'Budget-Friendly',
  'Import Specialist', 'Certified Pre-Owned', 'Exotic Cars', 'Family Cars'
];

// ============================================================================
// Types
// ============================================================================

interface PartnerBasicProfileFormProps {
  partnerId: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function PartnerBasicProfileForm({ partnerId }: PartnerBasicProfileFormProps) {
  const { toast } = useToast();
  const { profile, isLoading, updateProfile, isUpdating } = usePartnerProfile(partnerId);
  const { stats, isLoading: statsLoading } = usePartnerStats(partnerId);

  const [editing, setEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const isGeocodingRef = React.useRef(false);

  const [form, setForm] = useState({
    website: '',
    address: '',
    emirate: '',
    city: '',
    lat: null as number | null,
    lng: null as number | null,
    showroomCount: 1,
    logo: null as string | null,
    heroImage: null as string | null,
    description: '',
    specialties: [] as string[],
    experienceYears: null as number | null,
    foundedYear: null as number | null,
    googleReviewUrl: '',
    tags: [] as string[],
  });

  // Initialize form from profile
  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        website: profile.website ?? '',
        address: profile.address ?? '',
        emirate: profile.emirate ?? '',
        city: profile.city ?? '',
        lat: profile.locationLat ?? null,
        lng: profile.locationLng ?? null,
        showroomCount: profile.showroomCount || 1,
        logo: profile.logo,
        heroImage: profile.heroImage,
        description: profile.description ?? '',
        specialties: profile.specialties ?? [],
        experienceYears: profile.experienceYears,
        foundedYear: profile.foundedYear,
        googleReviewUrl: profile.googleReviewUrl ?? '',
        tags: profile.tags ?? [],
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  // Update field
  const updateField = (updates: Partial<typeof form>) => {
    setForm(f => ({ ...f, ...updates }));
  };

  // Save changes
  const save = async () => {
    try {
      const payload: any = {};
      
      // Only include fields that have values or are explicitly set
      if (form.website?.trim()) payload.website = form.website.trim();
      if (form.address?.trim()) payload.address = form.address.trim();
      if (form.emirate?.trim()) payload.emirate = form.emirate.trim();
      if (form.city?.trim()) payload.city = form.city.trim();
      if (form.lat !== null) payload.locationLat = form.lat;
      if (form.lng !== null) payload.locationLng = form.lng;
      if (form.showroomCount) payload.showroomCount = form.showroomCount;
      if (form.logo !== null) payload.logo = form.logo;
      if (form.heroImage !== null) payload.heroImage = form.heroImage;
      if (form.description?.trim()) payload.description = form.description.trim();
      if (form.specialties?.length) payload.specialties = form.specialties;
      if (form.experienceYears !== null) payload.experienceYears = form.experienceYears;
      if (form.foundedYear !== null) payload.foundedYear = form.foundedYear;
      if (form.googleReviewUrl?.trim()) payload.googleReviewUrl = form.googleReviewUrl.trim();
      if (form.tags?.length) payload.tags = form.tags;

      console.log('[PartnerProfile] Saving payload:', payload);
      
      await updateProfile(payload);
      toast({ title: 'Profile saved' });
      setEditing(false);
    } catch (err) {
      console.error('[PartnerProfile] Save failed:', err);
      toast({ 
        title: 'Failed to save', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive' 
      });
    }
  };

  // Cancel editing
  const cancel = () => {
    if (profile) {
      setForm({
        website: profile.website ?? '',
        address: profile.address ?? '',
        emirate: profile.emirate ?? '',
        city: profile.city ?? '',
        lat: profile.locationLat ?? null,
        lng: profile.locationLng ?? null,
        showroomCount: profile.showroomCount || 1,
        logo: profile.logo,
        heroImage: profile.heroImage,
        description: profile.description ?? '',
        specialties: profile.specialties ?? [],
        experienceYears: profile.experienceYears,
        foundedYear: profile.foundedYear,
        googleReviewUrl: profile.googleReviewUrl ?? '',
        tags: profile.tags ?? [],
      });
    }
    setEditing(false);
  };

  // Image upload - immediately saves to profile
  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'heroImage'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid file type', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Max 5MB', variant: 'destructive' });
      return;
    }

    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('directory', `partner-${field}s`);
      const res = await fetch('/api/storage/upload', { 
        method: 'POST', 
        body: fd, 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      const storageKey = data.key;
      console.log(`[PartnerProfile] Uploaded ${field}:`, { key: storageKey, url: data.url });
      
      // Immediately save to profile
      await updateProfile({ [field]: storageKey });
      
      // Update local form state
      updateField({ [field]: storageKey });
      
      toast({ title: `${field === 'logo' ? 'Logo' : 'Hero image'} uploaded` });
    } catch (err) {
      console.error(`[PartnerProfile] Upload failed:`, err);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setImageUploading(false);
    }
  };

  // Fetch current location (browser geolocation)
  const handleUseCurrentLocation = () => {
    if (isGeocodingRef.current) return;
    
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

  // Toggle specialty
  const toggleSpecialty = (specialty: string) => {
    if (form.specialties.includes(specialty)) {
      updateField({ specialties: form.specialties.filter(s => s !== specialty) });
    } else if (form.specialties.length < 6) {
      updateField({ specialties: [...form.specialties, specialty] });
    } else {
      toast({ title: 'Max 6 specialties', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

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
                id="logo-upload" 
                onChange={(e) => uploadImage(e, 'logo')} 
                disabled={imageUploading}
              />
              <label 
                htmlFor="logo-upload" 
                className={cn(
                  "block cursor-pointer transition-opacity",
                  imageUploading ? "opacity-50" : "hover:opacity-90"
                )}
              >
                <BrandAvatar 
                  logoUrl={form.logo} 
                  brandName={profile.brandName} 
                  size="xl"
                  className="w-24 h-24 border border-border/40 shadow-sm"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </label>
              {imageUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">{profile.brandName}</h1>
                {profile.isVerified && (
                  <svg 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className="w-5 h-5 text-blue-500 flex-shrink-0"
                    style={{ minWidth: '20px', minHeight: '20px' }}
                  >
                    <circle cx="10" cy="10" r="10" />
                    <path 
                      fill="white" 
                      d="M14.3 6.7a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0l-2-2a1 1 0 1 1 1.4-1.4L9 11.3l4.3-4.3a1 1 0 0 1 1.4 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground/70">{profile.companyNameLegal}</p>
                {profile.experienceYears && (
                  <>
                    <span className="text-sm text-foreground/70">•</span>
                    <span className="text-sm text-foreground/70">
                      {profile.experienceYears} years experience
                    </span>
                  </>
                )}
              </div>
              
              {!profile.isVerified && (
                <div className="pt-2">
                  <a 
                    href="/partner/verify" 
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    Verify Business
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {editing ? (
              <>
                <button
                  onClick={cancel}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 border-y border-border divide-x divide-border">
          <div className="p-8 flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Inventory</span>
            <span className="text-xl font-semibold text-foreground">
              {statsLoading ? '—' : stats?.inventoryCount ?? '—'}
            </span>
          </div>
          <div className="p-8 flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Total Sales</span>
            <span className="text-xl font-semibold text-foreground">
              {statsLoading ? '—' : stats?.totalSales ?? '—'}
            </span>
          </div>
          <div className="p-8 flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Response Rate</span>
            <span className="text-xl font-semibold text-foreground">
              {statsLoading ? '—' : stats?.responseRate !== null && stats?.responseRate !== undefined ? `${stats.responseRate}%` : '—'}
            </span>
          </div>
          <div className="p-8 flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Rating</span>
            <span className="text-xl font-semibold text-foreground">
              {profile.platformRating ? (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {profile.platformRating.toFixed(1)}
                </span>
              ) : '—'}
            </span>
          </div>
          <div className="p-8 flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <span className="text-xl font-semibold">
              {profile.isVerified ? (
                <span className="flex items-center gap-2 text-foreground">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-500">
                    <circle cx="10" cy="10" r="10" />
                    <path fill="white" d="M14.3 6.7a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0l-2-2a1 1 0 1 1 1.4-1.4L9 11.3l4.3-4.3a1 1 0 0 1 1.4 0z" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="text-muted-foreground">Unverified</span>
              )}
            </span>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-12">
          
          {/* Awards & Badges */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Awards & Badges</h3>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6">
              {profile.badges && profile.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.badges.map((badge, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-2 rounded-md bg-muted/20 text-foreground text-sm font-medium border border-border"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No badges earned yet</p>
                  <a 
                    href="/partner/badges" 
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    Learn more about badges
                  </a>
                </div>
              )}
            </div>
          </section>
          
          {/* Basic Information */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Basic Information</h3>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Website</label>
                  <input
                    value={form.website}
                    onChange={(e) => updateField({ website: e.target.value })}
                    disabled={!editing}
                    placeholder="https://example.com"
                    className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Description */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Description</h3>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <textarea
                value={form.description}
                onChange={(e) => updateField({ description: e.target.value })}
                disabled={!editing}
                rows={4}
                placeholder="Tell customers about your dealership..."
                className="w-full p-4 bg-card rounded-xl border border-border focus:border-foreground outline-none resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40 text-foreground"
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.description.length} characters
              </p>
            </div>
          </section>
          
          {/* Hero Image */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Hero Image</h3>
              <span className="text-sm text-muted-foreground">Recommended: 1920x600px</span>
            </div>
            
            <div className="rounded-xl overflow-hidden border border-border/40 bg-secondary/10">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="hero-upload"
                onChange={(e) => uploadImage(e, 'heroImage')}
                disabled={imageUploading || !editing}
              />
              
              <div className="relative w-full h-64 group">
                {form.heroImage ? (
                  <>
                    <img
                      src={getPublicUrl(form.heroImage) || form.heroImage}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                    {editing && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label
                          htmlFor="hero-upload"
                          className="px-5 py-2 rounded-full bg-blue-500 text-white text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Change Image
                        </label>
                      </div>
                    )}
                  </>
                ) : (
                  <label
                    htmlFor="hero-upload"
                    className={cn(
                      "flex flex-col items-center justify-center h-full gap-3",
                      editing ? "cursor-pointer hover:bg-secondary/20 transition-colors" : "cursor-default"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {editing ? 'Click to upload hero image' : 'No hero image'}
                      </p>
                      {editing && (
                        <p className="text-xs text-muted-foreground">
                          Recommended: 1920x600px
                        </p>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>
            {editing && (
              <p className="text-xs text-muted-foreground">
                Upload a high-quality image to showcase your dealership.
              </p>
            )}
          </section>
          
          {/* Specialties */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Specialties</h3>
              <span className="text-sm text-muted-foreground">{form.specialties.length}/6 selected</span>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap gap-3">
                {SPECIALTIES.map(specialty => {
                  const isSelected = form.specialties.includes(specialty);
                  return (
                    <button
                      key={specialty}
                      onClick={() => editing && toggleSpecialty(specialty)}
                      disabled={!editing}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all border",
                        isSelected 
                          ? "bg-blue-500 text-white border-blue-500" 
                          : "bg-muted/20 text-foreground border-border hover:border-blue-500/40 hover:bg-muted/30",
                        !editing && !isSelected && "opacity-50",
                        !editing && "cursor-default"
                      )}
                    >
                      {specialty}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          
          {/* Business Details */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Business Details</h3>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={form.experienceYears || ''}
                    onChange={(e) => updateField({ experienceYears: parseInt(e.target.value) || null })}
                    disabled={!editing}
                    placeholder="0"
                    className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Founded Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={form.foundedYear || ''}
                    onChange={(e) => updateField({ foundedYear: parseInt(e.target.value) || null })}
                    disabled={!editing}
                    placeholder={new Date().getFullYear().toString()}
                    className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-foreground">Google Review URL</label>
                  <input
                    type="url"
                    value={form.googleReviewUrl}
                    onChange={(e) => updateField({ googleReviewUrl: e.target.value })}
                    disabled={!editing}
                    placeholder="https://g.page/..."
                    className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
              </div>
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
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Emirate</label>
                <input
                  value={form.emirate}
                  onChange={(e) => updateField({ emirate: e.target.value })}
                  disabled={!editing}
                  placeholder="Dubai"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-border/40 bg-secondary/10">
              <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">Loading map...</div>}>
                <LocationMap 
                  latitude={form.lat ?? undefined} 
                  longitude={form.lng ?? undefined} 
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
