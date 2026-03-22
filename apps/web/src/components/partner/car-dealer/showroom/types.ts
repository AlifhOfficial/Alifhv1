/**
 * Partner Showroom Types
 * Type definitions for the showroom form components
 * 
 * Source of truth:
 * - packages/database/.../showroom-queries.ts (PartnerShowroomFull)
 * - apps/web/src/hooks/partner/car-dealer/use-partner-showroom.ts (PartnerShowroom)
 */

import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import type {
  ShowroomTeamMember,
  ShowroomAchievement,
  ShowroomTestimonial,
  ShowroomService,
  ShowroomPressFeature,
} from '@alifh/database';

// ============================================================================
// Form Props
// ============================================================================

export interface PartnerShowroomFormProps {
  partnerId: string;
}

// ============================================================================
// Section Types
// ============================================================================

export type SectionId = 
  | 'hero'
  | 'story' 
  | 'gallery'
  | 'team'
  | 'achievements'
  | 'testimonials'
  | 'services'
  | 'social'
  | 'seo';

export type EditingField = string | null;

// ============================================================================
// Component Props
// ============================================================================

export interface EditableFieldProps {
  label: string;
  value: string | number | null;
  placeholder: string;
  type?: 'text' | 'number' | 'url' | 'textarea';
  maxLength?: number;
  isEditing: boolean;
  isUpdating: boolean;
  onStartEdit: () => void;
  onChange: (value: string | number | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface ImageUploadProps {
  value: string | null;
  displayUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  aspectRatio?: string;
  label: string;
  isUploading: boolean;
}

export interface VideoUploadProps {
  value: string | null;
  displayUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  aspectRatio?: string;
  label: string;
  isUploading: boolean;
  uploadProgress?: number;
}

export interface VideoEmbedPreviewProps {
  url: string | null;
  aspectRatio?: string;
}

// ============================================================================
// Card Props
// ============================================================================

export interface TeamMemberCardProps {
  member: ShowroomTeamMember;
  onUpdate: (updates: Partial<ShowroomTeamMember>) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export interface AchievementCardProps {
  achievement: ShowroomAchievement;
  onUpdate: (updates: Partial<ShowroomAchievement>) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export interface TestimonialCardProps {
  testimonial: ShowroomTestimonial;
  onUpdate: (updates: Partial<ShowroomTestimonial>) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export interface ServiceCardProps {
  service: ShowroomService;
  onUpdate: (updates: Partial<ShowroomService>) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

// ============================================================================
// Section Props (common interface for all sections)
// ============================================================================

export interface ShowroomSectionProps {
  form: Partial<PartnerShowroom>;
  showroom: PartnerShowroom;
  isUpdating: boolean;
  editingField: EditingField;
  imageUploading: string | null;
  videoUploading: string | null;
  uploadProgress: number;
  partnerId: string;
  updateField: <K extends keyof PartnerShowroom>(field: K, value: PartnerShowroom[K]) => void;
  getEditableFieldProps: (field: keyof PartnerShowroom) => {
    isEditing: boolean;
    isUpdating: boolean;
    onStartEdit: () => void;
    onChange: (val: string | number | null) => void;
    onSave: () => void;
    onCancel: () => void;
  };
  uploadImage: (file: File, type: string, field: keyof PartnerShowroom) => Promise<void>;
  removeImage: (field: keyof PartnerShowroom) => Promise<void>;
  uploadVideo: (file: File, type: string, field: keyof PartnerShowroom) => Promise<void>;
  removeVideo: (field: keyof PartnerShowroom) => Promise<void>;
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
  setForm: React.Dispatch<React.SetStateAction<Partial<PartnerShowroom>>>;
  setImageUploading: React.Dispatch<React.SetStateAction<string | null>>;
  toast: (options: { title: string; variant?: 'default' | 'destructive' }) => void;
}

// Re-export database types for convenience
export type { ShowroomTeamMember, ShowroomAchievement, ShowroomTestimonial, ShowroomService, ShowroomPressFeature };
