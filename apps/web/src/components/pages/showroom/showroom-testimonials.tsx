/**
 * Showroom Testimonials
 * Social proof. Horizontal carousel design.
 */

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { getPublicUrl } from '@/utils';
import type { ShowroomData, AmbientTheme } from './types';
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
  
  // Get an image for the section header
  const sectionImage = showroom.showroomImages?.[2] || showroom.showroomImages?.[0];

  return (
    <section id="showroom-testimonials" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Image */}
        {sectionImage && (
          <div className="px-4 sm:px-6 lg:px-8 mb-12">
            <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-muted">
              <Image
                src={getPublicUrl(sectionImage)}
                alt="Client experiences"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8 px-4 sm:px-6 lg:px-8">
          <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-3`}>
            {showroom.testimonialsSectionTitle || 'Client Stories'}
          </p>
          <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight`}>
            What Our Clients Say
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              theme={theme}
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
  theme,
  index 
}: { 
  testimonial: ShowroomTestimonial; 
  theme: AmbientTheme;
  index: number;
}) {
  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[380px] min-h-[260px] p-6 rounded-2xl bg-sidebar border border-sidebar-border hover:border-sidebar-accent transition-all duration-300 flex flex-col">
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= testimonial.rating
                ? 'text-sidebar-foreground fill-sidebar-foreground'
                : 'text-sidebar-foreground/20'
            }`}
          />
        ))}
      </div>
      
      {/* Content */}
      <p className={`text-sm ${theme.bodyClass} leading-relaxed text-sidebar-foreground/90 flex-1`}>
        "{testimonial.content}"
      </p>

      {/* Author Info */}
      <div className="mt-4 pt-4 border-t border-sidebar-border/50">
        <p className={`text-sm ${theme.subheadingClass} text-sidebar-foreground`}>
          {testimonial.customerName}
        </p>
        {testimonial.vehiclePurchased && (
          <p className="text-xs text-sidebar-foreground/50 mt-0.5">
            {testimonial.vehiclePurchased}
          </p>
        )}
      </div>
    </div>
  );
}
