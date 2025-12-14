/**
 * Profile View - Alifh Design System
 * Following "Less is More" principle with Apple-inspired minimalism
 * Adheres to Alifh Design Philosophy document
 */

'use client';

import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/profile';
import { useToast } from '@/hooks/use-toast';
import type { ProfileUpdateInput } from '@/lib/profile';
import { User, Edit3, AlertCircle, CheckCircle2, ShieldCheck, Camera, X } from 'lucide-react';
import { Avatar } from '@/components/ui/data-display/avatar';
import { KycVerificationModal } from './kyc-verification-modal';

const LocationMap = lazy(() => 
  import('./location-map').then(mod => ({ default: mod.LocationMap }))
);

interface ProfileViewProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function ProfileView({ userName, userEmail }: ProfileViewProps) {
  const router = useRouter();
  const { profile, isUpdating, error, updateProfile } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [emirate, setEmirate] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(25.2048); // Dubai default
  const [longitude, setLongitude] = useState<number | undefined>(55.2708); // Dubai default
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [consignmentMode, setConsignmentMode] = useState(false);
  const [showPhone, setShowPhone] = useState(true);
  
  // Section-wise editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  // Available tags for user selection
  const availableTags = [
    'Non-smoker',
    'Fast Responder',
    'Verified Dealer',
    'Luxury Specialist',
    'Sports Cars',
    'SUV Expert',
    'Electric Vehicles',
    'Classic Cars',
    'Negotiable',
    'Trade-ins Welcome'
  ];

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setPhone(profile.phone ?? '');
      setBio(profile.description ?? '');
      setCity(profile.locationCity ?? '');
      setEmirate(profile.locationEmirate ?? '');
      setLatitude(profile.locationLat ?? 25.2048);
      setLongitude(profile.locationLng ?? 55.2708);
      setSelectedTags(profile.tags ?? []);
      setConsignmentMode(profile.consignmentMode ?? false);
      setShowPhone(profile.privacySettings?.showPhone ?? true);
    }
  }, [profile]);

  // Sync email from userEmail prop
  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  // Show errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const displayName = profile?.firstName && profile?.lastName 
    ? `${profile.firstName} ${profile.lastName}`
    : userName ?? 'User';

  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLocationSelect = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    
    // Reverse geocode to get city and emirate
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Extract city (could be in city, town, or village)
        const cityName = data.address.city || data.address.town || data.address.village || '';
        if (cityName) {
          setCity(cityName);
        }
        
        // Extract emirate (in UAE it's usually in state)
        const stateName = data.address.state || '';
        if (stateName) {
          setEmirate(stateName);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Don't show error to user, just skip auto-fill
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast({
        title: 'Maximum tags reached',
        description: 'You can only select up to 3 tags',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSection = async (section: string) => {
    setIsSaving(true);
    try {
      let payload: ProfileUpdateInput = {};

      switch (section) {
        case 'personal':
          payload = {
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
            phone: phone.trim() || undefined,
          };
          break;
        case 'bio':
          payload = {
            description: bio.trim() || undefined,
          };
          break;
        case 'tags':
          payload = {
            tags: selectedTags,
          };
          break;
        case 'location':
          payload = {
            locationCity: city.trim() || undefined,
            locationEmirate: emirate.trim() || undefined,
            locationLat: latitude,
            locationLng: longitude,
          };
          break;
        case 'settings':
          payload = {
            consignmentMode: consignmentMode,
            privacySettings: {
              showEmail: profile?.privacySettings?.showEmail ?? false,
              showPhone: showPhone,
            },
          };
          break;
      }

      const result = await updateProfile(payload);
      if (result) {
        setEditingSection(null);
        toast({
          title: 'Saved',
          description: 'Your changes have been saved.',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save changes.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSection = (section: string) => {
    // Reset to profile values for this section
    if (profile) {
      switch (section) {
        case 'personal':
          setFirstName(profile.firstName ?? '');
          setLastName(profile.lastName ?? '');
          setPhone(profile.phone ?? '');
          if (userEmail) setEmail(userEmail);
          break;
        case 'bio':
          setBio(profile.description ?? '');
          break;
        case 'tags':
          setSelectedTags(profile.tags ?? []);
          break;
        case 'location':
          setCity(profile.locationCity ?? '');
          setEmirate(profile.locationEmirate ?? '');
          setLatitude(profile.locationLat ?? 25.2048);
          setLongitude(profile.locationLng ?? 55.2708);
          break;
        case 'settings':
          setConsignmentMode(profile.consignmentMode ?? false);
          setShowPhone(profile.privacySettings?.showPhone ?? true);
          break;
      }
    }
    setEditingSection(null);
  };

  const handleAvatarClick = () => {
    if (!avatarUploading && !isUpdating) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    try {
      const result = await updateProfile({ avatar: null });
      if (result) {
        toast({
          title: 'Photo removed',
          description: 'Your profile photo has been removed.',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to remove photo',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
      setShowRemoveConfirm(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, HEIC, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', 'avatars');
      formData.append('fileName', file.name);
      formData.append('contentType', file.type);

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const payload = await response.json();
      if (!response.ok || !payload.key) {
        throw new Error(payload.error || 'Upload failed');
      }

      const result = await updateProfile({ avatar: payload.key });
      if (result) {
        toast({
          title: 'Photo updated',
          description: 'Your profile photo has been changed.',
        });
      }
    } catch (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError instanceof Error ? uploadError.message : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-6xl mx-auto px-8 py-12 space-y-12">
        {/* Header with Avatar */}
        <div className="flex items-start gap-8">
          {/* Name, Verification & Stats */}
          <div className="flex-1 min-w-0 pt-3 space-y-4">
            {/* Name with KYC Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-medium text-foreground">
                  {displayName}
                </h1>
                {profile?.kycVerified ? (
                  <div className="relative inline-flex items-center justify-center w-5 h-5" title="Verified Account">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <circle cx="12" cy="12" r="10" className="text-primary" />
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                ) : (
                  <div className="relative inline-flex items-center justify-center w-4 h-4" title="Not Verified">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <circle cx="12" cy="12" r="10" className="text-muted-foreground/40" />
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
              {!profile?.kycVerified && (
                <button
                  onClick={() => setShowKycModal(true)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Request verification
                </button>
              )}
            </div>

            {/* Admin Badges */}
            <div>
              {profile?.badges && profile.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge: string, idx: number) => (
                    <div key={idx} className="px-3 py-1.5 bg-foreground text-background text-xs font-medium">
                      {badge}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No badges assigned yet</p>
              )}
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-border/60">
              <div>
                <p className="text-xs text-muted-foreground">Listings</p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.inventoryCount ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sold</p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.carsSold ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.memberSince ? new Date(profile.memberSince).getFullYear() : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Active'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profile created</p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Circular Avatar on the right */}
          <div className="group relative flex-shrink-0">
            <button
              onClick={handleAvatarClick}
              disabled={avatarUploading || isUpdating}
              className="relative block"
            >
              <Avatar
                src={profile?.avatarUrl}
                initials={initials}
                size="xl"
                className="border-2 border-border"
              />
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </button>
            
            {/* Hover Actions - Bottom Right */}
            {!avatarUploading && !isUpdating && (
              <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <button
                  onClick={handleAvatarClick}
                  className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                  title="Change photo"
                >
                  <Camera className="w-3.5 h-3.5 text-foreground" />
                </button>
                {profile?.avatarUrl && (
                  <button
                    onClick={() => setShowRemoveConfirm(true)}
                    className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5 text-foreground" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Remove Avatar Confirmation */}
        {showRemoveConfirm && (
          <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
            <p className="text-sm text-foreground mb-3">Remove profile photo?</p>
            <div className="flex gap-2">
              <button
                onClick={handleRemoveAvatar}
                disabled={avatarUploading}
                className="h-8 px-4 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Remove
              </button>
              <button
                onClick={() => setShowRemoveConfirm(false)}
                disabled={avatarUploading}
                className="h-8 px-4 text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-muted/20 border border-border/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your changes have been saved successfully.
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Personal Information Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground">Personal Information</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update your personal details
              </p>
            </div>
            {editingSection !== 'personal' && (
              <button
                onClick={() => setEditingSection('personal')}
                className="h-8 px-3 text-xs font-medium text-foreground border border-border/40 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  First name
                </label>
                {editingSection === 'personal' ? (
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                ) : (
                  <p className="h-10 px-3 flex items-center text-sm text-foreground">
                    {firstName || '—'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Last name
                </label>
                {editingSection === 'personal' ? (
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                ) : (
                  <p className="h-10 px-3 flex items-center text-sm text-foreground">
                    {lastName || '—'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs text-muted-foreground">
                Email
              </label>
              {editingSection === 'personal' ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              ) : (
                <p className="h-10 px-3 flex items-center text-sm text-foreground">
                  {email || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs text-muted-foreground">
                Phone number
              </label>
              {editingSection === 'personal' ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              ) : (
                <p className="h-10 px-3 flex items-center text-sm text-foreground">
                  {phone || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Save/Cancel buttons for Personal Info */}
          {editingSection === 'personal' && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => handleCancelSection('personal')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium border border-border/40 text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('personal')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Bio Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground">Bio</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tell others about yourself
              </p>
            </div>
            {editingSection !== 'bio' && (
              <button
                onClick={() => setEditingSection('bio')}
                className="h-8 px-3 text-xs font-medium text-foreground border border-border/40 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Bio
              </label>
              {editingSection === 'bio' ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                />
              ) : (
                <p className="px-3 py-2 text-sm text-foreground leading-relaxed">
                  {bio || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Save/Cancel buttons for Bio */}
          {editingSection === 'bio' && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => handleCancelSection('bio')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium border border-border/40 text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('bio')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Tags Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground">Profile Tags</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tell others about yourself in the car marketplace
              </p>
            </div>
            {editingSection !== 'tags' && (
              <button
                onClick={() => setEditingSection('tags')}
                className="h-8 px-3 text-xs font-medium text-foreground border border-border/40 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* User Tags */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">
                  Profile Tags {editingSection === 'tags' && <span className="text-muted-foreground/60">(Select up to 3)</span>}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose tags that describe you
                </p>
              </div>
              
              {editingSection === 'tags' ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                      <div key={tag} className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-medium">
                        {tag}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No tags selected</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save/Cancel buttons for Tags */}
          {editingSection === 'tags' && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => handleCancelSection('tags')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium border border-border/40 text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('tags')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Location Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground">Location</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {editingSection === 'location' ? 'Click on the map to set your location' : 'Your current location'}
              </p>
            </div>
            {editingSection !== 'location' && (
              <button
                onClick={() => setEditingSection('location')}
                className="h-8 px-3 text-xs font-medium text-foreground border border-border/40 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                City
              </label>
              {editingSection === 'location' ? (
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dubai"
                  className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              ) : (
                <p className="h-10 px-3 flex items-center text-sm text-foreground">
                  {city || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Emirate
              </label>
              {editingSection === 'location' ? (
                <input
                  type="text"
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value)}
                  placeholder="Dubai"
                  className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              ) : (
                <p className="h-10 px-3 flex items-center text-sm text-foreground">
                  {emirate || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Map Component - Always visible */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">
                {editingSection === 'location' ? 'Pin your location on map' : 'Your location'}
              </label>
              {editingSection === 'location' && (
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      toast({
                        title: 'Getting location...',
                        description: 'Please allow location access',
                      });
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          handleLocationSelect(
                            position.coords.latitude,
                            position.coords.longitude
                          );
                          toast({
                            title: 'Location fetched',
                            description: 'Your current location has been set',
                          });
                        },
                        (error) => {
                          toast({
                            title: 'Location error',
                            description: 'Could not fetch your location. Please set it manually.',
                            variant: 'destructive',
                          });
                        }
                      );
                    }
                  }}
                  className="h-8 px-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Use current location
                </button>
              )}
            </div>
            <Suspense
              fallback={
                <div className="h-96 bg-muted/20 border border-border/40 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              }
            >
              <LocationMap
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={editingSection === 'location' ? handleLocationSelect : undefined}
              />
            </Suspense>
            {editingSection === 'location' && (
              <div className="bg-muted/20 border border-border/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click anywhere on the map to set your precise location, or use the button above to auto-fetch your current location.
                </p>
              </div>
            )}
            {latitude && longitude && (
              <p className="text-xs text-muted-foreground">
                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>

          {/* Save/Cancel buttons for Location */}
          {editingSection === 'location' && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => handleCancelSection('location')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium border border-border/40 text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('location')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Settings Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground">Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account preferences
              </p>
            </div>
            {editingSection !== 'settings' && (
              <button
                onClick={() => setEditingSection('settings')}
                className="h-8 px-3 text-xs font-medium text-foreground border border-border/40 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Consignment Mode */}
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Consignment Mode
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable to list vehicles on consignment
                </p>
              </div>
              {editingSection === 'settings' ? (
                <button
                  onClick={() => setConsignmentMode(!consignmentMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consignmentMode ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consignmentMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {consignmentMode ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="flex items-center justify-between py-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Show Phone Number
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Display your phone number on your public profile
                </p>
              </div>
              {editingSection === 'settings' ? (
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showPhone ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showPhone ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {showPhone ? 'Visible' : 'Hidden'}
                </span>
              )}
            </div>
          </div>

          {/* Save/Cancel buttons for Settings */}
          {editingSection === 'settings' && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => handleCancelSection('settings')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium border border-border/40 text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('settings')}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />
      </div>

      {/* KYC Verification Modal */}
      <KycVerificationModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        onSubmit={() => {
          toast({
            title: 'Verification submitted',
            description: 'Your documents have been submitted for review.',
          });
        }}
      />
    </div>
  );
}
