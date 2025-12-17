/**
 * Profile View - Unified Optimized Version
 * Single component with 2-column layout for maximum performance
 * Zero redundancy, minimal re-renders
 */

'use client';

import { useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useUserProfile, type UserProfileUpdate } from '@/hooks/profile/user-profile-hook';
import { useToast } from '@/hooks/use-toast';
import { Camera, X, Edit3 } from 'lucide-react';
import { Avatar } from '@/components/ui/data-display/avatar';

// Lazy load heavy components
const LocationMap = lazy(() => 
  import('./sections/location-map').then(mod => ({ default: mod.LocationMap }))
);
const KycVerificationModal = lazy(() => 
  import('./modals/kyc-verification-modal').then(mod => ({ default: mod.KycVerificationModal }))
);
const EmailVerificationModal = lazy(() => 
  import('./modals/email-verification-modal').then(mod => ({ default: mod.EmailVerificationModal }))
);
const PhoneVerificationModal = lazy(() => 
  import('./modals/phone-verification-modal').then(mod => ({ default: mod.PhoneVerificationModal }))
);

interface ProfileViewProps {
  userName?: string | null;
  userEmail?: string | null;
}

const AVAILABLE_TAGS = [
  'Non-smoker', 'Fast Responder', 'Verified Dealer', 'Luxury Specialist',
  'Sports Cars', 'SUV Expert', 'Electric Vehicles', 'Classic Cars',
  'Negotiable', 'Trade-ins Welcome'
];

