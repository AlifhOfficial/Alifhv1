/**
 * Car Selector - Search and add cars to comparison
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, Plus, X, Loader2, FileKey2 } from 'lucide-react';
import { useCompare, MAX_COMPARE } from './compare-context';
import { cn } from '@/utils';

// VIN validation - 17 alphanumeric chars, no I, O, Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

function isValidVin(value: string): boolean {
  return VIN_REGEX.test(value.replace(/\s/g, ''));
}

interface SearchResult {
  id: string;
  slug: string | null;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  mileage: number;
  images: string[];
  thumbnail: string | null;
  emirate: string;
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMileage = (km: number) => {
  return new Intl.NumberFormat('en-US').format(km) + ' km';
};

export function CarSelector() {
  const { addCar, isInCompare, canAdd, items } = useCompare();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [vinResult, setVinResult] = useState<SearchResult | null>(null);
  const [isVinSearching, setIsVinSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // VIN lookup effect
  useEffect(() => {
    const trimmedQuery = query.trim().replace(/\s/g, '');
    
    if (isValidVin(trimmedQuery)) {
      setIsVinSearching(true);
      setVinResult(null);
      
      fetch(`/api/listings/check-vin?vin=${encodeURIComponent(trimmedQuery)}`)
        .then(res => res.json())
        .then(async data => {
          if (data.existingListing && data.existingListing.lifecycleStatus !== 'deleted') {
            // Fetch the full listing details to get image and price
            try {
              const detailRes = await fetch(`/api/listings/${data.existingListing.id}/detailed`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                const listing = detailData.listing;
                setVinResult({
                  id: listing.id,
                  slug: listing.slug,
                  year: listing.year,
                  make: listing.make,
                  model: listing.model,
                  trim: listing.trim,
                  price: listing.price,
                  mileage: listing.mileage,
                  images: listing.images || [],
                  thumbnail: listing.thumbnail,
                  emirate: listing.emirate,
                });
              }
            } catch (e) {
              console.error('Failed to fetch listing details:', e);
            }
          }
        })
        .catch(() => {})
        .finally(() => setIsVinSearching(false));
    } else {
      setVinResult(null);
    }
  }, [query]);

  // Search with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        // Use the search endpoint with q parameter
        const res = await fetch(`/api/listings/search?q=${encodeURIComponent(query)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          // Search returns { data, facets, meta }
          setResults(data.data || []);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleAdd = (car: SearchResult) => {
    addCar(car.id);
    setQuery('');
    setResults([]);
    if (items.length + 1 >= MAX_COMPARE) {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setVinResult(null);
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!canAdd) return null;

  return (
    <>
      {/* Add Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-600 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add car to compare
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/40 backdrop-blur-2xl"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-background border border-border/40 rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-border/30">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by make, model, year, or VIN..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
              {(isSearching || isVinSearching) && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
              <button onClick={handleClose} className="p-1 hover:opacity-70">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* VIN Result */}
              {vinResult && (
                <div className="border-b border-blue-500/20 bg-blue-500/5">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <FileKey2 className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[11px] font-medium text-blue-500 uppercase tracking-wider">VIN Match</span>
                  </div>
                  <button
                    onClick={() => !isInCompare(vinResult.id) && handleAdd(vinResult)}
                    disabled={isInCompare(vinResult.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 text-left transition-colors",
                      isInCompare(vinResult.id)
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-blue-500/10"
                    )}
                  >
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
                      <Image
                        src={vinResult.thumbnail || vinResult.images[0] || '/assets/cars/placeholder.avif'}
                        alt={`${vinResult.year} ${vinResult.make} ${vinResult.model}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {vinResult.year} {vinResult.make} {vinResult.model}
                        {vinResult.trim && <span className="text-muted-foreground"> {vinResult.trim}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatMileage(vinResult.mileage)} • {vinResult.emirate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(vinResult.price)}
                      </span>
                      {isInCompare(vinResult.id) ? (
                        <span className="text-xs text-muted-foreground">Added</span>
                      ) : (
                        <Plus className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </button>
                </div>
              )}

              {results.length === 0 && query.trim() && !isSearching && !vinResult && !isVinSearching && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No cars found for &quot;{query}&quot;
                </div>
              )}

              {results.length === 0 && !query.trim() && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Start typing to search for cars
                </div>
              )}

              {results.map((car) => {
                const alreadyAdded = isInCompare(car.id);
                
                return (
                  <button
                    key={car.id}
                    onClick={() => !alreadyAdded && handleAdd(car)}
                    disabled={alreadyAdded}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 border-b border-border/20 text-left transition-colors",
                      alreadyAdded 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-muted/30"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
                      <Image
                        src={car.thumbnail || car.images[0] || '/assets/cars/placeholder.avif'}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {car.year} {car.make} {car.model}
                        {car.trim && <span className="text-muted-foreground"> {car.trim}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatMileage(car.mileage)} • {car.emirate}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(car.price)}
                      </span>
                      {alreadyAdded ? (
                        <span className="text-xs text-muted-foreground">Added</span>
                      ) : (
                        <Plus className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-border/30 bg-muted/10">
              <p className="text-[11px] text-muted-foreground/60 text-center">
                You can compare up to {MAX_COMPARE} cars • {MAX_COMPARE - items.length} slot{MAX_COMPARE - items.length !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
