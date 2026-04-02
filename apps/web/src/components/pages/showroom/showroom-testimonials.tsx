/**
 * Showroom Testimonials
 * Social proof. Horizontal carousel design.
 */

'use client';

import { useRef } from 'react';
import { getVideoEmbedUrl } from '@/components/partner/car-dealer/showroom/components';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppThumbUrl, getCdnPublicUrl } from '@/utils/storage';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';
import type { ShowroomTestimonial } from '@alifh/database';

interface ShowroomTestimonialsProps {
  showroom: ShowroomData;
}

export function ShowroomTestimonials({ showroom }: ShowroomTestimonialsProps) {
  const testimonials = showroom.featuredTestimonials;
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!testimonials || testimonials.length === 0) return null;

  const theme = getAmbientTheme(showroom.ambientStyle);
  const sectionImage = getCdnPublicUrl(showroom.testimonialsSectionImage);
  const { embedUrl: testimonialsSectionVideoEmbedUrl } = getVideoEmbedUrl(showroom.testimonialsSectionVideoUrl);

  return (
    <section id="showroom-testimonials" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header - Above Image */}
        <div className="mb-8 px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            {showroom.testimonialsSectionTitle || 'Client Stories'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            What Our Clients Say
          </h2>
        </div>

        {/* Section Media */}
        {(testimonialsSectionVideoEmbedUrl || sectionImage) && (
          <div className="px-4 sm:px-6 lg:px-8 mb-12">
            <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full rounded-xl overflow-hidden bg-sidebar border border-border/40">
              {testimonialsSectionVideoEmbedUrl ? (
                <iframe
                  src={`${testimonialsSectionVideoEmbedUrl}?autoplay=1&mute=1&loop=1`}
                  title="Client experiences"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : sectionImage ? (
                <img
                  src={sectionImage}
                  alt="Client experiences"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>
          </div>
        )}
        
        {/* Description - Below Image */}
        <div className="mb-8 px-4 sm:px-6 lg:px-8">
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Real experiences from real people.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={`${testimonial.id}-${index}`} 
              testimonial={testimonial} 
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Testimonial Card
// ============================================================================

function TestimonialCard({ 
  testimonial, 
  index: _index 
}: { 
  testimonial: ShowroomTestimonial; 
  index: number;
}) {
  // customerImageUrl holds external URLs (e.g. Google profile photos) — use directly.
  // customerImage holds R2 storage keys — resolve via CDN util.
  // If customerImage was populated with an absolute URL by the API mapping, pass it through too.
  const customerImageUrl =
    testimonial.customerImageUrl ||
    (testimonial.customerImage?.startsWith('https://') ? testimonial.customerImage : getAppThumbUrl(testimonial.customerImage));

  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[380px] min-h-[260px] p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-all duration-300 flex flex-col">
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= testimonial.rating
                ? 'text-foreground fill-foreground'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      
      {/* Content */}
      <p className="text-sm leading-relaxed text-muted-foreground flex-1">
        "{testimonial.content}"
      </p>

      {/* Author Info */}
      <div className="mt-4 pt-4 border-t border-border/40">
        <div className="flex items-center gap-3">
          {customerImageUrl ? (
            <img
              src={customerImageUrl}
              alt={testimonial.customerName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-muted-foreground">
                {testimonial.customerName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-foreground">
              {testimonial.customerName}
            </p>
            {testimonial.vehiclePurchased && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {testimonial.vehiclePurchased}
              </p>
            )}
            {testimonial.source === 'google' && (
              <p className="text-xs text-muted-foreground/60 mt-0.5">via Google Reviews</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton
function ShowroomTestimonialsSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-24 mx-auto mb-4" />
          <Skeleton className="h-8 w-52 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-sidebar p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-4 border-t border-sidebar-border/50">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
ShowroomTestimonials.Skeleton = ShowroomTestimonialsSkeleton;
