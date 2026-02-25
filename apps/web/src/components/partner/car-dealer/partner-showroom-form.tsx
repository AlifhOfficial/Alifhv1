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
import { usePartnerShowroom, type ShowroomUpdateData, type PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { useToast } from '@/hooks/use-toast';
import { uploadShowroomImage, uploadShowroomVideo } from '@/lib/storage';
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
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
}

// ============================================================================
// Main Form Component
// ============================================================================

export function PartnerShowroomForm({ partnerId }: PartnerShowroomFormProps) {
  const { toast } = useToast();
  const { showroom, isLoading, updateShowroom, isUpdating, publish, unpublish, isPublishing } = usePartnerShowroom(partnerId);

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

  const updateField = useCallback(<K extends keyof PartnerShowroom>(field: K, value: PartnerShowroom[K]) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  // Save single field
  const saveField = async (field: keyof ShowroomUpdateData) => {
    if (!form[field] && form[field] !== false && form[field] !== 0) return;
    
    try {
      await updateShowroom({ [field]: form[field] });
      setEditingField(null);
      toast({ title: 'Saved' });
    } catch (err) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  const cancelEdit = () => {
    if (showroom) {
      setForm(showroom);
    }
    setEditingField(null);
  };

  // Upload image via presigned URL pipeline (HEIC→WebP conversion, CDN caching)
  const uploadImage = async (file: File, type: string, field: keyof PartnerShowroom) => {
    // Basic check - allow common image types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast({ title: 'Only image files are allowed', variant: 'destructive' });
      return;
    }
    
    // 15MB limit for images (will be compressed server-side)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: 'Image too large. Max 15MB allowed', variant: 'destructive' });
      return;
    }

    setImageUploading(field);
    try {
      const result = await uploadShowroomImage(file, partnerId, type);
      setForm(f => ({ ...f, [field]: result.key }));
      await updateShowroom({ [field]: result.key } as any);
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      toast({ title: err.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setImageUploading(null);
    }
  };

  // Remove image
  const removeImage = async (field: keyof PartnerShowroom) => {
    try {
      await updateShowroom({ [field]: null } as any);
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

    setVideoUploading(field);
    setUploadProgress(0);
    
    try {
      const result = await uploadShowroomVideo(file, partnerId, type, (progress) => {
        setUploadProgress(progress);
      });
      
      setForm(f => ({ ...f, [field]: result.key }));
      await updateShowroom({ [field]: result.key } as any);
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
    try {
      await updateShowroom({ [field]: null } as any);
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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!showroom) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-muted-foreground">Unable to load showroom</p>
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
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Brand Showroom</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your premium brand manifesto page</p>
          </div>
          
          <div className="flex items-center gap-2">
            {showroom.isPublished ? (
              <>
                <Link
                  href={`/showroom/${showroom.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border/40 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={handleUnpublish}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border/40 rounded-lg hover:bg-muted/30 transition-colors disabled:opacity-50"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                  Unpublish
                </button>
              </>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Status Banner */}
        {showroom.isPublished && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sidebar border border-border/40 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Live at <span className="text-muted-foreground">/showroom/{showroom.slug}</span></p>
              <p className="text-xs text-muted-foreground">{showroom.viewCount} views</p>
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
          <h2 className="text-[15px] font-bold tracking-tight text-foreground">Sections</h2>
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
                    "w-full py-3 px-4 text-[15px] rounded-2xl transition-all duration-150 text-left",
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
