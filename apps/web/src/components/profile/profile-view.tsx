/**
 * Profile View - Alifh Design System
 * Following "Less is More" principle with Apple-inspired minimalism
 * Adheres to Alifh Design Philosophy document
 */

'use client';

import { useEffect, useState } from 'react';
import { useUserProfile, type UserProfileUpdate } from '@/hooks/profile/user-profile-hook';
import { useToast } from '@/hooks/use-toast';

// Modals
import { KycVerificationModal } from './modals/kyc-verification-modal';
import { EmailVerificationModal } from './modals/email-verification-modal';
import { PhoneVerificationModal } from './modals/phone-verification-modal';

// UI Components
import { ProfileHeader } from './ui/profile-header';
import { AvatarUpload } from './ui/avatar-upload';
import { SectionWrapper } from './ui/section-wrapper';

// Sections
import { PersonalInformationSection } from './sections/personal-information-section';
import { BioSection } from './sections/bio-section';
import { TagsSection } from './sections/tags-section';
import { LocationSection } from './sections/location-section';
import { SettingsSection } from './sections/settings-section';
import { DangerZoneSection } from './sections/danger-zone-section';

interface ProfileViewProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function ProfileView({ userName, userEmail }: ProfileViewProps) {
  const { profile, isUpdating, error, updateProfile } = useUserProfile({ fetchOnMount: true });
  const { toast } = useToast();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [emirate, setEmirate] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(25.2048);
  const [longitude, setLongitude] = useState<number | undefined>(55.2708);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [consignmentMode, setConsignmentMode] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  
  // UI state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);

