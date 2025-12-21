/**
 * Partner Profile View - Simplified
 * 
 * Single edit mode with explicit save
 * Following Alifh Design System (matches user profile pattern)
 */

'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { usePartnerProfile } from '@/hooks/partner';
import { useToast } from '@/hooks/use-toast';
import { Camera, X } from 'lucide-react';
import { BrandAvatar } from './ui/brand-avatar';

const LocationMap = lazy(() => 
  import('@/components/profile/sections/location-map').then(mod => ({ default: mod.LocationMap }))
);

// ============================================================================
// Constants
// ============================================================================

const SPECIALTIES = [
  'Luxury Vehicles',
  'Sports Cars',
  'SUVs',
  'Electric Vehicles',
  'Classic Cars',
  'Motorcycles',
  'Commercial Vehicles',
  'Budget-Friendly',
];

// ============================================================================
// Types
// ============================================================================

interface PartnerProfileViewProps {
  partnerId: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function PartnerProfileView({ partnerId }: PartnerProfileViewProps) {
  const { profile, isLoading, error, updateProfile, isUpdating } = usePartnerProfile(partnerId);
  const { toast } = useToast();

  const [form, setForm] = useState({
    brandName: '',
    website: '',
    description: '',
    address: '',
    city: '',
    emirate: '',
    lat: 25.2048 as number | null,
    lng: 55.2708 as number | null,
    showroomCount: 1,
    specialties: [] as string[],
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const isGeocodingRef = React.useRef(false);

  // Initialize form from profile
  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        brandName: profile.brandName ?? '',
        website: profile.website ?? '',
        description: profile.description ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        emirate: profile.emirate ?? '',
        lat: profile.locationLat ?? 25.2048,
        lng: profile.locationLng ?? 55.2708,
        showroomCount: profile.showroomCount ?? 1,
        specialties: profile.specialties ?? [],
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
      await updateProfile({
        brandName: form.brandName.trim() || undefined,
        website: form.website.trim() || undefined,
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        locationLat: form.lat ?? undefined,
        locationLng: form.lng ?? undefined,
        showroomCount: form.showroomCount,
        specialties: form.specialties,
      });
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
        brandName: profile.brandName ?? '',
        website: profile.website ?? '',
        description: profile.description ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        emirate: profile.emirate ?? '',
        lat: profile.locationLat ?? 25.2048,
        lng: profile.locationLng ?? 55.2708,
        showroomCount: profile.showroomCount ?? 1,
        specialties: profile.specialties ?? [],
      });
    }
    setEditing(false);
  };

  // Logo upload
  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('directory', 'partner-logos');
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error();
      await updateProfile({ logo: data.key });
      toast({ title: 'Logo updated' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setLogoUploading(false);
    }
  };

  // Fetch current location
  const handleUseCurrentLocation = () => {
    if (isGeocodingRef.current) return;
    
    if (!navigator.geolocation) {
      toast({ title: 'Not supported', description: 'Location services not available', variant: 'destructive' });
      return;
    }

    setIsLoadingLocation(true);
    isGeocodingRef.current = true;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
          const data = await res.json();
          
          updateField({
            lat,
            lng,
            city: data?.address?.city || data?.address?.town || form.city,
            emirate: data?.address?.state || form.emirate,
            address: data?.display_name || form.address,
          });
          
          toast({ title: 'Location set' });
        } catch {
          updateField({ lat, lng });
          toast({ title: 'Location set', description: 'Please enter address manually.' });
        } finally {
          setIsLoadingLocation(false);
          isGeocodingRef.current = false;
        }
      },
      () => {
        setIsLoadingLocation(false);
        isGeocodingRef.current = false;
        toast({ title: 'Permission denied', variant: 'destructive' });
      }
    );
  };

  // Location select from map
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
    } else if (form.specialties.length < 4) {
      updateField({ specialties: [...form.specialties, specialty] });
    } else {
      toast({ title: 'Max 4 specialties', variant: 'destructive' });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const initials = profile.brandName?.slice(0, 2).toUpperCase() ?? 'BP';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <header className="flex items-start justify-between gap-6 pb-8 border-b border-border/40">
          {/* Left: Brand Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium">{profile.brandName}</h1>
              {profile.isVerified && (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <circle cx="12" cy="12" r="10" className="fill-primary" />
                  <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{profile.companyNameLegal}</p>
            
            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.badges.map((badge, i) => (
                  <span key={i} className="px-2 py-0.5 bg-foreground text-background text-xs font-medium">{badge}</span>
                ))}
              </div>
            )}

            {/* Stats line + Edit */}
            <div className="flex items-center gap-3 mt-3">
              <p className="text-sm text-muted-foreground">
                {profile.experienceYears ? `${profile.experienceYears} years experience` : 'New partner'}
              </p>
              <span className="text-muted-foreground">·</span>
              {editing ? (
                <div className="flex items-center gap-2 text-sm">
                  <button onClick={save} disabled={saving} className="text-primary hover:underline disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <span className="text-muted-foreground">·</span>
                  <button onClick={cancel} disabled={saving} className="text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="text-sm text-primary hover:underline">
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Right: Logo */}
          <div className="flex-shrink-0">
            <div className="relative group">
              <input type="file" accept="image/*" className="hidden" id="logo" onChange={uploadLogo} />
              <BrandAvatar logoUrl={profile.logo} brandName={profile.brandName} size="lg" />
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {!logoUploading && (
                <div className="absolute -bottom-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label htmlFor="logo" className="h-7 w-7 bg-background border border-border/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-muted">
                    <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                  </label>
                  {profile.logo && (
                    <button
                      onClick={async () => {
                        setLogoUploading(true);
                        try {
                          await updateProfile({ logo: null });
                          toast({ title: 'Logo removed' });
                        } catch {
                          toast({ title: 'Failed', variant: 'destructive' });
                        } finally {
                          setLogoUploading(false);
                        }
                      }}
                      className="h-7 w-7 bg-background border border-border/40 rounded-full flex items-center justify-center hover:bg-muted"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================================================================ */}
        {/* TWO COLUMN LAYOUT */}
        {/* ================================================================ */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 pt-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Company Info */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Brand Name</label>
                  <input
                    value={form.brandName}
                    onChange={(e) => updateField({ brandName: e.target.value })}
                    disabled={!editing}
                    className="w-full h-10 px-3 mt-1.5 bg-background border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted/20 disabled:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Website</label>
                  <input
                    value={form.website}
                    onChange={(e) => updateField({ website: e.target.value })}
                    disabled={!editing}
                    placeholder="https://example.com"
                    className="w-full h-10 px-3 mt-1.5 bg-background border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted/20 disabled:text-muted-foreground"
                  />
                </div>
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Description</h2>
              <textarea
                value={form.description}
                onChange={(e) => updateField({ description: e.target.value })}
                disabled={!editing}
                rows={4}
                placeholder="Tell customers about your business..."
                className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none disabled:bg-muted/20 disabled:text-muted-foreground"
              />
            </section>

            {/* Specialties */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Specialties <span className="font-normal">({form.specialties.length}/4)</span></h2>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => editing && toggleSpecialty(specialty)}
                    disabled={!editing}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors disabled:opacity-60 ${
                      form.specialties.includes(specialty)
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border/40 hover:bg-muted/50'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Location */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-muted-foreground">Location</h2>
                {editing && (
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={isLoadingLocation}
                    className="h-8 px-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoadingLocation && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                    {isLoadingLocation ? 'Getting...' : 'Use current location'}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => updateField({ address: e.target.value })}
                    disabled={!editing}
                    placeholder="Sheikh Zayed Road, Dubai"
                    className="w-full h-10 px-3 mt-1.5 bg-background border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted/20 disabled:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">City</label>
                    <input
                      value={form.city}
                      onChange={(e) => updateField({ city: e.target.value })}
                      disabled={!editing}
                      className="w-full h-10 px-3 mt-1.5 bg-background border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted/20 disabled:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Emirate</label>
                    <input
                      value={form.emirate}
                      disabled
                      className="w-full h-10 px-3 mt-1.5 bg-muted/20 border border-border/20 rounded-lg text-sm text-muted-foreground"
                    />
                  </div>
                </div>

                <Suspense fallback={<div className="h-48 bg-muted/20 rounded-lg" />}>
                  <LocationMap 
                    latitude={form.lat ?? undefined} 
                    longitude={form.lng ?? undefined} 
                    onLocationSelect={editing ? handleLocationSelect : undefined} 
                  />
                </Suspense>
                {editing && (
                  <p className="text-xs text-muted-foreground">
                    Click the map to pin your location, or use the button above.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/40 mt-8">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} ALIFH LLC · <a href="/data-policy" className="hover:underline">Data Policy</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
