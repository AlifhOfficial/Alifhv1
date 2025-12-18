/**
 * Car Detail Content Component - Alifh Design System
 * Displays detailed car information with image gallery
 * Following car-card minimalist aesthetic
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatPrice, formatMileage } from '@/hooks/use-listing-detail';

interface CarDetailContentProps {
  listing: any;
  isBlack?: boolean;
}

export function CarDetailContent({ listing, isBlack = false }: CarDetailContentProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const images = listing.images.length > 0 ? listing.images : [listing.thumbnail || '/assets/cars/car1.avif'];
  const carTitle = `${listing.year} ${listing.make} ${listing.model}`;
  
  const formatEnum = (value: string | null) => {
    if (!value) return null;
    return value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat('en-US').format(km);
  };
  
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const getCarDescription = () => {
    if (listing.description) return listing.description;
    
    return `Experience the pinnacle of performance engineering with this meticulously maintained ${listing.make} ${listing.model}. This exceptional vehicle combines luxury with raw power, featuring premium materials and cutting-edge technology. Every detail has been carefully crafted to deliver an uncompromising driving experience that defines automotive excellence.`;
  };

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '822/498' }}>
          <Image
            src={images[selectedImage]}
            alt={carTitle}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-colors",
                  isBlack 
                    ? "bg-white/90 hover:bg-white text-black" 
                    : "bg-white/90 hover:bg-white text-black"
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-colors",
                  isBlack 
                    ? "bg-white/90 hover:bg-white text-black" 
                    : "bg-white/90 hover:bg-white text-black"
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 right-4 bg-black text-white px-2 py-1 text-xs">
            {selectedImage + 1}/{images.length}
          </div>
          
          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isBlack && (
              <div className="px-3 py-1.5 bg-black border border-black">
                <span className="text-xs font-bold text-white tracking-widest">BLK</span>
              </div>
            )}
            {listing.isFeatured && (
              <div className="px-2 py-1 bg-blue-500 text-white text-xs font-medium">
                FEATURED
              </div>
            )}
            {listing.qiScore && (
              <div className="bg-black text-white px-2 py-1 text-xs">
                QI {Math.round(listing.qiScore)}
              </div>
            )}
            {listing.badges && listing.badges.length > 0 && (
              listing.badges.map((badge: string, idx: number) => (
                <div key={idx} className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium uppercase">
                  {badge.replace(/_/g, ' ')}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative w-16 h-12 overflow-hidden flex-shrink-0",
                  index === selectedImage 
                    ? isBlack
                      ? "ring-1 ring-white"
                      : "ring-1 ring-black"
                    : ""
                )}
              >
                <Image
                  src={image}
                  alt={`View ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        <div className={cn(
          "text-xs",
          isBlack ? "text-zinc-400" : "text-neutral-600"
        )}>
          Gallery ({images.length} photos)
        </div>
      </div>

      {/* Car Title and Info Section */}
      <div className="flex items-start justify-between">
        {/* Left Column - Title, Price and Description */}
        <div className="flex-1 pr-8">
          <h1 className={cn(
            "text-lg font-medium mb-2",
            isBlack ? "text-white" : "text-neutral-900"
          )}>
            {listing.year} {listing.make} {listing.model}
          </h1>
          
          {/* Price */}
          <div className={cn(
            "text-2xl font-bold mb-4",
            isBlack ? "text-white" : "text-neutral-900"
          )}>
            {formatPrice(listing.price)}
          </div>
          
          {/* Basic Details */}
          <div className={cn(
            "flex items-center gap-4 text-sm mb-6",
            isBlack ? "text-zinc-400" : "text-neutral-600"
          )}>
            <span>{formatKilometers(listing.mileage)} km</span>
            <span>•</span>
            <span>{formatEnum(listing.specs) || 'GCC'} Specs</span>
            <span>•</span>
            <span>{listing.emirate}</span>
            {listing.city && (
              <>
                <span>•</span>
                <span>{listing.city}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {listing.tags.map((tag: string, idx: number) => (
                <span 
                  key={idx}
                  className={cn(
                    "px-2 py-1 text-xs border",
                    isBlack 
                      ? "border-zinc-700 text-zinc-400" 
                      : "border-neutral-200 text-neutral-600"
                  )}
                >
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Car Description */}
          <div className={cn(
            "text-sm leading-relaxed mb-6",
            isBlack ? "text-zinc-400" : "text-neutral-600"
          )}>
            {getCarDescription()}
          </div>

          {/* VIN Section */}
          {listing.vin && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-blue-500">Vehicle Identification Number</h3>
              <p className={cn(
                "font-mono text-sm",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {listing.vin}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price Trend Analysis */}
      {(listing.fairValue || listing.priceTrend) && (
        <div className={cn(
          "space-y-4 border-t pt-6",
          isBlack ? "border-zinc-800" : "border-neutral-200"
        )}>
          <div className="grid grid-cols-2 gap-6">
            {/* Price Trend Chart */}
            {listing.priceTrend && (
              <div className="space-y-2">
                <h3 className={cn(
                  "text-sm font-medium",
                  isBlack ? "text-white" : "text-neutral-900"
                )}>
                  Price Trend
                </h3>
                <div className={cn(
                  "relative h-16 p-3",
                  isBlack ? "bg-zinc-900" : "bg-neutral-50"
                )}>
                  <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path
                      d="M 5 15 L 25 12 L 50 14 L 75 16 L 95 18"
                      stroke="#10B981"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute top-1 right-2 text-xs font-medium text-emerald-500">+2.3%</div>
                </div>
              </div>
            )}

            {/* Fair Value */}
            {listing.fairValue && (
              <div className="space-y-2">
                <h3 className={cn(
                  "text-sm font-medium",
                  isBlack ? "text-white" : "text-neutral-900"
                )}>
                  Fair Value
                </h3>
                <div className={cn(
                  "h-16 flex items-center justify-center",
                  isBlack ? "bg-zinc-900" : "bg-neutral-50"
                )}>
                  <div className={cn(
                    "text-lg font-bold",
                    isBlack ? "text-white" : "text-neutral-900"
                  )}>
                    {formatPrice(listing.fairValue)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price change indicator */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-500"></div>
            <span className="text-xs text-blue-500">Market Analysis Available</span>
          </div>

          {/* Estimated Value Range */}
          {listing.estimateMin && listing.estimateMax && (
            <div className={cn(
              "space-y-3 p-4 border",
              isBlack 
                ? "bg-zinc-900 border-zinc-800"
                : "bg-neutral-50 border-neutral-200"
            )}>
              <div className={cn(
                "text-xs",
                isBlack ? "text-zinc-400" : "text-neutral-600"
              )}>
                Estimated Value Range
              </div>
              <div className={cn(
                "text-lg font-semibold",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {formatPrice(listing.estimateMin)} - {formatPrice(listing.estimateMax)}
              </div>

              {/* Market Position */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-xs",
                    isBlack ? "text-zinc-400" : "text-neutral-600"
                  )}>
                    Market Position
                  </span>
                  <span className={cn(
                    "text-xs",
                    isBlack ? "text-white" : "text-neutral-900"
                  )}>
                    Fair Price
                  </span>
                </div>
                
                <div className="relative">
                  <div className={cn(
                    "h-1",
                    isBlack 
                      ? "bg-gradient-to-r from-emerald-300/30 via-amber-300/30 to-orange-300/30"
                      : "bg-gradient-to-r from-emerald-200 via-amber-200 to-orange-200"
                  )}></div>
                  <div className="absolute top-0 left-3/4 transform -translate-x-1/2">
                    <div className="w-2 h-2 -mt-0.5 bg-amber-500"></div>
                  </div>
                </div>
                
                <div className={cn(
                  "flex justify-between text-xs",
                  isBlack ? "text-zinc-400" : "text-neutral-500"
                )}>
                  <span>Low</span>
                  <span>Market</span>
                  <span>High</span>
                </div>
              </div>

              {/* Additional metrics */}
              <div className={cn(
                "grid grid-cols-2 gap-4 text-xs pt-2 border-t",
                isBlack ? "border-zinc-800" : "border-neutral-200"
              )}>
                <div className="flex justify-between">
                  <span className={cn(
                    isBlack ? "text-zinc-400" : "text-neutral-600"
                  )}>
                    Price vs Market
                  </span>
                  <span className="text-emerald-500">Fair Value</span>
                </div>
                <div className="flex justify-between">
                  <span className={cn(
                    isBlack ? "text-zinc-400" : "text-neutral-600"
                  )}>
                    Confidence
                  </span>
                  <span className={cn(
                    isBlack ? "text-white" : "text-neutral-900"
                  )}>
                    94%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Specifications */}
      <div className={cn(
        "space-y-4 border-t pt-6",
        isBlack ? "border-zinc-800" : "border-neutral-200"
      )}>
        <h3 className={cn(
          "text-sm font-medium",
          isBlack ? "text-white" : "text-neutral-900"
        )}>
          Specifications
        </h3>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
          {[
            { label: 'Body Type', value: formatEnum(listing.bodyType) },
            { label: 'Transmission', value: formatEnum(listing.transmission) },
            { label: 'Engine Size', value: listing.engineSize },
            { label: 'Engine Type', value: listing.engineType },
            { label: 'Power', value: listing.power },
            { label: 'Torque', value: listing.torque },
            { label: 'Fuel Economy', value: listing.fuelEconomy },
            { label: 'Trim', value: listing.trim },
            { label: 'Fuel Type', value: formatEnum(listing.fuelType) },
            { label: 'Exterior Color', value: listing.exteriorColor },
            { label: 'Interior Color', value: listing.interiorColor },
            { label: 'Cylinders', value: listing.cylinders },
            { label: 'Warranty', value: listing.warranty },
            { label: 'Doors', value: listing.doors },
            { label: 'Seating Capacity', value: listing.seatingCapacity },
            { label: 'Export Status', value: formatEnum(listing.exportStatus) },
            { label: 'Steering Side', value: formatEnum(listing.steeringSide) },
            { label: 'Seller Type', value: formatEnum(listing.sellerType) },
            { label: 'Consignment', value: listing.isConsignment ? 'Yes' : null },
          ].map((item, idx) => item.value && (
            <div 
              key={idx} 
              className={cn(
                "flex justify-between py-1 border-b",
                isBlack ? "border-zinc-800" : "border-neutral-100"
              )}
            >
              <span className={cn(
                isBlack ? "text-zinc-400" : "text-neutral-600"
              )}>
                {item.label}
              </span>
              <span className={cn(
                "font-medium",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Features */}
      {listing.technicalFeatures && Object.keys(listing.technicalFeatures).length > 0 && (
        <div className={cn(
          "space-y-3 border-t pt-6",
          isBlack ? "border-zinc-800" : "border-neutral-200"
        )}>
          <h3 className={cn(
            "text-sm font-medium",
            isBlack ? "text-white" : "text-neutral-900"
          )}>
            Technical Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {Object.entries(listing.technicalFeatures).map(([key, value]) => {
              if (!value) return null;
              
              const label = key.replace(/([A-Z])/g, ' $1').trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              
              const displayValue = typeof value === 'boolean' ? null : value;
              
              return (
                <div key={key} className={cn(
                  "py-1",
                  isBlack ? "text-white" : "text-neutral-900"
                )}>
                  {label}{displayValue && `: ${displayValue}`}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extras */}
      {listing.extras && listing.extras.length > 0 && (
        <div className={cn(
          "space-y-3 border-t pt-6",
          isBlack ? "border-zinc-800" : "border-neutral-200"
        )}>
          <h3 className={cn(
            "text-sm font-medium",
            isBlack ? "text-white" : "text-neutral-900"
          )}>
            Additional Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {listing.extras.map((extra: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className={cn(
                  "w-1 h-1 mt-1.5 flex-shrink-0",
                  isBlack ? "bg-white" : "bg-neutral-900"
                )}></div>
                <span className={cn(
                  "leading-relaxed",
                  isBlack ? "text-zinc-400" : "text-neutral-600"
                )}>
                  {extra}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Notes */}
      {listing.specialNotes && (
        <>
          {(listing.specialNotes.serviceHistory || 
            listing.specialNotes.singleOwner || 
            listing.specialNotes.accidentFree ||
            listing.specialNotes.underWarranty ||
            listing.specialNotes.registeredUntil ||
            (listing.specialNotes.customizations && listing.specialNotes.customizations.length > 0) ||
            (listing.specialNotes.recentServices && listing.specialNotes.recentServices.length > 0) ||
            (listing.specialNotes.knownIssues && listing.specialNotes.knownIssues.length > 0)) && (
            <div className={cn(
              "space-y-3 border-t pt-6",
              isBlack ? "border-zinc-800" : "border-neutral-200"
            )}>
              <h3 className={cn(
                "text-sm font-medium",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                Special Notes
              </h3>
              <ul className="space-y-2 text-xs">
                {listing.specialNotes.serviceHistory && (
                  <li className="flex items-start gap-2">
                    <div className={cn(
                      "w-1 h-1 mt-1.5 flex-shrink-0",
                      isBlack ? "bg-white" : "bg-neutral-900"
                    )}></div>
                    <span className={cn(
                      "leading-relaxed",
                      isBlack ? "text-zinc-400" : "text-neutral-600"
                    )}>
                      Full Service History Available
                    </span>
                  </li>
                )}
                {listing.specialNotes.singleOwner && (
                  <li className="flex items-start gap-2">
                    <div className={cn(
                      "w-1 h-1 mt-1.5 flex-shrink-0",
                      isBlack ? "bg-white" : "bg-neutral-900"
                    )}></div>
                    <span className={cn(
                      "leading-relaxed",
                      isBlack ? "text-zinc-400" : "text-neutral-600"
                    )}>
                      Single Owner
                    </span>
                  </li>
                )}
                {listing.specialNotes.accidentFree && (
                  <li className="flex items-start gap-2">
                    <div className={cn(
                      "w-1 h-1 mt-1.5 flex-shrink-0",
                      isBlack ? "bg-white" : "bg-neutral-900"
                    )}></div>
                    <span className={cn(
                      "leading-relaxed",
                      isBlack ? "text-zinc-400" : "text-neutral-600"
                    )}>
                      Accident Free
                    </span>
                  </li>
                )}
                {listing.specialNotes.underWarranty && (
                  <li className="flex items-start gap-2">
                    <div className={cn(
                      "w-1 h-1 mt-1.5 flex-shrink-0",
                      isBlack ? "bg-white" : "bg-neutral-900"
                    )}></div>
                    <span className={cn(
                      "leading-relaxed",
                      isBlack ? "text-zinc-400" : "text-neutral-600"
                    )}>
                      Under Warranty
                    </span>
                  </li>
                )}
                {listing.specialNotes.registeredUntil && (
                  <li className="flex items-start gap-2">
                    <div className={cn(
                      "w-1 h-1 mt-1.5 flex-shrink-0",
                      isBlack ? "bg-white" : "bg-neutral-900"
                    )}></div>
                    <span className={cn(
                      "leading-relaxed",
                      isBlack ? "text-zinc-400" : "text-neutral-600"
                    )}>
                      Registration Valid Until: {listing.specialNotes.registeredUntil}
                    </span>
                  </li>
                )}
                {listing.specialNotes.customizations && listing.specialNotes.customizations.length > 0 && (
                  listing.specialNotes.customizations.map((item: string, idx: number) => (
                    <li key={`custom-${idx}`} className="flex items-start gap-2">
                      <div className={cn(
                        "w-1 h-1 mt-1.5 flex-shrink-0",
                        isBlack ? "bg-white" : "bg-neutral-900"
                      )}></div>
                      <span className={cn(
                        "leading-relaxed",
                        isBlack ? "text-zinc-400" : "text-neutral-600"
                      )}>
                        {item}
                      </span>
                    </li>
                  ))
                )}
                {listing.specialNotes.recentServices && listing.specialNotes.recentServices.length > 0 && (
                  listing.specialNotes.recentServices.map((item: string, idx: number) => (
                    <li key={`service-${idx}`} className="flex items-start gap-2">
                      <div className={cn(
                        "w-1 h-1 mt-1.5 flex-shrink-0",
                        isBlack ? "bg-white" : "bg-neutral-900"
                      )}></div>
                      <span className={cn(
                        "leading-relaxed",
                        isBlack ? "text-zinc-400" : "text-neutral-600"
                      )}>
                        {item}
                      </span>
                    </li>
                  ))
                )}
                {listing.specialNotes.knownIssues && listing.specialNotes.knownIssues.length > 0 && (
                  <>
                    <li className={cn(
                      "font-medium mt-4",
                      isBlack ? "text-white" : "text-neutral-900"
                    )}>
                      Known Issues:
                    </li>
                    {listing.specialNotes.knownIssues.map((item: string, idx: number) => (
                      <li key={`issue-${idx}`} className="flex items-start gap-2">
                        <div className={cn(
                          "w-1 h-1 mt-1.5 flex-shrink-0",
                          isBlack ? "bg-amber-400" : "bg-amber-600"
                        )}></div>
                        <span className={cn(
                          "leading-relaxed",
                          isBlack ? "text-zinc-400" : "text-neutral-600"
                        )}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Engagement Metrics */}
      {(listing.viewCount > 0 || listing.favouriteCount > 0 || listing.superlikeCount > 0) && (
        <div className={cn(
          "space-y-3 border-t pt-6",
          isBlack ? "border-zinc-800" : "border-neutral-200"
        )}>
          <h3 className={cn(
            "text-sm font-medium",
            isBlack ? "text-white" : "text-neutral-900"
          )}>
            Engagement
          </h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className={cn(
              "p-3 border",
              isBlack ? "border-zinc-800 bg-zinc-900" : "border-neutral-200 bg-neutral-50"
            )}>
              <div className={cn(
                "text-2xl font-bold mb-1",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {formatKilometers(listing.viewCount)}
              </div>
              <div className={cn(
                isBlack ? "text-zinc-400" : "text-neutral-600"
              )}>
                Views
              </div>
            </div>
            <div className={cn(
              "p-3 border",
              isBlack ? "border-zinc-800 bg-zinc-900" : "border-neutral-200 bg-neutral-50"
            )}>
              <div className={cn(
                "text-2xl font-bold mb-1",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {formatKilometers(listing.favouriteCount)}
              </div>
              <div className={cn(
                isBlack ? "text-zinc-400" : "text-neutral-600"
              )}>
                Favorites
              </div>
            </div>
            <div className={cn(
              "p-3 border",
              isBlack ? "border-zinc-800 bg-zinc-900" : "border-neutral-200 bg-neutral-50"
            )}>
              <div className={cn(
                "text-2xl font-bold mb-1",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {formatKilometers(listing.superlikeCount)}
              </div>
              <div className={cn(
                isBlack ? "text-zinc-400" : "text-neutral-600"
              )}>
                Superlikes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Details */}
      <div className={cn(
        "space-y-3 border-t pt-6",
        isBlack ? "border-zinc-800" : "border-neutral-200"
      )}>
        <h3 className={cn(
          "text-sm font-medium",
          isBlack ? "text-white" : "text-neutral-900"
        )}>
          Pricing Details
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className={cn(
              isBlack ? "text-zinc-400" : "text-neutral-600"
            )}>
              Currency
            </span>
            <span className={cn(
              "font-medium",
              isBlack ? "text-white" : "text-neutral-900"
            )}>
              {listing.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={cn(
              isBlack ? "text-zinc-400" : "text-neutral-600"
            )}>
              Price Negotiable
            </span>
            <span className={cn(
              "font-medium",
              isBlack ? "text-white" : "text-neutral-900"
            )}>
              {listing.isNegotiable ? 'Yes' : 'No'}
            </span>
          </div>
          {listing.publishedAt && (
            <div className="flex justify-between">
              <span className={cn(
                isBlack ? "text-zinc-400" : "text-neutral-600"
              )}>
                Listed On
              </span>
              <span className={cn(
                "font-medium",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {new Date(listing.publishedAt).toLocaleDateString('en-AE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
          {listing.updatedAt && (
            <div className="flex justify-between">
              <span className={cn(
                isBlack ? "text-zinc-400" : "text-neutral-600"
              )}>
                Last Updated
              </span>
              <span className={cn(
                "font-medium",
                isBlack ? "text-white" : "text-neutral-900"
              )}>
                {new Date(listing.updatedAt).toLocaleDateString('en-AE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Video Section */}
      {listing.videoUrl && (
        <div className={cn(
          "space-y-3 border-t pt-6",
          isBlack ? "border-zinc-800" : "border-neutral-200"
        )}>
          <h3 className={cn(
            "text-sm font-medium",
            isBlack ? "text-white" : "text-neutral-900"
          )}>
            Video
          </h3>
          <div className="aspect-video w-full">
            <iframe
              src={listing.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title={`${carTitle} Video`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
