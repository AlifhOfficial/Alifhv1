/**
 * Car Detail Page Component - Alifh Design System
 * Following "Less is More" principle with minimalist aesthetic
 * Matches car-card design language
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Sparkles, 
  Phone, 
  MessageCircle,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Eye,
  CheckCircle2,
  AlertCircle,
  Shield,
  Award,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useListingDetail, formatPrice, formatMileage } from '@/hooks/use-listing-detail';
import { useFavorites } from '@/hooks/favorites';
import { cn } from '@/utils';

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  
  const { data: listing, isLoading, error } = useListingDetail(listingId);
  const {
    isFavorite,
    isSuperliked,
    toggleFavorite,
    toggleSuperlike,
  } = useFavorites(listingId);
  
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Listing Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }
  
  const isBlack = listing.isBlackMember;
  const images = listing.images.length > 0 ? listing.images : [listing.thumbnail || '/assets/cars/car1.avif'];
  const carTitle = `${listing.year} ${listing.make} ${listing.model}`;
  
  // Format enums to display text
  const formatEnum = (value: string | null) => {
    if (!value) return null;
    return value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Price trend indicator
  const getPriceTrendIcon = () => {
    if (listing.priceTrend === 'below_market') return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (listing.priceTrend === 'above_market') return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className={cn(
      "min-h-screen",
      isBlack ? "bg-black" : "bg-background"
    )}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-sm",
        isBlack 
          ? "bg-black/80 border-zinc-800" 
          : "bg-background/80 border-border/40"
      )}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                isBlack
                  ? "text-zinc-400 hover:text-zinc-200"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isFavorite
                    ? "text-rose-500"
                    : isBlack
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart
                  className="h-5 w-5"
                  fill={isFavorite ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
              
              <button
                onClick={toggleSuperlike}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isSuperliked
                    ? "text-yellow-500"
                    : isBlack
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles
                  className="h-5 w-5"
                  fill={isSuperliked ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
              
              <button
                className={cn(
                  "rounded-full p-2 transition-colors",
                  isBlack
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className={cn(
              "rounded-xl overflow-hidden border",
              isBlack ? "bg-zinc-900 border-zinc-800" : "bg-card border-border/40"
            )}>
              {/* Main Image */}
              <div className="relative aspect-[16/10] bg-muted/20">
                <Image
                  src={images[selectedImage]}
                  alt={carTitle}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {isBlack && (
                    <div className="px-3 py-1.5 bg-black border border-black">
                      <span className="text-xs font-bold text-white tracking-widest">BLK</span>
                    </div>
                  )}
                  {listing.qiScore && (
                    <div className="px-3 py-1.5 rounded bg-black/60 backdrop-blur-sm">
                      <span className="text-xs font-medium text-white/90">QI {Math.round(listing.qiScore)}</span>
                    </div>
                  )}
                </div>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded bg-black/60 backdrop-blur-sm">
                  <span className="text-xs font-medium text-white/90">
                    {selectedImage + 1} / {images.length}
                  </span>
                </div>
              </div>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "relative w-20 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all",
                        selectedImage === idx
                          ? "border-primary ring-1 ring-primary"
                          : isBlack
                            ? "border-zinc-800 hover:border-zinc-700"
                            : "border-border/40 hover:border-border/60"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`View ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h1 className={cn(
                "text-3xl font-bold tracking-tight mb-2",
                isBlack ? "text-white" : "text-foreground"
              )}>
                {carTitle}
              </h1>
              {listing.trim && (
                <p className={cn(
                  "text-lg",
                  isBlack ? "text-zinc-400" : "text-muted-foreground"
                )}>
                  {listing.trim}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-4">
                <p className={cn(
                  "text-3xl font-bold",
                  isBlack ? "text-white" : "text-foreground"
                )}>
                  {formatPrice(listing.price)}
                </p>
                {listing.isNegotiable && (
                  <span className={cn(
                    "text-sm px-3 py-1 rounded-full border",
                    isBlack
                      ? "text-zinc-400 border-zinc-800"
                      : "text-muted-foreground border-border/40"
                  )}>
                    Negotiable
                  </span>
                )}
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className={cn(
              "grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border",
              isBlack
                ? "bg-zinc-900 border-zinc-800"
                : "bg-card border-border/40"
            )}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className={cn(
                    "h-4 w-4",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/60"
                  )} />
                  <p className={cn(
                    "text-xs uppercase tracking-wider font-medium",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/70"
                  )}>
                    Mileage
                  </p>
                </div>
                <p className={cn(
                  "text-lg font-bold",
                  isBlack ? "text-zinc-100" : "text-foreground"
                )}>
                  {formatMileage(listing.mileage)} km
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className={cn(
                    "h-4 w-4",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/60"
                  )} />
                  <p className={cn(
                    "text-xs uppercase tracking-wider font-medium",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/70"
                  )}>
                    Transmission
                  </p>
                </div>
                <p className={cn(
                  "text-lg font-bold capitalize",
                  isBlack ? "text-zinc-100" : "text-foreground"
                )}>
                  {formatEnum(listing.transmission)}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Fuel className={cn(
                    "h-4 w-4",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/60"
                  )} />
                  <p className={cn(
                    "text-xs uppercase tracking-wider font-medium",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/70"
                  )}>
                    Fuel Type
                  </p>
                </div>
                <p className={cn(
                  "text-lg font-bold capitalize",
                  isBlack ? "text-zinc-100" : "text-foreground"
                )}>
                  {formatEnum(listing.fuelType)}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className={cn(
                    "h-4 w-4",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/60"
                  )} />
                  <p className={cn(
                    "text-xs uppercase tracking-wider font-medium",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/70"
                  )}>
                    Location
                  </p>
                </div>
                <p className={cn(
                  "text-lg font-bold",
                  isBlack ? "text-zinc-100" : "text-foreground"
                )}>
                  {listing.emirate}
                </p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className={cn(
                "p-6 rounded-xl border",
                isBlack
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-card border-border/40"
              )}>
                <h2 className={cn(
                  "text-lg font-bold mb-4",
                  isBlack ? "text-white" : "text-foreground"
                )}>
                  Description
                </h2>
                <p className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  isBlack ? "text-zinc-300" : "text-muted-foreground"
                )}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Vehicle Specifications */}
            <div className={cn(
              "p-6 rounded-xl border",
              isBlack
                ? "bg-zinc-900 border-zinc-800"
                : "bg-card border-border/40"
            )}>
              <h2 className={cn(
                "text-lg font-bold mb-4",
                isBlack ? "text-white" : "text-foreground"
              )}>
                Vehicle Specifications
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'VIN', value: listing.vin },
                  { label: 'Body Type', value: formatEnum(listing.bodyType) },
                  { label: 'Year', value: listing.year },
                  { label: 'Engine', value: listing.engineType },
                  { label: 'Engine Size', value: listing.engineSize },
                  { label: 'Cylinders', value: listing.cylinders },
                  { label: 'Power', value: listing.power },
                  { label: 'Torque', value: listing.torque },
                  { label: 'Fuel Economy', value: listing.fuelEconomy },
                  { label: 'Doors', value: listing.doors },
                  { label: 'Seating', value: `${listing.seatingCapacity} seats` },
                  { label: 'Exterior Color', value: listing.exteriorColor },
                  { label: 'Interior Color', value: listing.interiorColor },
                  { label: 'Steering Side', value: formatEnum(listing.steeringSide) },
                  { label: 'Specs', value: formatEnum(listing.specs) },
                  { label: 'Export Status', value: formatEnum(listing.exportStatus) },
                ].map((item, idx) => item.value && (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className={cn(
                      "text-sm",
                      isBlack ? "text-zinc-400" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    <span className={cn(
                      "text-sm font-semibold",
                      isBlack ? "text-zinc-200" : "text-foreground"
                    )}>
                      {item.value}
                    </span>
                  </div>
                ))}
                
                {listing.warranty && (
                  <div className="flex justify-between items-start py-2 border-b border-border/20 md:col-span-2">
                    <span className={cn(
                      "text-sm",
                      isBlack ? "text-zinc-400" : "text-muted-foreground"
                    )}>
                      Warranty
                    </span>
                    <span className={cn(
                      "text-sm font-semibold text-right max-w-xs",
                      isBlack ? "text-zinc-200" : "text-foreground"
                    )}>
                      {listing.warranty}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Features */}
            {Object.keys(listing.technicalFeatures).length > 0 && (
              <div className={cn(
                "p-6 rounded-xl border",
                isBlack
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-card border-border/40"
              )}>
                <h2 className={cn(
                  "text-lg font-bold mb-4",
                  isBlack ? "text-white" : "text-foreground"
                )}>
                  Features & Equipment
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(listing.technicalFeatures).map(([key, value]) => {
                    if (!value) return null;
                    
                    const label = key.replace(/([A-Z])/g, ' $1').trim()
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                    
                    const displayValue = typeof value === 'boolean' ? null : value;
                    
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <CheckCircle2 className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isBlack ? "text-zinc-400" : "text-primary"
                        )} />
                        <span className={cn(
                          "text-sm",
                          isBlack ? "text-zinc-300" : "text-foreground"
                        )}>
                          {label}
                          {displayValue && `: ${displayValue}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Notes */}
            {Object.keys(listing.specialNotes).length > 0 && (
              <div className={cn(
                "p-6 rounded-xl border",
                isBlack
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-card border-border/40"
              )}>
                <h2 className={cn(
                  "text-lg font-bold mb-4",
                  isBlack ? "text-white" : "text-foreground"
                )}>
                  Additional Information
                </h2>
                
                <div className="space-y-3">
                  {listing.specialNotes.serviceHistory && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className={cn(
                        "text-sm",
                        isBlack ? "text-zinc-300" : "text-foreground"
                      )}>
                        Full Service History Available
                      </span>
                    </div>
                  )}
                  
                  {listing.specialNotes.singleOwner && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span className={cn(
                        "text-sm",
                        isBlack ? "text-zinc-300" : "text-foreground"
                      )}>
                        Single Owner
                      </span>
                    </div>
                  )}
                  
                  {listing.specialNotes.accidentFree && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className={cn(
                        "text-sm",
                        isBlack ? "text-zinc-300" : "text-foreground"
                      )}>
                        Accident Free
                      </span>
                    </div>
                  )}
                  
                  {listing.specialNotes.registeredUntil && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          isBlack ? "text-zinc-300" : "text-foreground"
                        )}>
                          Registration Valid Until
                        </p>
                        <p className={cn(
                          "text-xs",
                          isBlack ? "text-zinc-400" : "text-muted-foreground"
                        )}>
                          {listing.specialNotes.registeredUntil}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {listing.specialNotes.customizations && listing.specialNotes.customizations.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Settings className="h-4 w-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className={cn(
                          "text-sm font-medium mb-1",
                          isBlack ? "text-zinc-300" : "text-foreground"
                        )}>
                          Customizations
                        </p>
                        <ul className="space-y-1">
                          {listing.specialNotes.customizations.map((item, idx) => (
                            <li key={idx} className={cn(
                              "text-xs",
                              isBlack ? "text-zinc-400" : "text-muted-foreground"
                            )}>
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {listing.specialNotes.recentServices && listing.specialNotes.recentServices.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className={cn(
                          "text-sm font-medium mb-1",
                          isBlack ? "text-zinc-300" : "text-foreground"
                        )}>
                          Recent Services
                        </p>
                        <ul className="space-y-1">
                          {listing.specialNotes.recentServices.map((item, idx) => (
                            <li key={idx} className={cn(
                              "text-xs",
                              isBlack ? "text-zinc-400" : "text-muted-foreground"
                            )}>
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Seller Info & CTA */}
          <div className="space-y-6">
            {/* AI Valuation */}
            {listing.fairValue && (
              <div className={cn(
                "p-6 rounded-xl border",
                isBlack
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-card border-border/40"
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className={cn(
                    "font-bold",
                    isBlack ? "text-white" : "text-foreground"
                  )}>
                    AI Price Analysis
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className={cn(
                      "text-xs uppercase tracking-wider mb-1",
                      isBlack ? "text-zinc-500" : "text-muted-foreground/70"
                    )}>
                      Fair Market Value
                    </p>
                    <p className={cn(
                      "text-xl font-bold",
                      isBlack ? "text-zinc-100" : "text-foreground"
                    )}>
                      {formatPrice(listing.fairValue)}
                    </p>
                  </div>
                  
                  {listing.estimateMin && listing.estimateMax && (
                    <div>
                      <p className={cn(
                        "text-xs uppercase tracking-wider mb-1",
                        isBlack ? "text-zinc-500" : "text-muted-foreground/70"
                      )}>
                        Market Range
                      </p>
                      <p className={cn(
                        "text-sm font-semibold",
                        isBlack ? "text-zinc-300" : "text-foreground"
                      )}>
                        {formatPrice(listing.estimateMin)} - {formatPrice(listing.estimateMax)}
                      </p>
                    </div>
                  )}
                  
                  {listing.priceTrend && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                      {getPriceTrendIcon()}
                      <span className={cn(
                        "text-sm capitalize",
                        isBlack ? "text-zinc-300" : "text-foreground"
                      )}>
                        {formatEnum(listing.priceTrend)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Seller Card */}
            <div className={cn(
              "p-6 rounded-xl border sticky top-24",
              isBlack
                ? "bg-zinc-900 border-zinc-800"
                : "bg-card border-border/40"
            )}>
              <h3 className={cn(
                "font-bold mb-4",
                isBlack ? "text-white" : "text-foreground"
              )}>
                Seller Information
              </h3>
              
              {/* Partner Info */}
              {listing.partnerName && (
                <div className="flex items-start gap-3 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    isBlack ? "bg-zinc-800" : "bg-muted"
                  )}>
                    <span className={cn(
                      "text-sm font-bold",
                      isBlack ? "text-zinc-400" : "text-muted-foreground"
                    )}>
                      {listing.partnerName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-semibold truncate",
                        isBlack ? "text-white" : "text-foreground"
                      )}>
                        {listing.partnerName}
                      </p>
                      {listing.partnerVerified && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-1 capitalize",
                      isBlack ? "text-zinc-400" : "text-muted-foreground"
                    )}>
                      {formatEnum(listing.sellerType)}
                    </p>
                    {listing.partnerCity && (
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className={cn(
                          "text-xs",
                          isBlack ? "text-zinc-400" : "text-muted-foreground"
                        )}>
                          {listing.partnerCity}, {listing.partnerEmirate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* CTA Buttons */}
              <div className="space-y-3">
                {listing.partnerPhone && (
                  <a
                    href={`tel:${listing.partnerPhone}`}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Phone className="h-4 w-4" />
                    Call Seller
                  </a>
                )}
                
                {listing.partnerPhone && (
                  <a
                    href={`https://wa.me/${listing.partnerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors",
                      isBlack
                        ? "border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                        : "border-border/40 hover:bg-muted/20 text-foreground"
                    )}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
              </div>
              
              {/* Stats */}
              <div className={cn(
                "flex items-center justify-around pt-6 mt-6 border-t",
                isBlack ? "border-zinc-800" : "border-border/20"
              )}>
                <div className="text-center">
                  <Eye className={cn(
                    "h-4 w-4 mx-auto mb-1",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/60"
                  )} />
                  <p className={cn(
                    "text-xs",
                    isBlack ? "text-zinc-400" : "text-muted-foreground"
                  )}>
                    {listing.viewCount} views
                  </p>
                </div>
                
                <div className="text-center">
                  <Heart className={cn(
                    "h-4 w-4 mx-auto mb-1",
                    isBlack ? "text-zinc-500" : "text-muted-foreground/60"
                  )} />
                  <p className={cn(
                    "text-xs",
                    isBlack ? "text-zinc-400" : "text-muted-foreground"
                  )}>
                    {listing.favouriteCount} saved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
