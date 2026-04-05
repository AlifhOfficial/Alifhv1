/**
 * Partner Showroom Form
 * Premium brand manifesto editor for Black tier partners
 * 
 * Following Revvup Design System - tap-to-edit pattern
 * 
 * This is the main orchestrating component that uses modular sections
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerShowroom, type ShowroomUpdateData, type PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { useToast } from '@/hooks/use-toast';
import { compressAndUploadShowroomImage, uploadShowroomVideo } from '@/lib/storage';
import {
  ArrowLeft,
  Loader2,
  Globe,
  Archive,
  ExternalLink,
} from 'lucide-react';

// Import modular components
import { SECTIONS } from './showroom/constants';
import type { SectionId, EditingField } from './showroom/types';
import {
  HeroSection,
  StorySection,
  GallerySection,
  TeamSection,
  AchievementsSection,
  TestimonialsSection,
  ServicesSection,
  SocialSection,
  SeoSection,
} from './showroom/sections';

// ============================================================================
// Props
// ============================================================================

interface PartnerShowroomFormProps {
  partnerId: string;
  initialShowroom?: PartnerShowroom | null;
}

// ============================================================================
// Main Form Component
// ============================================================================

export function PartnerShowroomForm({ partnerId, initialShowroom = null }: PartnerShowroomFormProps) {
  const { toast } = useToast();
  const { showroom, isLoading, updateShowroom, isUpdating, publish, unpublish, isPublishing } = usePartnerShowroom(partnerId, {
    initialShowroom,
  });

  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [imageUploading, setImageUploading] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Local form state mirrors showroom but allows editing
  const [form, setForm] = useState<Partial<PartnerShowroom>>({});

  // Initialize form from showroom
  useEffect(() => {
    if (showroom) {
      setForm(showroom);
    }
  }, [showroom]);

  // Reset form when editing field changes (cancel unsaved edits when clicking away)
  const prevEditingField = React.useRef<EditingField>(null);
  React.useEffect(() => {
    if (prevEditingField.current !== null && prevEditingField.current !== editingField && showroom) {
      setForm(showroom);
    }
    prevEditingField.current = editingField;
  }, [editingField, showroom]);

  const updateField = useCallback(<K extends keyof PartnerShowroom>(field: K, value: PartnerShowroom[K]) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  // Save single field
  const saveField = async (field: keyof ShowroomUpdateData) => {
    // Get the current value - convert empty strings to null for nullable fields
    let value = form[field];
    
    // For nullable string fields, convert empty string to null
    if (value === '') {
      value = null as any;
    }
    
    // For URL fields, ensure they have https:// prefix if they have a value
    const urlFields: (keyof ShowroomUpdateData)[] = ['instagramHandle', 'youtubeChannelUrl', 'tiktokHandle', 'linkedinUrl', 'heroCtaLink', 'heroCtaSecondaryLink', 'showroomMapEmbedUrl', 'heroVideoUrl', 'brandStoryVideoUrl', 'gallerySectionVideoUrl', 'showroomVideoTourUrl', 'teamSectionVideoUrl', 'achievementsSectionVideoUrl', 'testimonialsSectionVideoUrl', 'servicesSectionVideoUrl'];
    if (urlFields.includes(field) && value && typeof value === 'string') {
      // Add https:// if missing protocol
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        value = `https://${value}` as any;
      }
    }
    
    const updates: Partial<ShowroomUpdateData> = { [field]: value } as Partial<ShowroomUpdateData>;

    if (field === 'heroVideoUrl') {
      if (value) {
        updates.heroBackgroundType = 'video';
      }
    }

    try {
      await updateShowroom(updates);
      setEditingField(null);
      toast({ title: 'Saved' });
    } catch (err: any) {
      // Show specific error message if available
      const message = err?.message || 'Failed to save';
      toast({ title: message, variant: 'destructive' });
    }
  };

  const cancelEdit = () => {
    if (showroom) {
      setForm(showroom);
    }
    setEditingField(null);
  };

  // Upload image via client-side compression + direct CDN upload
  const uploadImage = async (file: File, type: 'hero-image' | 'brand-story-image' | 'founder-image' | 'gallery' | 'gallery-section-image' | 'team-member' | 'team-section-image' | 'achievement-image' | 'achievements-section-image' | 'testimonial-image' | 'testimonials-section-image' | 'service-image' | 'services-section-image' | 'seo-image', field: keyof PartnerShowroom) => {
    // Basic check - allow common image types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast({ title: 'Only image files are allowed', variant: 'destructive' });
      return;
    }
    
    // 15MB limit for source images (will be compressed client-side)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: 'Image too large. Max 15MB allowed', variant: 'destructive' });
      return;
    }

    const oldKey = (form as any)[field] as string | null;
    setImageUploading(field);
    try {
      const result = await compressAndUploadShowroomImage(file, partnerId, type);
      const updates: Partial<PartnerShowroom> = { [field]: result.key } as Partial<PartnerShowroom>;

      if (field === 'heroImage') {
        updates.heroBackgroundType = 'image';
      }

      setForm(f => ({ ...f, ...updates }));
      await updateShowroom(updates as any);
      // Delete replaced R2 object (fire-and-forget)
      if (oldKey && !oldKey.startsWith('http')) {
        fetch('/api/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: oldKey }),
        }).catch(() => {});
      }
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      toast({ title: err.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setImageUploading(null);
    }
  };

  // Remove image
  const removeImage = async (field: keyof PartnerShowroom) => {
    const oldKey = (form as any)[field] as string | null;
    try {
      const updates: Partial<PartnerShowroom> = { [field]: null } as Partial<PartnerShowroom>;
      if (field === 'heroImage') {
        updates.heroBackgroundType = 'image';
      }
      setForm(f => ({ ...f, [field]: null }));
      await updateShowroom(updates as any);
      // Delete removed R2 object (fire-and-forget)
      if (oldKey && !oldKey.startsWith('http')) {
        fetch('/api/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: oldKey }),
        }).catch(() => {});
      }
      toast({ title: 'Image removed' });
    } catch {
      toast({ title: 'Failed to remove image', variant: 'destructive' });
    }
  };

  // Upload video via presigned URL (direct to CDN, no processing)
  const uploadVideo = async (file: File, type: string, field: keyof PartnerShowroom) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid video format. Use MP4, WebM, or MOV', variant: 'destructive' });
      return;
    }
    
    // 50MB limit to control CDN bandwidth costs
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ 
        title: 'Video too large (max 50MB). Compress to 720p/1080p first.', 
        variant: 'destructive' 
      });
      return;
    }

    const oldVideoKey = (form as any)[field] as string | null;
    setVideoUploading(field);
    setUploadProgress(0);
    
    try {
      const result = await uploadShowroomVideo(file, partnerId, type, (progress) => {
        setUploadProgress(progress);
      });
      
      const updates: Partial<PartnerShowroom> = { [field]: result.key } as Partial<PartnerShowroom>;
      if (field === 'heroVideoFile') {
        updates.heroBackgroundType = 'video';
      }

      setForm(f => ({ ...f, ...updates }));
      await updateShowroom(updates as any);
      // Delete replaced R2 video object (fire-and-forget)
      if (oldVideoKey && !oldVideoKey.startsWith('http')) {
        fetch('/api/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: oldVideoKey }),
        }).catch(() => {});
      }
      toast({ title: 'Video uploaded' });
    } catch (err: any) {
      toast({ title: err.message || 'Video upload failed', variant: 'destructive' });
    } finally {
      setVideoUploading(null);
      setUploadProgress(0);
    }
  };

  // Remove video
  const removeVideo = async (field: keyof PartnerShowroom) => {
    const oldKey = (form as any)[field] as string | null;
    try {
      const updates: Partial<PartnerShowroom> = { [field]: null } as Partial<PartnerShowroom>;
      if (field === 'heroVideoFile' && form.heroBackgroundType === 'video') {
        updates.heroBackgroundType = 'image';
      }
      setForm(f => ({ ...f, [field]: null }));
      await updateShowroom(updates as any);
      // Delete removed R2 video object (only file keys, not embed URLs)
      if (oldKey && !oldKey.startsWith('http')) {
        fetch('/api/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: oldKey }),
        }).catch(() => {});
      }
      toast({ title: 'Video removed' });
    } catch {
      toast({ title: 'Failed to remove video', variant: 'destructive' });
    }
  };

  // Publish/unpublish
  const handlePublish = async () => {
    try {
      await publish();
      toast({ title: 'Showroom published!' });
    } catch (err: any) {
      toast({ title: err.message || 'Failed to publish', variant: 'destructive' });
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublish();
      toast({ title: 'Showroom unpublished' });
    } catch (err: any) {
      toast({ title: err.message || 'Failed to unpublish', variant: 'destructive' });
    }
  };

  // Field editing helper
  const getEditableFieldProps = (field: keyof PartnerShowroom) => ({
    isEditing: editingField === field,
    isUpdating,
    onStartEdit: () => setEditingField(field),
    onChange: (val: string | number | null) => updateField(field, val as any),
    onSave: () => saveField(field as keyof ShowroomUpdateData),
    onCancel: cancelEdit,
  });

  // Wrapper for updateShowroom to match expected type
  const handleUpdateShowroom = async (data: Partial<PartnerShowroom>) => {
    await updateShowroom(data as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        
        {/* Form Sections Skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 p-6 space-y-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!showroom) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-subhead text-muted-foreground">Unable to load showroom</p>
        </div>
      </div>
    );
  }

  // Common props for all sections
  const sectionProps = {
    form,
    showroom,
    isUpdating,
    editingField,
    imageUploading,
    videoUploading,
    uploadProgress,
    partnerId,
    updateField,
    getEditableFieldProps,
    uploadImage,
    removeImage,
    uploadVideo,
    removeVideo,
    updateShowroom: handleUpdateShowroom,
    setForm,
    setImageUploading,
    toast,
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/partner-dashboard"
              className="inline-flex items-center gap-1.5 text-subhead text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <h1 className="text-title3 font-bold tracking-tight text-foreground">Brand Showroom</h1>
            <p className="text-subhead text-muted-foreground mt-0.5">Your premium brand manifesto page</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Preview Button - always visible */}
            <Link
              href="/partner-dashboard/showroom/preview"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-subhead border border-border/40 rounded-lg hover:bg-muted/30 transition-colors"
            >
              Preview
            </Link>
            
            {showroom.isPublished ? (
              <>
                <Link
                  href={`/showroom/${showroom.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-subhead border border-border/40 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Live
                </Link>
                <button
                  onClick={handleUnpublish}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-subhead border border-border/40 rounded-lg hover:bg-muted/30 transition-colors disabled:opacity-50"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                  Unpublish
                </button>
              </>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-subhead font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Status Banner */}
        {showroom.isPublished && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sidebar border border-border/40 mb-6">
            <div className="w-2 h-2 rounded-full bg-success" />
            <div className="flex-1">
              <p className="text-subhead text-foreground">Live at <span className="text-muted-foreground">/showroom/{showroom.slug}</span></p>
              <p className="text-caption1 text-muted-foreground">{showroom.viewCount} views</p>
            </div>
          </div>
        )}

        {/* Section Content */}
        {activeSection === 'hero' && (
          <HeroSection {...sectionProps} />
        )}

        {activeSection === 'story' && (
          <StorySection {...sectionProps} />
        )}

        {activeSection === 'gallery' && (
          <GallerySection {...sectionProps} />
        )}

        {activeSection === 'team' && (
          <TeamSection {...sectionProps} />
        )}

        {activeSection === 'achievements' && (
          <AchievementsSection {...sectionProps} />
        )}

        {activeSection === 'testimonials' && (
          <TestimonialsSection {...sectionProps} />
        )}

        {activeSection === 'services' && (
          <ServicesSection {...sectionProps} />
        )}

        {activeSection === 'social' && (
          <SocialSection {...sectionProps} />
        )}

        {activeSection === 'seo' && (
          <SeoSection {...sectionProps} />
        )}
      </div>

      {/* Right Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between py-4 pr-6 flex-shrink-0">
          <h2 className="text-subhead font-bold tracking-tight text-foreground">Sections</h2>
        </div>
        
        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-6">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map(section => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full py-3 px-4 text-subhead rounded-2xl transition-all duration-150 text-left",
                    isActive
                      ? 'text-foreground font-semibold bg-muted/50'
                      : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </div>
  );
}
