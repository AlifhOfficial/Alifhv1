'use client';

import Image from 'next/image';
import Link from 'next/link';
import { carListing } from '@alifh/database';
import { useState } from 'react';

interface CarCardProps {
  listing: typeof carListing.$inferSelect;
}

export function CarCard({ listing }: CarCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: listing.currency || 'AED',
    minimumFractionDigits: 0,
  }).format(listing.price);

  const primaryImage = Array.isArray(listing.images) && listing.images.length > 0
    ? listing.images[0]
    : listing.thumbnail || '/assets/placeholder-car.jpg';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
      {/* Image Section */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {!imageError ? (
          <Image
            src={primaryImage}
            alt={`${listing.make} ${listing.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-6xl">🚗</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {listing.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
          {listing.isBlackMember && (
            <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
              ♦ Black Member
            </span>
          )}
        </div>

        {/* QI Score */}
        {listing.qiScore && listing.qiScore >= 80 && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-3 py-2 rounded-lg">
            QI {listing.qiScore}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title & Year */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {listing.year} {listing.make}
          </h3>
          <p className="text-lg text-gray-600">{listing.model}</p>
          {listing.trim && (
            <p className="text-sm text-gray-500">{listing.trim}</p>
          )}
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div>
            <div className="text-xs text-gray-500 uppercase">Mileage</div>
            <div className="text-sm font-semibold text-gray-900">
              {listing.mileage.toLocaleString()} km
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Fuel</div>
            <div className="text-sm font-semibold text-gray-900 capitalize">
              {listing.fuelType}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Trans.</div>
            <div className="text-sm font-semibold text-gray-900 capitalize">
              {listing.transmission}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span>📍</span> {listing.city || listing.emirate || 'Dubai'}
          </span>
          {listing.engineSize && (
            <span className="flex items-center gap-1">
              <span>⚙️</span> {listing.engineSize}
            </span>
          )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <div className="text-3xl font-bold text-gray-900">{formattedPrice}</div>
            {listing.isNegotiable && (
              <span className="text-xs text-green-600 font-medium">Negotiable</span>
            )}
          </div>
          <Link
            href={`/listing/${listing.slug}`}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            View Details
          </Link>
        </div>

        {/* Engagement Stats */}
        {(listing.viewCount > 0 || listing.favouriteCount > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs text-gray-500">
            {listing.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <span>👁️</span> {listing.viewCount} views
              </span>
            )}
            {listing.favouriteCount > 0 && (
              <span className="flex items-center gap-1">
                <span>❤️</span> {listing.favouriteCount} saves
              </span>
            )}
            {listing.inquiryCount > 0 && (
              <span className="flex items-center gap-1">
                <span>💬</span> {listing.inquiryCount} inquiries
              </span>
            )}
          </div>
        )}

        {/* Toggle All Details Button */}
        <button
          onClick={() => setShowAllDetails(!showAllDetails)}
          className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {showAllDetails ? '▲ Hide All Details' : '▼ Show All Details & Data Points'}
        </button>

        {/* Complete Data Dump */}
        {showAllDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            <h4 className="font-bold text-sm text-gray-900 mb-3">Complete Listing Data</h4>
            
            {/* Core Info */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">CORE INFORMATION</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">ID:</span> {listing.id}</div>
                <div><span className="font-medium">VIN:</span> {listing.vin}</div>
                <div><span className="font-medium">Slug:</span> {listing.slug}</div>
                <div><span className="font-medium">Status:</span> {listing.status}</div>
                <div><span className="font-medium">Partner ID:</span> {listing.partnerId}</div>
                <div><span className="font-medium">Seller Type:</span> {listing.sellerType}</div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">VEHICLE SPECIFICATIONS</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">Make:</span> {listing.make}</div>
                <div><span className="font-medium">Model:</span> {listing.model}</div>
                <div><span className="font-medium">Year:</span> {listing.year}</div>
                <div><span className="font-medium">Trim:</span> {listing.trim || 'N/A'}</div>
                <div><span className="font-medium">Body Type:</span> {listing.bodyType}</div>
                <div><span className="font-medium">Fuel Type:</span> {listing.fuelType}</div>
                <div><span className="font-medium">Transmission:</span> {listing.transmission}</div>
                <div><span className="font-medium">Specs:</span> {listing.specs || 'N/A'}</div>
                <div><span className="font-medium">Steering Side:</span> {listing.steeringSide || 'N/A'}</div>
                <div><span className="font-medium">Engine Size:</span> {listing.engineSize || 'N/A'}</div>
                <div><span className="font-medium">Cylinders:</span> {listing.cylinders || 'N/A'}</div>
                <div><span className="font-medium">Doors:</span> {listing.doors || 'N/A'}</div>
                <div><span className="font-medium">Seating:</span> {listing.seatingCapacity || 'N/A'}</div>
                <div><span className="font-medium">Mileage:</span> {listing.mileage.toLocaleString()} km</div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">PRICING & VALUATION</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">Price:</span> {formattedPrice}</div>
                <div><span className="font-medium">Currency:</span> {listing.currency}</div>
                <div><span className="font-medium">Negotiable:</span> {listing.isNegotiable ? 'Yes' : 'No'}</div>
                <div><span className="font-medium">Fair Value:</span> {listing.fairValue || 'N/A'}</div>
                <div><span className="font-medium">Est. Min:</span> {listing.estimateMin || 'N/A'}</div>
                <div><span className="font-medium">Est. Max:</span> {listing.estimateMax || 'N/A'}</div>
                <div><span className="font-medium">Price Trend:</span> {listing.priceTrend || 'N/A'}</div>
                <div><span className="font-medium">Price Changes:</span> {listing.priceChanges}</div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">LOCATION</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">Emirate:</span> {listing.emirate || 'N/A'}</div>
                <div><span className="font-medium">City:</span> {listing.city || 'N/A'}</div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">ENGAGEMENT & ANALYTICS</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">View Count:</span> {listing.viewCount}</div>
                <div><span className="font-medium">Favourite Count:</span> {listing.favouriteCount}</div>
                <div><span className="font-medium">Superlike Count:</span> {listing.superlikeCount}</div>
                <div><span className="font-medium">Share Count:</span> {listing.shareCount}</div>
                <div><span className="font-medium">Inquiry Count:</span> {listing.inquiryCount}</div>
                <div><span className="font-medium">Booking Count:</span> {listing.bookingCount}</div>
                <div><span className="font-medium">Call Count:</span> {listing.callCount}</div>
                <div><span className="font-medium">WhatsApp Count:</span> {listing.whatsappCount}</div>
              </div>
            </div>

            {/* Performance */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">PERFORMANCE METRICS</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">QI Score:</span> {listing.qiScore || 'N/A'}</div>
                <div><span className="font-medium">Performance Score:</span> {listing.performanceScore || 'N/A'}</div>
                <div><span className="font-medium">Days on Market:</span> {listing.daysOnMarket || 'N/A'}</div>
                <div><span className="font-medium">Lead Quality:</span> {listing.leadQuality || 'N/A'}</div>
                <div><span className="font-medium">Conversion Rate:</span> {listing.conversionRate ? `${listing.conversionRate}%` : 'N/A'}</div>
                <div><span className="font-medium">Avg Time to Sale:</span> {listing.avgTimeToSale || 'N/A'}</div>
              </div>
            </div>

            {/* Premium Features */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">PREMIUM FEATURES</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">Featured:</span> {listing.isFeatured ? '✅ Yes' : '❌ No'}</div>
                <div><span className="font-medium">Black Member:</span> {listing.isBlackMember ? '✅ Yes' : '❌ No'}</div>
                <div><span className="font-medium">Consignment:</span> {listing.isConsignment ? '✅ Yes' : '❌ No'}</div>
                <div><span className="font-medium">Export Status:</span> {listing.exportStatus || 'N/A'}</div>
              </div>
            </div>

            {/* Media */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">MEDIA</div>
              <div className="text-xs space-y-1">
                <div><span className="font-medium">Thumbnail:</span> {listing.thumbnail || 'N/A'}</div>
                <div><span className="font-medium">Images:</span> {Array.isArray(listing.images) ? listing.images.length : 0} images</div>
                <div><span className="font-medium">Video URL:</span> {listing.videoUrl || 'N/A'}</div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">DESCRIPTION</div>
                <div className="text-xs text-gray-600">{listing.description}</div>
              </div>
            )}

            {/* Technical Features */}
            {listing.technicalFeatures && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">TECHNICAL FEATURES</div>
                <div className="text-xs text-gray-600">
                  {Array.isArray(listing.technicalFeatures) 
                    ? listing.technicalFeatures.join(', ') 
                    : typeof listing.technicalFeatures === 'object'
                    ? JSON.stringify(listing.technicalFeatures)
                    : String(listing.technicalFeatures)}
                </div>
              </div>
            )}

            {/* Extras */}
            {listing.extras && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">EXTRAS</div>
                <div className="text-xs text-gray-600">
                  {Array.isArray(listing.extras) 
                    ? listing.extras.join(', ') 
                    : typeof listing.extras === 'object'
                    ? JSON.stringify(listing.extras)
                    : String(listing.extras)}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">TIMESTAMPS</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div><span className="font-medium">Created:</span> {new Date(listing.createdAt).toLocaleString()}</div>
                <div><span className="font-medium">Updated:</span> {new Date(listing.updatedAt).toLocaleString()}</div>
                {listing.publishedAt && <div><span className="font-medium">Published:</span> {new Date(listing.publishedAt).toLocaleString()}</div>}
                {listing.lastPriceChange && <div><span className="font-medium">Last Price Change:</span> {new Date(listing.lastPriceChange).toLocaleString()}</div>}
              </div>
            </div>

            {/* SEO */}
            {(listing.metaTitle || listing.metaDescription) && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">SEO METADATA</div>
                <div className="text-xs space-y-1">
                  {listing.metaTitle && <div><span className="font-medium">Meta Title:</span> {listing.metaTitle}</div>}
                  {listing.metaDescription && <div><span className="font-medium">Meta Description:</span> {listing.metaDescription}</div>}
                </div>
              </div>
            )}

            {/* Tags & Badges */}
            {(listing.tags || listing.badges) && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2">TAGS & BADGES</div>
                <div className="text-xs space-y-1">
                  {listing.tags && (
                    <div>
                      <span className="font-medium">Tags:</span>{' '}
                      {Array.isArray(listing.tags) 
                        ? listing.tags.join(', ') 
                        : typeof listing.tags === 'object'
                        ? JSON.stringify(listing.tags)
                        : String(listing.tags)}
                    </div>
                  )}
                  {listing.badges && (
                    <div>
                      <span className="font-medium">Badges:</span>{' '}
                      {Array.isArray(listing.badges) 
                        ? listing.badges.join(', ') 
                        : typeof listing.badges === 'object'
                        ? JSON.stringify(listing.badges)
                        : String(listing.badges)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
