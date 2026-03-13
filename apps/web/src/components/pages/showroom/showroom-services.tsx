/**
 * Showroom Services
 * What they offer. Full width image with services grid below.
 */

'use client';

import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomServicesProps {
  showroom: ShowroomData;
}

export function ShowroomServices({ showroom }: ShowroomServicesProps) {
  const services = showroom.signatureServices;
  
  if (!services || services.length === 0) return null;

  const vipPerks = showroom.vipPerks;
  const theme = getAmbientTheme(showroom.ambientStyle);
  
  // Single ambient image (index 6)
  const ambientImage = showroom.showroomImages?.[6];

  return (
    <section id="showroom-services" className={`${theme.sectionSpacing}`}>
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header - Above Image */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            {showroom.servicesSectionTitle || 'What We Offer'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Signature Services
          </h2>
        </div>

        {/* Full Width Image */}
        {ambientImage && (
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden rounded-xl bg-sidebar border border-border/40">
              <Image
                src={ambientImage}
                alt="Showroom Services"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Description - Below Image */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Tailored experiences designed around you.
          </p>
        </div>

        {/* Services Carousel */}
        <div className="relative group/scroll">
          <div 
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* VIP Card - Priority Position */}
            {vipPerks && vipPerks.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="flex-shrink-0 w-[280px] sm:w-[320px] h-[200px] p-6 rounded-xl bg-blue-600 text-white border border-blue-700/40 hover:border-blue-400/50 transition-all duration-300 flex flex-col text-left cursor-pointer"
                  >
                    {/* VIP Label */}
                    <span className="text-xl font-semibold text-white mb-3">
                      VIP
                    </span>

                    {/* Perks List */}
                    <div className="flex-1 space-y-2 overflow-hidden">
                      {vipPerks.slice(0, 4).map((perk, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                          <span className="text-sm text-white/80 truncate">{perk}</span>
                        </div>
                      ))}
                    </div>
                    
                    {vipPerks.length > 4 && (
                      <span className="text-xs text-white/60 mt-2">
                        +{vipPerks.length - 4} more perks
                      </span>
                    )}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-blue-600">VIP</span> Perks
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {vipPerks.map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        <span className="text-sm text-foreground">{perk}</span>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {services.map((service, index) => (
              <Dialog key={service.id}>
                <DialogTrigger asChild>
                  <button 
                    className="flex-shrink-0 w-[280px] sm:w-[320px] h-[200px] p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-all duration-300 flex flex-col text-left cursor-pointer"
                  >
                    {/* Number */}
                    <span className="text-xl font-semibold text-muted-foreground/30 mb-3">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-base font-semibold text-foreground leading-snug mb-2">
                        {service.title}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <span className="text-muted-foreground/30">{String(index + 1).padStart(2, '0')}</span>
                      {service.title}
                    </DialogTitle>
                  </DialogHeader>
                  {service.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Skeleton
function ShowroomServicesSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-20 mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
ShowroomServices.Skeleton = ShowroomServicesSkeleton;
