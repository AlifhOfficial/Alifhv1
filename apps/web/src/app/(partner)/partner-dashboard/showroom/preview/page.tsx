/**
 * Partner Showroom Preview Page
 * Allows partner owners/admins to preview their showroom before publishing
 */

'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useShowroomPreview } from '@/hooks/showroom';
import {
  ShowroomHero,
  ShowroomInventory,
  ShowroomStory,
  ShowroomFounder,
  ShowroomGallery,
  ShowroomAchievements,
  ShowroomServices,
  ShowroomTeam,
  ShowroomTestimonials,
  ShowroomContact,
  ShowroomFooter,
} from '@/components/pages/showroom';

export default function ShowroomPreviewPage() {
  const { showroom, isLoading, error } = useShowroomPreview();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error || !showroom) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-title3 text-foreground mb-2">
            {error?.message || 'Preview Not Available'}
          </h1>
          <p className="text-muted-foreground mb-6">
            Make sure you have created a showroom and have owner or admin access.
          </p>
          <Link 
            href="/partner-dashboard/showroom"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-subhead bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
        </div>
      </div>
    );
  }

  // Cast to expected shape for components
  const showroomData = showroom as Parameters<typeof ShowroomHero>[0]['showroom'];

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-warning text-warning-foreground">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-subhead">
              Preview Mode — This is how your showroom will look when published
            </span>
          </div>
          <Link 
            href="/partner-dashboard/showroom"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-subhead bg-warning text-warning-foreground rounded-md hover:bg-warning/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
        </div>
      </div>
      
      {/* Showroom Content */}
      <ShowroomHero showroom={showroomData} />
      <ShowroomInventory showroom={showroomData} />
      <ShowroomStory showroom={showroomData} />
      <ShowroomFounder showroom={showroomData} />
      <ShowroomGallery showroom={showroomData} />
      <ShowroomAchievements showroom={showroomData} />
      <ShowroomServices showroom={showroomData} />
      <ShowroomTeam showroom={showroomData} />
      <ShowroomTestimonials showroom={showroomData} />
      <ShowroomContact showroom={showroomData} />
      <ShowroomFooter showroom={showroomData} />
    </div>
  );
}
