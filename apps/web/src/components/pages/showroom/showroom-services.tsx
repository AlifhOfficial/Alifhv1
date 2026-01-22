/**
 * Showroom Services
 * What they offer. Full width image with services grid below.
 */

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicUrl } from '@/utils';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomServicesProps {
  showroom: ShowroomData;
}

export function ShowroomServices({ showroom }: ShowroomServicesProps) {
  const services = showroom.signatureServices;
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!services || services.length === 0) return null;

  const vipPerks = showroom.vipPerks;
  const theme = getAmbientTheme(showroom.ambientStyle);
  
  // Single ambient image (index 6)
  const ambientImage = showroom.showroomImages?.[6];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="showroom-services" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Full Width Image */}
        {ambientImage && (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mb-12" style={{ width: 'calc(100% - 2rem)', marginLeft: '1rem', marginRight: '1rem' }}>
            <Image
              src={getPublicUrl(ambientImage) || ambientImage}
              alt="Showroom Services"
              fill
              className="object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-white/70 mb-2`}>
                {showroom.servicesSectionTitle || 'What We Offer'}
              </p>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-white tracking-tight`}>
                Signature Services
              </h2>
            </div>
          </div>
        )}

        {/* Header if no image */}
        {!ambientImage && (
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-3`}>
              {showroom.servicesSectionTitle || 'What We Offer'}
            </p>
            <h2 className={`text-xl sm:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight`}>
              Signature Services
            </h2>
          </div>
        )}

        {/* Services Carousel */}
        <div className="relative group/scroll">
          {/* Navigation */}
          {services.length > 3 && (
            <div className="hidden sm:flex items-center gap-2 absolute -top-14 right-8 z-10">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-sidebar hover:bg-sidebar-accent border border-sidebar-border flex items-center justify-center transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-sidebar-foreground" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-sidebar hover:bg-sidebar-accent border border-sidebar-border flex items-center justify-center transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-sidebar-foreground" />
              </button>
            </div>
          )}

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {services.map((service, index) => (
              <div 
                key={service.id} 
                className="flex-shrink-0 w-[280px] sm:w-[320px] min-h-[200px] p-6 rounded-2xl bg-sidebar border border-sidebar-border hover:border-sidebar-accent transition-all duration-300 flex flex-col"
              >
                {/* Number */}
                <span className={`text-2xl font-light ${theme.headingClass} text-sidebar-foreground/15 mb-3`}>
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`text-base ${theme.subheadingClass} text-sidebar-foreground leading-snug mb-2`}>
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-sidebar-foreground/60 line-clamp-3">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* VIP Card - in the same carousel */}
            {vipPerks && vipPerks.length > 0 && (
              <div 
                className="flex-shrink-0 w-[280px] sm:w-[320px] min-h-[200px] p-6 rounded-2xl bg-sidebar border border-sidebar-border hover:border-sidebar-accent transition-all duration-300 flex flex-col"
              >
                {/* VIP Label */}
                <span className={`text-2xl font-light ${theme.headingClass} text-sidebar-foreground/15 mb-3`}>
                  VIP
                </span>

                {/* Perks List */}
                <div className="flex-1 space-y-2">
                  {vipPerks.slice(0, 4).map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sidebar-foreground/40 flex-shrink-0" />
                      <span className="text-sm text-sidebar-foreground/60">{perk}</span>
                    </div>
                  ))}
                  {vipPerks.length > 4 && (
                    <span className="text-xs text-sidebar-foreground/40">+{vipPerks.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
