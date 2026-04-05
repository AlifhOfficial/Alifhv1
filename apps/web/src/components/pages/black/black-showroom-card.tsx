/**
 * Black Showroom Card
 * 
 * Premium showroom card for Black tier directory.
 * Revvup Design System - minimal, clean, consistent.
 * 
 * Layout:
 * - Mobile: Stacked (media on top, content below)
 * - Desktop: Split (media 75%, content 25%)
 * 
 * Media Priority: Video > Image > Gradient
 */

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// Types
// ============================================================================

export interface ShowroomCardData {
  id: string;
  partnerId: string;
  slug: string | null;
  heroVideoUrl: string | null;
  heroVideoFileUrl: string | null;
  heroImageUrl: string | null;
  heroTagline: string | null;
  partner: {
    brandName: string;
    logoUrl: string | null;
    heroImageUrl: string | null;
    isVerified: boolean;
    tier: string;
    googleRating: number | null;
    googleReviewCount: number;
    city: string | null;
    emirate: string | null;
  };
  totalCarsSold: number | null;
  yearsInBusiness: number | null;
  publishedAt: string | null;
}

interface BlackShowroomCardProps {
  showroom: ShowroomCardData;
  priority?: boolean;
  index: number;
}

// ============================================================================
// Component
// ============================================================================

export function BlackShowroomCard({ showroom, priority = false, index: _index }: BlackShowroomCardProps) {
  const { partner } = showroom;
  
  // Build showroom link
  const showroomHref = showroom.slug 
    ? `/showroom/${showroom.slug}` 
    : `/showroom/${showroom.partnerId}`;
  
  const displayImage = showroom.heroImageUrl || partner.heroImageUrl;

  // Stats
  const location = partner.city || partner.emirate;
  const hasRating = partner.googleRating && partner.googleRating > 0;
  const hasYears = showroom.yearsInBusiness && showroom.yearsInBusiness > 0;
  const hasSold = showroom.totalCarsSold && showroom.totalCarsSold > 0;
  
  return (
    <Link
      href={showroomHref}
      className={cn(
        'group relative block w-full',
        'rounded-xl overflow-hidden',
        'bg-sidebar border border-border/40',
        'hover:border-primary/30 transition-all duration-300'
      )}
    >
      {/* Main Layout - Stacked mobile, split desktop */}
      <div className="flex flex-col lg:flex-row lg:min-h-[520px]">
        
        {/* ================================================================ */}
        {/* Media Section - 75% on desktop */}
        {/* ================================================================ */}
        <div className="relative w-full lg:w-[75%] aspect-[16/9] lg:aspect-auto bg-muted/20 overflow-hidden">
          
          {/* Banner Image */}
          {displayImage && (
            <img
              src={displayImage}
              alt={partner.brandName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
            />
          )}
          
          {/* Gradient fallback */}
          {!displayImage && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/5" />
          )}
        </div>

        {/* ================================================================ */}
        {/* Content Section - 25% on desktop */}
        {/* ================================================================ */}
        <div className="flex-1 lg:w-[25%] p-6 sm:p-8 flex flex-col">
          
          {/* Top: Logo + Brand + Tagline + Stats */}
          <div className="flex-1">
            {/* Mobile: Brand + Logo row | Desktop: Logo on top */}
            <div className="flex items-start justify-between gap-4 lg:block">
              {/* Brand Name + Tagline + Stats */}
              <div className="flex-1 min-w-0 lg:order-2">
                {/* Desktop Logo - above brand name */}
                {partner.logoUrl && (
                  <div className="hidden lg:block h-14 w-auto mb-4">
                    <img
                      src={partner.logoUrl}
                      alt={`${partner.brandName} logo`}
                      className="object-contain h-14 w-auto"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                
                {/* Brand Name */}
                <h2 className="text-callout font-semibold tracking-tight text-foreground">
                  {partner.brandName}
                </h2>
                
                {/* Tagline */}
                {showroom.heroTagline && (
                  <p className="text-subhead text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {showroom.heroTagline}
                  </p>
                )}
                
                {/* Stats */}
                {(hasRating || hasYears || hasSold) && (
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-subhead text-muted-foreground">
                    {hasRating && (
                      <span>Rated {partner.googleRating!.toFixed(1)}</span>
                    )}
                
                    {hasRating && hasYears && (
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    )}
                    
                    {hasYears && (
                      <span>{showroom.yearsInBusiness}+ yrs</span>
                    )}
                    
                    {(hasRating || hasYears) && hasSold && (
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    )}
                    
                    {hasSold && (
                      <span>{showroom.totalCarsSold!.toLocaleString()}+ sold</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Mobile Logo - right side */}
              {partner.logoUrl && (
                <div className="lg:hidden h-12 w-auto flex-shrink-0">
                  <img
                    src={partner.logoUrl}
                    alt={`${partner.brandName} logo`}
                    className="object-contain h-12 w-auto"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Footer: Location + Experience CTA */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40">
            {/* Location */}
            <span className="text-subhead text-muted-foreground">
              {location || 'UAE'}
            </span>
            
            {/* Experience CTA */}
            <span className="flex items-center gap-1.5 text-subhead text-primary transition-colors">
              Visit
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

export function BlackShowroomCardSkeleton() {
  return (
    <div className="w-full rounded-xl bg-sidebar border border-border/40 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:min-h-[420px]">
        {/* Media Section - 75% */}
        <Skeleton className="w-full lg:w-[75%] aspect-[16/9] lg:aspect-auto" />
        
        {/* Content Section - 25% */}
        <div className="flex-1 lg:w-[25%] p-5 sm:p-6 flex flex-col">
          {/* Top: Logo + Brand */}
          <div className="flex-1">
            <Skeleton className="h-10 w-16 mb-4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-[180px] mt-2" />
            
            {/* Stats */}
            <div className="flex items-center gap-3 mt-4">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
