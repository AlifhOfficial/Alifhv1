/**
 * Profile Components - Organized Structure
 * Compact, efficient, categorized exports
 */

// === Main View ===
export { ProfileView } from './profile-view';

// === UI Primitives ===
export { ProfileHeader } from './ui/profile-header';
export { AvatarUpload } from './ui/avatar-upload';
export { SectionWrapper } from './ui/section-wrapper';

// === Content Sections ===
export { PersonalInformationSection } from './sections/personal-information-section';
export { BioSection } from './sections/bio-section';
export { TagsSection } from './sections/tags-section';
export { LocationSection } from './sections/location-section';
export { SettingsSection } from './sections/settings-section';
export { DangerZoneSection } from './sections/danger-zone-section';

// === Location Components ===
export { LocationMap } from './sections/location-map';
export { MapClickHandler } from './sections/map-click-handler';

// === Modals ===
export { KycVerificationModal } from './modals/kyc-verification-modal';
export { EmailVerificationModal } from './modals/email-verification-modal';
export { PhoneVerificationModal } from './modals/phone-verification-modal';
