/**
 * Partner Profile
 * Minimal profile-style design with tap-to-edit fields
 */

'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePartnerProfile } from '@/hooks/partner/car-dealer/use-partner-profile';
import { usePartnerStats } from '@/hooks/partner/car-dealer/use-partner-stats';
import { compressAndUploadPartnerImage } from '@/lib/storage';
import { 
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { BrandAvatar } from './ui/brand-avatar';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicUrl } from '@/utils';
import Link from 'next/link';

const LocationMap = lazy(() => 
  import('@/components/profile/sections/location-map').then(mod => ({ default: mod.LocationMap }))
);

interface PartnerBasicProfileFormProps {
  partnerId: string;
}

type EditingField = 
  | null 
  | 'brandName' 
  | 'website' 
  | 'description' 
  | 'experienceYears' 
  | 'foundedYear' 
  | 'googleReviewUrl' 
  | 'city' 
  | 'emirate'
  | 'specialties';

// ============================================================================
// EditableField Component (moved outside to prevent re-creation on every render)
// ============================================================================

interface EditableFieldProps {
  field: EditingField;
  label: string;
  value: string | number | null;
  placeholder: string;
  type?: 'text' | 'number' | 'url';
  multiline?: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  onStartEdit: () => void;
  onChange: (value: string | number | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditableField = React.memo(function EditableField({
  field,
  label,
  value,
  placeholder,
  type = 'text',
  multiline = false,
  isEditing,
  isUpdating,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
}: EditableFieldProps) {
  return (
    <div 
      className={cn(
        "py-3 border-b border-border/20 last:border-0",
        !isEditing && "cursor-pointer hover:bg-muted/30 -mx-5 px-5 transition-colors"
      )}
      onClick={() => !isEditing && onStartEdit()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-muted-foreground/70 mb-1">{label}</p>
          {isEditing ? (
            <div className="space-y-2">
              {multiline ? (
                <textarea
                  autoFocus
                  value={String(value || '')}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full bg-muted/20 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') onCancel();
                  }}
                />
              ) : (
                <input
                  autoFocus
                  type={type}
                  value={String(value || '')}
                  onChange={(e) => {
                    const val = type === 'number' ? (parseInt(e.target.value) || null) : e.target.value;
                    onChange(val);
                  }}
                  placeholder={placeholder}
                  className="w-full h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSave();
                    if (e.key === 'Escape') onCancel();
                  }}
                />
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onCancel(); }}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                  disabled={isUpdating}
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                >
                  {isUpdating ? '...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className={cn("text-sm font-medium text-foreground", multiline && "whitespace-pre-line")}>
              {value || <span className="text-muted-foreground/50">Tap to add</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export function PartnerBasicProfileForm({ partnerId }: PartnerBasicProfileFormProps) {
  const { toast } = useToast();
  const { profile, isLoading, updateProfile, isUpdating, refetchFresh } = usePartnerProfile(partnerId);
  const { stats, isLoading: statsLoading } = usePartnerStats(partnerId);

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const isGeocodingRef = React.useRef(false);
  const [customSpecialty, setCustomSpecialty] = useState('');

  const [form, setForm] = useState({
    brandName: '',
    website: '',
    description: '',
    city: '',
    emirate: '',
    lat: null as number | null,
    lng: null as number | null,
    logo: null as string | null,
    heroImage: null as string | null,
    specialties: [] as string[],
    experienceYears: null as number | null,
    foundedYear: null as number | null,
    googleReviewUrl: '',
  });

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        brandName: profile.brandName ?? '',
        website: profile.website ?? '',
        description: profile.description ?? '',
        city: profile.city ?? '',
        emirate: profile.emirate ?? '',
        lat: profile.locationLat ?? null,
        lng: profile.locationLng ?? null,
        logo: profile.logo,
        heroImage: profile.heroImage,
        specialties: profile.specialties ?? [],
        experienceYears: profile.experienceYears,
        foundedYear: profile.foundedYear,
        googleReviewUrl: profile.googleReviewUrl ?? '',
      });
    }
  }, [profile]);

  const updateField = (updates: Partial<typeof form>) => {
    setForm(f => ({ ...f, ...updates }));
  };

  // Save single field
  const saveField = async (field: EditingField) => {
    if (!field) return;
    
    try {
      const payload: any = {};
      
      switch (field) {
        case 'brandName':
          if (form.brandName?.trim()) payload.brandName = form.brandName.trim();
          break;
        case 'website':
          payload.website = form.website?.trim() || null;
          break;
        case 'description':
          payload.description = form.description?.trim() || null;
          break;
        case 'experienceYears':
          payload.experienceYears = form.experienceYears;
          break;
        case 'foundedYear':
          payload.foundedYear = form.foundedYear;
          break;
        case 'googleReviewUrl':
          payload.googleReviewUrl = form.googleReviewUrl?.trim() || null;
          if (form.googleReviewUrl?.trim() !== profile?.googleReviewUrl?.trim()) {
            payload.googlePlaceId = null;
          }
          break;
        case 'city':
          payload.city = form.city?.trim() || null;
          break;
        case 'emirate':
          payload.emirate = form.emirate?.trim() || null;
          break;
        case 'specialties':
          payload.specialties = form.specialties;
          break;
      }

      await updateProfile(payload);
      setEditingField(null);
      
      // Sync Google reviews if URL changed
      if (field === 'googleReviewUrl' && form.googleReviewUrl?.trim() && 
          form.googleReviewUrl?.trim() !== profile?.googleReviewUrl?.trim()) {
        toast({ title: 'Syncing reviews...' });
        try {
          const syncRes = await fetch('/api/partner/google-reviews/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partnerId }),
            credentials: 'include',
          });
          if (syncRes.ok) {
            const data = await syncRes.json();
            toast({ title: 'Reviews synced', description: `${data.rating?.toFixed(1)} ⭐` });
            await refetchFresh();
          }
        } catch {}
      }
    } catch (err) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    if (profile) {
      setForm({
        brandName: profile.brandName ?? '',
        website: profile.website ?? '',
        description: profile.description ?? '',
        city: profile.city ?? '',
        emirate: profile.emirate ?? '',
        lat: profile.locationLat ?? null,
        lng: profile.locationLng ?? null,
        logo: profile.logo,
        heroImage: profile.heroImage,
        specialties: profile.specialties ?? [],
        experienceYears: profile.experienceYears,
        foundedYear: profile.foundedYear,
        googleReviewUrl: profile.googleReviewUrl ?? '',
      });
    }
    setEditingField(null);
  };

