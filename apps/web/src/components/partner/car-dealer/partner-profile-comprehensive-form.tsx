/**
 * Partner Profile Comprehensive Form
 * 
 * Advanced settings ONLY (not covered in Basic Profile).
 * Use Basic Profile for: brand, logo, hero, location, description, specialties
 * 
 * This form handles:
 * 1. Advanced Media (cover image, gallery, video)
 * 2. Services & Features (delivery, financing, trade-in, etc.)
 * 3. Business Hours
 * 4. Notification Preferences
 * 
 * Following Alifh Design System
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, X, Plus, Play, Clock, Bell, MapPin, Building2, 
  Globe, Phone, Mail, Calendar, Award, Settings, ChevronDown,
  Check, Upload, Trash2
} from 'lucide-react';
import { BrandAvatar } from './ui/brand-avatar';

// ============================================================================
// Types
// ============================================================================

interface PartnerFeatures {
  homeDelivery: boolean;
  testDriveAvailable: boolean;
  financing: boolean;
  tradeIn: boolean;
  warranty: boolean;
  insurance: boolean;
  registration: boolean;
  exportAssistance: boolean;
}

interface BusinessHours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

interface NotificationPreferences {
  emailNewLead: boolean;
  emailBooking: boolean;
  emailMessage: boolean;
  emailSale: boolean;
  emailReview: boolean;
  emailMarketing: boolean;
  smsNewLead: boolean;
  smsBooking: boolean;
}

interface PartnerProfileData {
  id: string;
  companyNameLegal: string;
  brandName: string;
  tradeLicense: string;
  vatNumber: string | null;
  status: string;
  tier: string;
  partnerType: string;
  isVerified: boolean;
  email: string;
  phone: string;
  website: string | null;
  address: string | null;
  emirate: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  showroomCount: number;
  logo: string | null;
  heroImage: string | null;
  coverImage: string | null;
  galleryImages: string[];
  showroomVideoUrl: string | null;
  showroomVideoThumbnail: string | null;
  description: string | null;
  specialties: string[];
  experienceYears: number | null;
  foundedYear: number | null;
  googleReviewUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number;
  platformRating: number | null;
  platformReviewCount: number;
  badges: string[];
  tags: string[];
  features: PartnerFeatures;
  businessHours: BusinessHours;
  notificationPreferences: NotificationPreferences;
}

interface PartnerProfileComprehensiveFormProps {
  partnerId?: string; // If provided, fetch by partnerId, otherwise fetch by session user
}

// ============================================================================
// Constants
// ============================================================================

const SPECIALTIES = [
  'Luxury Vehicles', 'Sports Cars', 'SUVs', 'Electric Vehicles',
  'Classic Cars', 'Motorcycles', 'Commercial Vehicles', 'Budget-Friendly',
  'Import Specialist', 'Certified Pre-Owned', 'Exotic Cars', 'Family Cars'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '', close: '', closed: true },
  saturday: { open: '09:00', close: '18:00' },
  sunday: { open: '09:00', close: '18:00' },
};

const FEATURE_LABELS: Record<keyof PartnerFeatures, { label: string; description: string }> = {
  homeDelivery: { label: 'Home Delivery', description: 'Deliver vehicles to customer locations' },
  testDriveAvailable: { label: 'Test Drive', description: 'Offer test drives to customers' },
  financing: { label: 'Financing', description: 'Provide financing options' },
  tradeIn: { label: 'Trade-In', description: 'Accept vehicle trade-ins' },
  warranty: { label: 'Warranty', description: 'Offer warranty packages' },
  insurance: { label: 'Insurance', description: 'Help with insurance arrangements' },
  registration: { label: 'Registration', description: 'Handle vehicle registration' },
  exportAssistance: { label: 'Export Assistance', description: 'Help with vehicle exports' },
};

// ============================================================================
// Helper Functions
// ============================================================================

// Convert storage key to public URL
const getImageUrl = (keyOrUrl: string | null): string | null => {
  if (!keyOrUrl) return null;
  // If already a full URL, return as is
  if (keyOrUrl.startsWith('http')) return keyOrUrl;
  // Otherwise construct R2 URL from key
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-c7f8f6f7c2c74c0ca7b8e8c0d0a0b0c0.r2.dev';
  return `${R2_PUBLIC_URL}/${keyOrUrl}`;
};

// ============================================================================
// Main Component
// ============================================================================

export function PartnerProfileComprehensiveForm({ partnerId }: PartnerProfileComprehensiveFormProps) {
  const { toast } = useToast();
  
  // State
  const [profile, setProfile] = useState<PartnerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('media'); // Start with media
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state - mirrors profile but editable
  const [form, setForm] = useState<Partial<PartnerProfileData>>({});
  
  // Fetch profile - runs once on mount only
  useEffect(() => {
    let cancelled = false;
    
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Always use comprehensive profile endpoint for the dashboard form
        const url = '/api/partner/profile';
        
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        if (cancelled) return;
        
        const profileData = data.profile || data;
        setProfile(profileData);
        setForm(profileData);
      } catch (err) {
        if (!cancelled) {
          toast({ title: 'Failed to load profile', variant: 'destructive' });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfile();
    
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update form field
  const updateField = <K extends keyof PartnerProfileData>(key: K, value: PartnerProfileData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setHasChanges(true);
  };
  
  // Save changes
  const saveChanges = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/partner/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Advanced Media Only
          coverImage: form.coverImage,
          galleryImages: form.galleryImages,
          showroomVideoUrl: form.showroomVideoUrl,
          showroomVideoThumbnail: form.showroomVideoThumbnail,
          // Features & Services
          features: form.features,
          businessHours: form.businessHours,
          notificationPreferences: form.notificationPreferences,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      const data = await res.json();
      setProfile(data.profile);
      setForm(data.profile);
      setHasChanges(false);
      toast({ title: 'Profile saved successfully' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Upload partner logo or hero image - uses optimized endpoint with WebP conversion
  // Passes previousKey to cleanup old image and bust CDN cache
  const uploadPartnerImage = async (file: File, type: 'logo' | 'hero', previousKey?: string | null): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    fd.append('partnerId', partnerId);
    if (previousKey) {
      fd.append('previousKey', previousKey);
    }
    
    const res = await fetch('/api/storage/upload-partner-image', { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.key;
  };
  
  // Generic file upload helper for other files (gallery, videos, etc.)
  const uploadFile = async (file: File, directory: string): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('directory', directory);
    
    const res = await fetch('/api/storage/upload', { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.key;
  };
  
  // Handle image upload - logo and heroImage use optimized endpoint, others use generic
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'heroImage' | 'coverImage' | 'showroomVideoThumbnail'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)) {
      toast({ title: 'Invalid file type', variant: 'destructive' });
      return;
    }
    
    let key: string | null = null;
    
    // Use optimized endpoint for logo and heroImage (compression, WebP, smart overwrite)
    // Pass current key as previousKey for cleanup and CDN cache busting
    if (field === 'logo' || field === 'heroImage') {
      const previousKey = form[field];
      key = await uploadPartnerImage(file, field === 'heroImage' ? 'hero' : 'logo', previousKey);
    } else {
      // Use generic upload for other images
      key = await uploadFile(file, `partner-${field}s`);
    }
    
    if (key) {
      updateField(field, key);
      toast({ title: 'Image uploaded & optimized' });
    } else {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
  };
  
  // Handle gallery image add
  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = '';
    if (!files?.length) return;
    
    const currentGallery = form.galleryImages || [];
    if (currentGallery.length + files.length > 10) {
      toast({ title: 'Maximum 10 gallery images', variant: 'destructive' });
      return;
    }
    
    for (const file of Array.from(files)) {
      const key = await uploadFile(file, 'partner-gallery');
      if (key) {
        updateField('galleryImages', [...(form.galleryImages || []), key]);
      }
    }
    toast({ title: 'Gallery updated' });
  };
  
  // Handle gallery image remove
  const handleGalleryRemove = (index: number) => {
    const newGallery = [...(form.galleryImages || [])];
    newGallery.splice(index, 1);
    updateField('galleryImages', newGallery);
  };
  
  // Toggle feature
  const toggleFeature = (key: keyof PartnerFeatures) => {
    updateField('features', {
      ...form.features!,
      [key]: !form.features?.[key],
    });
  };
  
  // Update business hours
  const updateBusinessHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const currentHours = form.businessHours || DEFAULT_BUSINESS_HOURS;
    updateField('businessHours', {
      ...currentHours,
      [day]: { ...currentHours[day], [field]: value },
    });
  };
  
  // Toggle notification
  const toggleNotification = (key: keyof NotificationPreferences) => {
    updateField('notificationPreferences', {
      ...form.notificationPreferences!,
      [key]: !form.notificationPreferences?.[key],
    });
  };
  
  // Toggle specialty
  const toggleSpecialty = (specialty: string) => {
    const current = form.specialties || [];
    if (current.includes(specialty)) {
      updateField('specialties', current.filter(s => s !== specialty));
    } else if (current.length < 6) {
      updateField('specialties', [...current, specialty]);
    } else {
      toast({ title: 'Maximum 6 specialties', variant: 'destructive' });
    }
  };
  
  // Loading state
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
        <p className="text-muted-foreground">Failed to load partner profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-border/40">
          <div>
            <h1 className="text-2xl font-semibold">Advanced Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure advanced features, media gallery, hours, and notifications
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              For basic info edits, visit <a href="/partner-dashboard/basic" className="text-primary hover:underline">Basic Profile</a>
            </p>
          </div>
          <button
            onClick={saveChanges}
            disabled={!hasChanges || isSaving}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </header>
        
        {/* Navigation Tabs */}
        <nav className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'media', label: 'Advanced Media', icon: Camera },
            { id: 'services', label: 'Services & Features', icon: Award },
            { id: 'hours', label: 'Business Hours', icon: Clock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeSection === tab.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        
        {/* ================================================================ */}
        {/* ADVANCED MEDIA SECTION */}
        {/* ================================================================ */}
        {activeSection === 'media' && (
          <div className="space-y-8">
            {/* Cover Image */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Cover Image</h2>
              <div className="relative aspect-[3/1] bg-muted/30 rounded-lg overflow-hidden border border-border/40">
                {form.coverImage ? (
                  <img
                    src={getImageUrl(form.coverImage) || ''}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">No cover image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="cover-upload"
                  onChange={e => handleImageUpload(e, 'coverImage')}
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <label
                    htmlFor="cover-upload"
                    className="h-8 px-3 bg-background/90 backdrop-blur border border-border/40 rounded-lg flex items-center gap-2 text-xs font-medium cursor-pointer hover:bg-background transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </label>
                  {form.coverImage && (
                    <button
                      onClick={() => updateField('coverImage', null)}
                      className="h-8 w-8 bg-background/90 backdrop-blur border border-border/40 rounded-lg flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended size: 1920x640px. Cover image for your showroom page.
              </p>
            </section>
            
            {/* Showroom Video */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Showroom Video
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Video URL (YouTube or Vimeo)</label>
                  <input
                    value={form.showroomVideoUrl || ''}
                    onChange={e => updateField('showroomVideoUrl', e.target.value || null)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-10 px-3 mt-1.5 bg-background border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {form.showroomVideoUrl && (
                  <div>
                    <label className="text-xs text-muted-foreground">Video Thumbnail (optional)</label>
                    <div className="relative aspect-video bg-muted/30 rounded-lg overflow-hidden border border-border/40 mt-1.5">
                      {form.showroomVideoThumbnail ? (
                        <img
                          src={getImageUrl(form.showroomVideoThumbnail) || ''}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Play className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="thumb-upload"
                        onChange={e => handleImageUpload(e, 'showroomVideoThumbnail')}
                      />
                      <label
                        htmlFor="thumb-upload"
                        className="absolute bottom-3 right-3 h-8 px-3 bg-background/90 backdrop-blur border border-border/40 rounded-lg flex items-center gap-2 text-xs font-medium cursor-pointer hover:bg-background transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Custom Thumbnail
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </section>
            
            {/* Gallery */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">
                Gallery Images <span className="font-normal">({(form.galleryImages?.length || 0)}/10)</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {form.galleryImages?.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-muted/30 rounded-lg overflow-hidden border border-border/40 group">
                    <img
                      src={getImageUrl(img) || ''}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleGalleryRemove(i)}
                      className="absolute top-2 right-2 h-6 w-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {(form.galleryImages?.length || 0) < 10 && (
                  <label className="aspect-square bg-muted/20 border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryAdd}
                    />
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add Photos</span>
                  </label>
                )}
              </div>
            </section>
          </div>
        )}
        
        {/* ================================================================ */}
        {/* SERVICES & FEATURES SECTION */}
        {/* ================================================================ */}
        {activeSection === 'services' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Services You Offer</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Select all services available at your showroom
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {(Object.keys(FEATURE_LABELS) as (keyof PartnerFeatures)[]).map(key => (
                  <button
                    key={key}
                    onClick={() => toggleFeature(key)}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      form.features?.[key]
                        ? 'bg-primary/5 border-primary/30'
                        : 'border-border/40 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                        form.features?.[key] ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {form.features?.[key] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{FEATURE_LABELS[key].label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {FEATURE_LABELS[key].description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
        
        {/* ================================================================ */}
        {/* BUSINESS HOURS SECTION */}
        {/* ================================================================ */}
        {activeSection === 'hours' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Business Hours</h2>
              <div className="space-y-3">
                {DAYS.map(day => {
                  const hours = form.businessHours?.[day] || DEFAULT_BUSINESS_HOURS[day];
                  const isClosed = hours.closed;
                  
                  return (
                    <div key={day} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                      <span className="w-24 text-sm font-medium capitalize">{day}</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!isClosed}
                          onChange={e => updateBusinessHours(day, 'closed', !e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors relative ${
                          !isClosed ? 'bg-primary' : 'bg-muted'
                        }`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            !isClosed ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isClosed ? 'Closed' : 'Open'}
                        </span>
                      </label>
                      {!isClosed && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={e => updateBusinessHours(day, 'open', e.target.value)}
                            className="h-8 px-2 bg-background border border-border/40 rounded text-xs"
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={e => updateBusinessHours(day, 'close', e.target.value)}
                            className="h-8 px-2 bg-background border border-border/40 rounded text-xs"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
        
        {/* ================================================================ */}
        {/* NOTIFICATIONS SECTION */}
        {/* ================================================================ */}
        {activeSection === 'notifications' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Email Notifications</h2>
              <div className="space-y-3">
                {[
                  { key: 'emailNewLead' as const, label: 'New Lead', desc: 'When a customer shows interest' },
                  { key: 'emailBooking' as const, label: 'Bookings', desc: 'Test drive and appointment bookings' },
                  { key: 'emailMessage' as const, label: 'Messages', desc: 'Customer inquiries and messages' },
                  { key: 'emailSale' as const, label: 'Sales', desc: 'When a sale is completed' },
                  { key: 'emailReview' as const, label: 'Reviews', desc: 'New customer reviews' },
                  { key: 'emailMarketing' as const, label: 'Marketing', desc: 'Platform updates and promotions' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        form.notificationPreferences?.[item.key] ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form.notificationPreferences?.[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
            
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">SMS Notifications</h2>
              <div className="space-y-3">
                {[
                  { key: 'smsNewLead' as const, label: 'New Lead SMS', desc: 'Get SMS for new leads' },
                  { key: 'smsBooking' as const, label: 'Booking SMS', desc: 'Get SMS for bookings' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        form.notificationPreferences?.[item.key] ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form.notificationPreferences?.[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        
        {/* Floating Save Button (mobile) */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="h-12 px-8 bg-primary text-primary-foreground rounded-full font-medium shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