// Field component - defined outside to prevent recreation
function Field({ label, value, onChange, type = 'text', editing: isEditing, verified, onVerify }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <div className="flex items-center gap-2">
          <p className="h-10 px-3 flex items-center text-sm text-foreground flex-1">{value || '—'}</p>
          {verified !== undefined && (
            verified ? (
              <div className="flex items-center gap-1 text-xs text-primary">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span>Verified</span>
              </div>
            ) : onVerify ? (
              <button onClick={onVerify} className="text-xs text-primary hover:text-primary/80 underline">Verify</button>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

// TextArea component - defined outside to prevent recreation
function TextArea({ label, value, onChange, editing: isEditing }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      ) : (
        <p className="px-3 py-2 text-sm text-foreground leading-relaxed">{value || '—'}</p>
      )}
    </div>
  );
}

export function ProfileView({ userName, userEmail }: ProfileViewProps) {
  const { profile, isUpdating, error, updateProfile, refresh } = useUserProfile({ fetchOnMount: true });
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: userEmail ?? '', phone: '', bio: '',
    city: '', emirate: '', latitude: 25.2048, longitude: 55.2708,
    tags: [] as string[], consignmentMode: true, showPhone: true
  });
  
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<'kyc' | 'email' | 'phone' | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (profile && !formInitialized) {
      setFormData({
        firstName: profile.firstName ?? '', lastName: profile.lastName ?? '',
        email: userEmail ?? '', phone: profile.phone ?? '', bio: profile.description ?? '',
        city: profile.locationCity ?? '', emirate: profile.locationEmirate ?? '',
        latitude: profile.locationLat ?? 25.2048, longitude: profile.locationLng ?? 55.2708,
        tags: profile.tags ?? [], consignmentMode: profile.consignmentMode ?? true,
        showPhone: profile.privacySettings?.showPhone ?? true
      });
      setFormInitialized(true);
    }
  }, [profile, userEmail, formInitialized]);

  useEffect(() => {
    if (error) toast({ title: 'Error', description: error, variant: 'destructive' });
  }, [error, toast]);

  const displayName = useMemo(() => 
    profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : userName ?? 'User',
    [profile?.firstName, profile?.lastName, userName]
  );

  const initials = useMemo(() => {
    if (profile?.firstName && profile?.lastName) return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    if (userName) return userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return 'U';
  }, [profile?.firstName, profile?.lastName, userName]);

  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const data = await res.json();
      if (data?.address) {
        setFormData(prev => ({
          ...prev,
          city: data.address.city || data.address.town || data.address.village || prev.city,
          emirate: data.address.state || prev.emirate
        }));
      }
    } catch (e) { console.error('Geocoding failed:', e); }
  }, []);

  const save = useCallback(async (section: string) => {
    setSaving(true);
    const payload: Record<string, UserProfileUpdate> = {
      profile: { firstName: formData.firstName.trim() || undefined, lastName: formData.lastName.trim() || undefined, phone: formData.phone.trim() || undefined, description: formData.bio.trim() || undefined, tags: formData.tags },
      location: { locationCity: formData.city.trim() || undefined, locationEmirate: formData.emirate.trim() || undefined, locationLat: formData.latitude, locationLng: formData.longitude },
      settings: { consignmentMode: formData.consignmentMode, privacySettings: { showPhone: formData.showPhone } },
    };
    try {
      const result = await updateProfile(payload[section]);
      if (result) {
        toast({ title: 'Saved', description: 'Changes saved successfully.' });
        setEditing(null);
      }
    } catch { toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' }); }
    finally { setSaving(false); }
  }, [formData, updateProfile, toast]);

  const cancel = useCallback(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName ?? '', lastName: profile.lastName ?? '',
        email: userEmail ?? '', phone: profile.phone ?? '', bio: profile.description ?? '',
        city: profile.locationCity ?? '', emirate: profile.locationEmirate ?? '',
        latitude: profile.locationLat ?? 25.2048, longitude: profile.locationLng ?? 55.2708,
        tags: profile.tags ?? [], consignmentMode: profile.consignmentMode ?? true,
        showPhone: profile.privacySettings?.showPhone ?? true
      });
    }
    setEditing(null);
  }, [profile, userEmail]);

  const uploadAvatar = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
      toast({ title: 'Invalid file', description: 'Use JPG, PNG, HEIC, or WebP.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB.', variant: 'destructive' });
      return;
    }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('directory', 'avatars');
      fd.append('fileName', file.name);
      fd.append('contentType', file.type);
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.key) throw new Error(data.error || 'Upload failed');
      await updateProfile({ avatar: data.key });
      toast({ title: 'Photo updated', description: 'Profile photo changed.' });
    } catch { toast({ title: 'Upload failed', variant: 'destructive' }); }
    finally { setAvatarUploading(false); }
  }, [updateProfile, toast]);

  const removeAvatar = useCallback(async () => {
    setAvatarUploading(true);
    try {
      await updateProfile({ avatar: null });
      toast({ title: 'Photo removed' });
    } catch { toast({ title: 'Failed to remove photo', variant: 'destructive' }); }
    finally { setAvatarUploading(false); }
  }, [updateProfile, toast]);

  const deleteAccount = useCallback(async () => {
    if (deleteText !== 'DELETE') {
      toast({ title: 'Error', description: 'Type "DELETE" to confirm.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/profile/delete-account', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Account marked for deletion', description: `Deleted after 6 months (${new Date(data.deletionDate).toLocaleDateString()}).` });
        setTimeout(() => window.location.href = '/', 2000);
      } else throw new Error(data.error || 'Failed');
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  }, [deleteText, toast]);

  // Section renderer - inline to avoid recreation issues
  const renderSection = (id: string, title: string, desc: string, children: React.ReactNode, showEdit = true) => {
    const isEditing = editing === id;
    return (
      <div key={id} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
          {showEdit && !isEditing && (
            <button onClick={() => setEditing(id)} className="h-8 px-3 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted/50 flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5" />Edit
            </button>
          )}
        </div>
        <div className="space-y-6">{children}</div>
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={cancel} disabled={saving} className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50">Cancel</button>
            <button onClick={() => save(id)} disabled={saving} className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          {/* Name, KYC Badge, and Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
              <div className={`w-5 h-5 ${profile?.kycVerified ? 'text-primary' : 'text-muted-foreground/40'}`} title={profile?.kycVerified ? 'Verified' : 'Not Verified'}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              {!profile?.kycVerified && (
                <button onClick={() => setModal('kyc')} className="ml-1 text-xs text-primary hover:text-primary/80">Request verification</button>
              )}
            </div>
            {profile?.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge, i) => (
                  <div key={i} className="px-3 py-1.5 bg-foreground text-background text-xs font-medium">{badge}</div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar - Right Side */}
          <div className="group relative flex-shrink-0">
            <input ref={setFileInputRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            <div className="relative">
              <Avatar src={profile?.avatarUrl} initials={initials} size="xl" className="border-2 border-border" />
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
            {!avatarUploading && !isUpdating && (
              <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                <button onClick={() => fileInputRef?.click()} className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted shadow-sm" title="Change photo">
                  <Camera className="w-3.5 h-3.5" />
                </button>
                {profile?.avatarUrl && (
                  <button onClick={removeAvatar} className="h-7 w-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground shadow-sm" title="Remove photo">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-12 pb-6 border-b border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Listings</p>
            <p className="text-xl font-semibold tracking-tight">{profile?.inventoryCount || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Rating</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xl font-semibold tracking-tight">{profile?.rating ? profile.rating.toFixed(1) : '—'}</p>
              {profile?.rating && (
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-500 fill-current">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Response Time</p>
            <p className="text-xl font-semibold tracking-tight">{profile?.avgResponseTime ? `${profile.avgResponseTime} min` : '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Member since</p>
            <p className="text-xl font-semibold tracking-tight">{profile?.memberSince ? new Date(profile.memberSince).getFullYear() : profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
            <p className="text-xl font-semibold tracking-tight">{profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Active'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Profile created</p>
            <p className="text-xl font-semibold tracking-tight">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
          </div>
        </div>

        {/* Profile Information */}
        {renderSection("profile", "Profile Information", "Update your personal details", (
          <>
            {/* Personal Info */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Personal Details</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="First name" value={formData.firstName} onChange={(v: string) => setFormData(p => ({ ...p, firstName: v }))} editing={editing === 'profile'} />
                <Field label="Last name" value={formData.lastName} onChange={(v: string) => setFormData(p => ({ ...p, lastName: v }))} editing={editing === 'profile'} />
              </div>
              <Field label="Email" value={formData.email} onChange={(v: string) => setFormData(p => ({ ...p, email: v }))} type="email" editing={editing === 'profile'} verified={profile?.emailVerified} onVerify={() => setModal('email')} />
              <Field label="Phone" value={formData.phone} onChange={(v: string) => setFormData(p => ({ ...p, phone: v }))} type="tel" editing={editing === 'profile'} verified={profile?.phoneVerified} onVerify={() => setModal('phone')} />
            </div>
          </>
        ))}

        {/* Bio - Separate Section */}
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Bio</h2>
              <p className="text-sm text-muted-foreground mt-1">Tell others about yourself</p>
            </div>
            {editing !== 'bio' && (
              <button onClick={() => setEditing('bio')} className="h-8 px-3 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted/50 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5" />Edit
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            <TextArea label="About you" value={formData.bio} onChange={(v: string) => setFormData(p => ({ ...p, bio: v }))} editing={editing === 'bio'} />
          </div>
          
          {editing === 'bio' && (
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={cancel} disabled={saving} className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50">Cancel</button>
              <button onClick={() => save('profile')} disabled={saving} className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          )}
        </div>

        {/* Profile Tags - Separate Section */}
        <div className="space-y-6 mt-8 pb-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Profile Tags</h2>
              <p className="text-sm text-muted-foreground mt-1">Select up to 3 tags that describe you</p>
            </div>
            {editing !== 'tags' && (
              <button onClick={() => setEditing('tags')} className="h-8 px-3 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted/50 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5" />Edit
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
              {editing === 'tags' ? (
                AVAILABLE_TAGS.map(tag => (
                  <button key={tag} onClick={() => {
                    const tags = formData.tags.includes(tag) ? formData.tags.filter(t => t !== tag) : formData.tags.length < 3 ? [...formData.tags, tag] : formData.tags;
                    if (formData.tags.length >= 3 && !formData.tags.includes(tag)) toast({ title: 'Max 3 tags', variant: 'destructive' });
                    setFormData(p => ({ ...p, tags }));
                  }} className={`px-3 py-1.5 text-xs font-medium border transition-colors ${formData.tags.includes(tag) ? 'bg-foreground text-background border-foreground' : 'bg-transparent text-foreground border-border hover:bg-muted'}`}>
                    {tag}
                  </button>
                ))
              ) : (
                formData.tags.length > 0 ? formData.tags.map(tag => (
                  <div key={tag} className="px-3 py-1.5 border border-border bg-transparent text-xs font-medium">{tag}</div>
                )) : (
                  <p className="text-sm text-muted-foreground py-2">No tags selected</p>
                )
              )}
            </div>
          </div>
          
          {editing === 'tags' && (
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={cancel} disabled={saving} className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50">Cancel</button>
              <button onClick={() => save('profile')} disabled={saving} className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          )}
        </div>

        {/* Location and Settings - Separated Row */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Location */}
          {renderSection("location", "Location", editing === 'location' ? 'Click map to set location' : 'Your location', (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="City" value={formData.city} onChange={(v: string) => setFormData(p => ({ ...p, city: v }))} editing={editing === 'location'} />
                <Field label="Emirate" value={formData.emirate} onChange={(v: string) => setFormData(p => ({ ...p, emirate: v }))} editing={editing === 'location'} />
                <div className="sm:col-span-2 text-xs text-muted-foreground flex items-center">
                  {formData.latitude && formData.longitude && (
                    <span>Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</span>
                  )}
                </div>
              </div>
              <Suspense fallback={<div className="h-40 bg-muted/20 border border-border rounded-lg flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading map...</p></div>}>
                <LocationMap latitude={formData.latitude} longitude={formData.longitude} onLocationSelect={editing === 'location' ? handleLocationSelect : undefined} />
              </Suspense>
            </>
          ))}

          {/* Settings */}
          {renderSection("settings", "Settings", "Account preferences", (
              <>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div><label className="text-sm font-medium">Consignment Mode</label><p className="text-xs text-muted-foreground mt-1">List vehicles on consignment</p></div>
                  {editing === 'settings' ? (
                    <button onClick={() => setFormData(p => ({ ...p, consignmentMode: !p.consignmentMode }))} className={`relative inline-flex h-6 w-11 items-center rounded-full ${formData.consignmentMode ? 'bg-primary' : 'bg-muted'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${formData.consignmentMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  ) : <span className="text-sm text-muted-foreground">{formData.consignmentMode ? 'Enabled' : 'Disabled'}</span>}
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div><label className="text-sm font-medium">Show Phone</label><p className="text-xs text-muted-foreground mt-1">Display on public profile</p></div>
                  {editing === 'settings' ? (
                    <button onClick={() => setFormData(p => ({ ...p, showPhone: !p.showPhone }))} className={`relative inline-flex h-6 w-11 items-center rounded-full ${formData.showPhone ? 'bg-primary' : 'bg-muted'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${formData.showPhone ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  ) : <span className="text-sm text-muted-foreground">{formData.showPhone ? 'Visible' : 'Hidden'}</span>}
                </div>
                <div className="flex items-center justify-between py-3">
                  <div><label className="text-sm font-medium">Delete Account</label><p className="text-xs text-muted-foreground mt-1">Account marked for deletion, removed after 6 months</p></div>
                  <button onClick={() => setDeleteModal(true)} className="ml-6 h-9 w-9 flex items-center justify-center bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg" title="Delete Account">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} ALIFH LLC. All rights reserved. <a href="/data-policy" className="hover:text-foreground transition-colors underline">Learn more about your data policy</a>
          </p>
        </div>
      </div>

      {/* Modals */}
      {modal === 'kyc' && (
        <Suspense fallback={null}>
          <KycVerificationModal isOpen onClose={() => setModal(null)} onSubmit={() => { toast({ title: 'Verification submitted' }); setModal(null); }} />
        </Suspense>
      )}
      {modal === 'email' && (
        <Suspense fallback={null}>
          <EmailVerificationModal isOpen onClose={() => setModal(null)} emailAddress={formData.email} onVerified={() => { refresh(); setModal(null); }} />
        </Suspense>
      )}
      {modal === 'phone' && (
        <Suspense fallback={null}>
          <PhoneVerificationModal isOpen onClose={() => setModal(null)} phoneNumber={formData.phone} onVerified={() => { refresh(); setModal(null); }} />
        </Suspense>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="space-y-4">
              <div><h3 className="text-base font-semibold">Delete Account</h3><p className="text-sm text-muted-foreground mt-2">Action cannot be undone. Account deleted after 6 months.</p></div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type "DELETE" to confirm:</label>
                <input type="text" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="DELETE" className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setDeleteModal(false); setDeleteText(''); }} className="flex-1 h-9 px-4 text-sm font-medium bg-muted hover:bg-muted/80 rounded-lg border border-border">Cancel</button>
                <button onClick={deleteAccount} disabled={deleteText !== 'DELETE'} className="flex-1 h-9 px-4 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg disabled:opacity-50">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