  // Image upload - client-side compression + direct R2 upload
  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'heroImage'
  ) => {
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

    const setUploading = field === 'logo' ? setLogoUploading : setBannerUploading;
    setUploading(true);
    try {
      const imageType = field === 'heroImage' ? 'hero' : 'logo';
      // Client-side compression + direct R2 upload (fast!)
      const result = await compressAndUploadPartnerImage(file, partnerId, imageType);
      
      await updateProfile({ [field]: result.key });
      updateField({ [field]: result.key });
      toast({ title: `${field === 'logo' ? 'Logo' : 'Banner'} updated` });
    } catch (err: any) {
      toast({ title: err.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // Get current location
  const handleUseCurrentLocation = () => {
    if (isGeocodingRef.current || !navigator.geolocation) return;
    
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
          const newCity = data?.address?.city || data?.address?.town || form.city;
          const newEmirate = data?.address?.state || form.emirate;
          updateField({ lat, lng, city: newCity, emirate: newEmirate });
          await updateProfile({ locationLat: lat, locationLng: lng, city: newCity, emirate: newEmirate });
          toast({ title: 'Location updated' });
        } catch {
          updateField({ lat, lng });
          await updateProfile({ locationLat: lat, locationLng: lng });
        } finally {
          setIsLoadingLocation(false);
          isGeocodingRef.current = false;
        }
      },
      () => {
        setIsLoadingLocation(false);
        isGeocodingRef.current = false;
        toast({ title: 'Location access denied', variant: 'destructive' });
      }
    );
  };

  // Map location select
  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const data = await res.json();
      const newCity = data?.address?.city || data?.address?.town || form.city;
      const newEmirate = data?.address?.state || form.emirate;
      updateField({ lat, lng, city: newCity, emirate: newEmirate });
      await updateProfile({ locationLat: lat, locationLng: lng, city: newCity, emirate: newEmirate });
    } catch {
      updateField({ lat, lng });
      await updateProfile({ locationLat: lat, locationLng: lng });
    }
  };

  // Add specialty
  const addSpecialty = async () => {
    const trimmed = customSpecialty.trim();
    if (!trimmed || form.specialties.includes(trimmed) || form.specialties.length >= 4) return;
    const newSpecialties = [...form.specialties, trimmed];
    updateField({ specialties: newSpecialties });
    setCustomSpecialty('');
    await updateProfile({ specialties: newSpecialties });
  };

  // Remove specialty
  const removeSpecialty = async (specialty: string) => {
    const newSpecialties = form.specialties.filter(s => s !== specialty);
    updateField({ specialties: newSpecialties });
    await updateProfile({ specialties: newSpecialties });
  };

  // Sync reviews manually
  const syncReviews = async () => {
    if (!form.googleReviewUrl?.trim()) return;
    toast({ title: 'Syncing reviews...' });
    try {
      const res = await fetch('/api/partner/google-reviews/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      toast({ title: 'Reviews synced', description: `${data.rating?.toFixed(1)} ⭐ (${data.reviewCount} reviews)` });
      await refetchFresh();
    } catch {
      toast({ title: 'Sync failed', variant: 'destructive' });
    }
  };

  // Helper to create props for EditableField
  const getEditableFieldProps = (field: NonNullable<EditingField>) => ({
    field,
    isEditing: editingField === field,
    isUpdating,
    onStartEdit: () => setEditingField(field),
    onChange: (val: string | number | null) => updateField({ [field]: val }),
    onSave: () => saveField(field),
    onCancel: cancelEdit,
  });

  // Loading
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-8">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        
        {/* Profile Fields Skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-border/30">
              <div>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-8 w-14 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-muted-foreground">Unable to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back */}
      <Link 
        href="/partner-dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Dashboard
      </Link>

      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden bg-muted/30 border border-border/40 h-24 sm:h-32 mb-6 group">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="banner-upload"
          onChange={(e) => uploadImage(e, 'heroImage')}
          disabled={bannerUploading}
        />
        
        {form.heroImage ? (
          <>
            <img
              src={profile?.heroImageUrl || getPublicUrl(form.heroImage) || form.heroImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label
                htmlFor="banner-upload"
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
              >
                {bannerUploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              </label>
              <button
                onClick={async () => {
                  await updateProfile({ heroImage: null });
                  updateField({ heroImage: null });
                }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/50 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </>
        ) : (
          <label
            htmlFor="banner-upload"
            className="flex items-center justify-center h-full cursor-pointer hover:bg-secondary/40 transition-colors"
          >
            {bannerUploading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Add banner</span>
              </div>
            )}
          </label>
        )}
      </div>

      {/* Profile Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Avatar */}
        <div className="relative group -mt-10 sm:-mt-12 z-10 shrink-0">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            id="logo-upload" 
            onChange={(e) => uploadImage(e, 'logo')} 
            disabled={logoUploading}
          />
          <label htmlFor="logo-upload" className="block cursor-pointer">
            <BrandAvatar 
              logoUrl={profile.logoUrl || form.logo} 
              brandName={profile.brandName} 
              size="xl"
              className={cn("w-20 h-20 sm:w-24 sm:h-24 border-4 border-background", logoUploading && "opacity-50")}
            />
            <div className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl transition-opacity",
              logoUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {logoUploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </label>
          {/* Remove logo button */}
          {form.logo && !logoUploading && (
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setLogoUploading(true);
                try {
                  await updateProfile({ logo: null });
                  updateField({ logo: null });
                  toast({ title: 'Logo removed' });
                } catch {
                  toast({ title: 'Failed to remove', variant: 'destructive' });
                } finally {
                  setLogoUploading(false);
                }
              }}
              className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
              title="Remove logo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1 sm:pt-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">{profile.brandName}</h1>
            {profile.tier === 'black' ? (
              <span className="inline-flex items-center px-1.5 h-5 text-[10px] font-black tracking-wider bg-black text-white">
                BLK
              </span>
            ) : profile.isVerified ? (
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            ) : null}
            <button
              onClick={() => refetchFresh()}
              disabled={isLoading}
              className="ml-auto p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isLoading && "animate-spin")} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
            {profile.companyNameLegal}
          </p>
          {!profile.isVerified && (
            <Link 
              href="/partner/verify" 
              className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-1 inline-block"
            >
              Get verified
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-border/40 bg-sidebar rounded-xl mb-6 sm:mb-8 overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col gap-1 border-r border-b md:border-b-0 border-border/40">
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground/70">Inventory</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{statsLoading ? '—' : stats?.inventoryCount ?? 0}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-border/40">
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground/70">Sales</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{statsLoading ? '—' : stats?.totalSales ?? 0}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-1 border-r border-border/40">
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground/70">Response</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{statsLoading ? '—' : stats?.responseRate ? `${stats.responseRate}%` : '—'}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-1">
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground/70">Rating</span>
          <span className="text-xl font-bold text-foreground">
            {profile.googleRating ? (
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {profile.googleRating.toFixed(1)}
              </span>
            ) : '—'}
          </span>
        </div>
      </div>

      {/* About */}
      <section className="mb-6 sm:mb-8">
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">About</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <EditableField 
            {...getEditableFieldProps('brandName')}
            label="Business name" 
            value={form.brandName} 
            placeholder="Your business name"
          />
          <EditableField 
            {...getEditableFieldProps('description')}
            label="Bio" 
            value={form.description} 
            placeholder="Tell customers about your dealership"
            multiline
          />
          <EditableField 
            {...getEditableFieldProps('website')}
            label="Website" 
            value={form.website} 
            placeholder="https://example.com"
            type="url"
          />
        </div>
      </section>

      {/* Details */}
      <section className="mb-6 sm:mb-8">
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Details</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <EditableField 
            {...getEditableFieldProps('experienceYears')}
            label="Years of experience" 
            value={form.experienceYears} 
            placeholder="0"
            type="number"
          />
          <EditableField 
            {...getEditableFieldProps('foundedYear')}
            label="Founded" 
            value={form.foundedYear} 
            placeholder={new Date().getFullYear().toString()}
            type="number"
          />
        </div>
      </section>

      {/* Specialties */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Specialties</h3>
          <span className="text-sm font-semibold text-muted-foreground/70">{form.specialties.length}/4</span>
        </div>
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {form.specialties.length > 0 ? form.specialties.map((specialty) => (
              <span 
                key={specialty} 
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-muted/30 text-xs sm:text-sm font-semibold border border-border/40"
              >
                {specialty}
                <button
                  onClick={() => removeSpecialty(specialty)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )) : (
              <p className="text-sm text-muted-foreground/60">No specialties added</p>
            )}
          </div>
          
          {form.specialties.length < 4 && (
            <div className="flex gap-2 pt-2 border-t border-border/20">
              <input
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
                placeholder="Add specialty..."
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
              />
              {customSpecialty.trim() && (
                <button
                  onClick={addSpecialty}
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                >
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Google Reviews */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Google Reviews</h3>
          {form.googleReviewUrl?.trim() && (
            <button onClick={syncReviews} className="text-xs text-blue-500 hover:text-blue-600 font-semibold">
              Sync
            </button>
          )}
        </div>
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <EditableField 
            {...getEditableFieldProps('googleReviewUrl')}
            label="Google Maps URL" 
            value={form.googleReviewUrl} 
            placeholder="https://maps.google.com/?cid=..."
            type="url"
          />
          
          {profile.googleRating && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-4 mt-2 border-t border-border/20">
              <div>
                <p className="text-lg font-semibold flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {profile.googleRating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground/70">{profile.googleReviewCount ?? 0} reviews</p>
              </div>
              {profile.googleReviewsSyncedAt && (
                <div>
                  <p className="text-sm font-semibold">
                    {new Date(profile.googleReviewsSyncedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground/70">Last synced</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Location */}
      <section className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Location</h3>
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="text-xs text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1"
          >
            {isLoadingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
            Detect
          </button>
        </div>

        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <EditableField 
              {...getEditableFieldProps('city')}
              label="City" 
              value={form.city} 
              placeholder="Dubai"
            />
            <EditableField 
              {...getEditableFieldProps('emirate')}
              label="Emirate" 
              value={form.emirate} 
              placeholder="Dubai"
            />
          </div>

          <div className="rounded-xl overflow-hidden bg-muted/30 h-40 sm:h-48 border border-border/40">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
              </div>
            }>
              <LocationMap 
                latitude={form.lat ?? undefined} 
                longitude={form.lng ?? undefined} 
                onLocationSelect={handleLocationSelect} 
              />
            </Suspense>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-3">Tap map to pin location</p>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-6 sm:mb-8">
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Badges</h3>
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          {profile.badges && profile.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {profile.badges.map((badge, i) => (
                <span 
                  key={i} 
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-muted/30 text-foreground text-xs sm:text-sm font-semibold border border-border/40"
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
    </div>
  );
}