  // Available tags for user selection
  const AVAILABLE_TAGS = [
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
      setOriginalEmail(userEmail ?? '');
      setOriginalPhone(profile.phone ?? '');
      setBio(profile.description ?? '');
      setCity(profile.locationCity ?? '');
      setEmirate(profile.locationEmirate ?? '');
      setLatitude(profile.locationLat ?? 25.2048);
      setLongitude(profile.locationLng ?? 55.2708);
      setSelectedTags(profile.tags ?? []);
      setConsignmentMode(profile.consignmentMode ?? true); // Default to true
      setShowPhone(profile.privacySettings?.showPhone ?? true);
    }
  }, [profile, userEmail]);

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
        const cityName = data.address.city || data.address.town || data.address.village || '';
        if (cityName) setCity(cityName);
        
        const stateName = data.address.state || '';
        if (stateName) setEmirate(stateName);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveSection = async (section: string) => {
    setIsSaving(true);
    try {
      let payload: UserProfileUpdate = {};

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
              showPhone: showPhone,
            },
          };
          break;
      }

      const result = await updateProfile(payload);
      if (result) {
        // Handle email/phone changes
        if (section === 'personal') {
          const emailChanged = email !== originalEmail;
          const phoneChanged = phone !== originalPhone;
          
          if (emailChanged) setOriginalEmail(email);
          if (phoneChanged) setOriginalPhone(phone);
          
          if (emailChanged || phoneChanged) {
            const messages = [];
            if (emailChanged) messages.push('email');
            if (phoneChanged) messages.push('phone');
            toast({
              title: 'Contact information updated',
              description: `Please verify your new ${messages.join(' and ')}.`,
            });
          } else {
            toast({
              title: 'Saved',
              description: 'Your changes have been saved.',
            });
          }
        } else {
          toast({
            title: 'Saved',
            description: 'Your changes have been saved.',
          });
        }
        setEditingSection(null);
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
    if (profile) {
      switch (section) {
        case 'personal':
          setFirstName(profile.firstName ?? '');
          setLastName(profile.lastName ?? '');
          setPhone(profile.phone ?? '');
          if (userEmail) setEmail(userEmail);
          setOriginalEmail(userEmail ?? '');
          setOriginalPhone(profile.phone ?? '');
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
          setConsignmentMode(profile.consignmentMode ?? true);
          setShowPhone(profile.privacySettings?.showPhone ?? true);
          break;
      }
    }
    setEditingSection(null);
  };

  const handleAvatarUpdate = async (avatarKey: string | null) => {
    return await updateProfile({ avatar: avatarKey });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-12">
        {/* Header with Avatar */}
        <div className="flex items-start gap-8">
          <ProfileHeader
            displayName={displayName}
            kycVerified={profile?.kycVerified}
            badges={profile?.badges}
            inventoryCount={profile?.inventoryCount}
            carsSold={profile?.carsSold}
            memberSince={profile?.memberSince}
            status={profile?.status}
            createdAt={profile?.createdAt}
            onRequestKycVerification={() => setShowKycModal(true)}
          />

          <AvatarUpload
            avatarUrl={profile?.avatarUrl}
            initials={initials}
            onUpdate={handleAvatarUpdate}
            isUpdating={isUpdating}
          />
        </div>

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
        <SectionWrapper
          title="Personal Information"
          description="Update your personal details"
          isEditing={editingSection === 'personal'}
          onEdit={() => setEditingSection('personal')}
          onSave={() => handleSaveSection('personal')}
          onCancel={() => handleCancelSection('personal')}
          isSaving={isSaving}
        >
          <PersonalInformationSection
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
            originalEmail={originalEmail}
            originalPhone={originalPhone}
            emailVerified={profile?.emailVerified}
            phoneVerified={profile?.phoneVerified}
            isEditing={editingSection === 'personal'}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onEmailVerificationClick={() => setShowEmailVerificationModal(true)}
            onPhoneVerificationClick={() => setShowPhoneVerificationModal(true)}
          />
        </SectionWrapper>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Bio Section */}
        <SectionWrapper
          title="Bio"
          description="Tell others about yourself"
          isEditing={editingSection === 'bio'}
          onEdit={() => setEditingSection('bio')}
          onSave={() => handleSaveSection('bio')}
          onCancel={() => handleCancelSection('bio')}
          isSaving={isSaving}
        >
          <BioSection
            bio={bio}
            isEditing={editingSection === 'bio'}
            onBioChange={setBio}
          />
        </SectionWrapper>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Tags Section */}
        <SectionWrapper
          title="Profile Tags"
          description="Tell others about yourself in the car marketplace"
          isEditing={editingSection === 'tags'}
          onEdit={() => setEditingSection('tags')}
          onSave={() => handleSaveSection('tags')}
          onCancel={() => handleCancelSection('tags')}
          isSaving={isSaving}
        >
          <TagsSection
            selectedTags={selectedTags}
            availableTags={AVAILABLE_TAGS}
            isEditing={editingSection === 'tags'}
            onTagToggle={handleTagToggle}
          />
        </SectionWrapper>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Location Section */}
        <SectionWrapper
          title="Location"
          description={editingSection === 'location' ? 'Click on the map to set your location' : 'Your current location'}
          isEditing={editingSection === 'location'}
          onEdit={() => setEditingSection('location')}
          onSave={() => handleSaveSection('location')}
          onCancel={() => handleCancelSection('location')}
          isSaving={isSaving}
        >
          <LocationSection
            city={city}
            emirate={emirate}
            latitude={latitude}
            longitude={longitude}
            isEditing={editingSection === 'location'}
            onCityChange={setCity}
            onEmirateChange={setEmirate}
            onLocationSelect={handleLocationSelect}
          />
        </SectionWrapper>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Settings Section */}
        <SectionWrapper
          title="Settings"
          description="Manage your account preferences"
          isEditing={editingSection === 'settings'}
          onEdit={() => setEditingSection('settings')}
          onSave={() => handleSaveSection('settings')}
          onCancel={() => handleCancelSection('settings')}
          isSaving={isSaving}
        >
          <SettingsSection
            consignmentMode={consignmentMode}
            showPhone={showPhone}
            isEditing={editingSection === 'settings'}
            onConsignmentModeToggle={() => setConsignmentMode(!consignmentMode)}
            onShowPhoneToggle={() => setShowPhone(!showPhone)}
          />
        </SectionWrapper>

        {/* Divider */}
        <div className="border-t border-border/60 my-12" />

        {/* Delete Account Section */}
        <DangerZoneSection />

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

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        emailAddress={email}
        onVerified={() => {
          // Refresh profile to get updated emailVerified status
          window.location.reload();
        }}
      />

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => setShowPhoneVerificationModal(false)}
        phoneNumber={phone}
        onVerified={() => {
          // Refresh profile to get updated phoneVerified status
          window.location.reload();
        }}
      />
    </div>
  );
}
