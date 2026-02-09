'use client';

/**
 * SearchBar - Basic tier search component
 * 
 * Features:
 * - Auto-suggest as you type
 * - Keyboard navigation
 * - Mobile-friendly
 * - Accessible
 * 
 * @module components/search/search-bar
 */

import { useState, useRef, useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, FileKey2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchParamsToUrl, type SearchParams } from '@/lib/search-utils';
import { useQuickSearch } from '@/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';

// VIN validation - 17 alphanumeric chars, no I, O, Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;
const VIN_PARTIAL_REGEX = /^[A-HJ-NPR-Z0-9]{8,17}$/i;

function isValidVin(value: string): boolean {
  return VIN_REGEX.test(value.replace(/\s/g, ''));
}

function isPartialVin(value: string): boolean {
  const cleaned = value.replace(/\s/g, '');
  return VIN_PARTIAL_REGEX.test(cleaned) && cleaned.length >= 10;
}

// VIN lookup cache and subscription store
type VinResult = {
  loading: boolean;
  listing: { id: string; slug?: string; make: string; model: string; year: number } | null;
  vin: string;
} | null;

const vinCache = new Map<string, VinResult>();
const vinListeners = new Set<() => void>();

function notifyVinListeners() {
  vinListeners.forEach(listener => listener());
}

function subscribeVinStore(callback: () => void) {
  vinListeners.add(callback);
  return () => vinListeners.delete(callback);
}

async function lookupVin(vin: string): Promise<void> {
  if (vinCache.has(vin) && !vinCache.get(vin)?.loading) return;
  
  vinCache.set(vin, { loading: true, listing: null, vin });
  notifyVinListeners();
  
  try {
    const res = await fetch(`/api/listings/check-vin?vin=${encodeURIComponent(vin)}`);
    const data = await res.json();
    
    if (data.existingListing && data.existingListing.lifecycleStatus !== 'deleted') {
      vinCache.set(vin, { loading: false, listing: data.existingListing, vin });
    } else {
      vinCache.set(vin, { loading: false, listing: null, vin });
    }
  } catch {
    vinCache.set(vin, { loading: false, listing: null, vin });
  }
  
  notifyVinListeners();
}

function useVinLookup(query: string): VinResult {
  const trimmedVin = query.trim().replace(/\s/g, '').toUpperCase();
  const isVinValid = isValidVin(trimmedVin);
  
  const getSnapshot = useCallback(() => {
    if (!isVinValid) return null;
    return vinCache.get(trimmedVin) ?? null;
  }, [trimmedVin, isVinValid]);
  
  const result = useSyncExternalStore(subscribeVinStore, getSnapshot, getSnapshot);
  
  // Trigger VIN lookup when a valid VIN is detected and not already cached
  // Using useEffect is the correct pattern for side effects
  useEffect(() => {
    if (isVinValid && !vinCache.has(trimmedVin)) {
      lookupVin(trimmedVin);
    }
  }, [trimmedVin, isVinValid]);
  
  return result;
}

interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show on mobile */
  className?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Callback when search is submitted */
  onSearch?: (filters: Partial<SearchParams>) => void;
  /** Redirect to listings page on search */
  redirectOnSearch?: boolean;
  /** Callback when input is focused */
  onFocus?: () => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
}

export function SearchBar({
  placeholder = 'Search make, model, dealer, feature...',
  size = 'md',
  className,
  autoFocus = false,
  onSearch,
  redirectOnSearch = true,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Simple search term - just use the query directly
  const searchTerm = query.trim();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Get suggestions - no context, always show makes/models/partners
  const { suggestions: apiSuggestions, isLoading } = useQuickSearch(debouncedSearchTerm, isFocused);
  
  // VIN lookup using external store pattern (no setState in effect)
  const vinLookup = useVinLookup(query);
  
  // Build combined suggestions with VIN result at top
  const suggestions = useMemo(() => {
    // If we have a VIN lookup result (loading or complete)
    if (vinLookup) {
      const vinSuggestion = vinLookup.listing
        ? {
            type: 'vin_listing' as const,
            text: `${vinLookup.listing.year} ${vinLookup.listing.make} ${vinLookup.listing.model}`,
            vin: vinLookup.vin,
            listingId: vinLookup.listing.id,
            listingSlug: vinLookup.listing.slug,
            count: 1,
          }
        : {
            type: 'vin_decode' as const,
            text: vinLookup.vin,
            count: 0,
          };
      
      return [vinSuggestion, ...apiSuggestions];
    }
    
    // Check for partial VIN
    const trimmedQuery = query.trim().replace(/\s/g, '');
    if (isPartialVin(trimmedQuery) && !isValidVin(trimmedQuery)) {
      return [{
        type: 'vin_partial' as const,
        text: trimmedQuery.toUpperCase(),
        count: 0,
      }, ...apiSuggestions];
    }
    
    return apiSuggestions;
  }, [query, apiSuggestions, vinLookup]);
  
  // Show dropdown when focused and has suggestions or loading
  const showDropdown = isFocused && (suggestions.length > 0 || isLoading || vinLookup?.loading);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string, filters?: Partial<SearchParams>) => {
    // Build filters object for callback
    const searchFilters: Partial<SearchParams> = {
      // Clear all search-related filters
      q: undefined,
      make: undefined,
      model: undefined,
      trim: undefined,
      partnerId: undefined,
      partnerName: undefined,
      tags: undefined,
      extras: undefined,
    };
    
    // Merge in provided filters
    if (filters) {
      Object.assign(searchFilters, filters);
    } else if (searchQuery && searchQuery.trim()) {
      // Fallback to text search
      searchFilters.q = searchQuery.trim();
    }
    
    if (onSearch) {
      onSearch(searchFilters);
    }
    
    if (redirectOnSearch) {
      // Build proper SearchParams object from merged filters
      const searchParams: SearchParams = {};
      
      if (filters) {
        // Copy all non-undefined filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            (searchParams as any)[key] = value;
          }
        });
      } else if (searchQuery && searchQuery.trim()) {
        searchParams.q = searchQuery.trim();
      }
      
      // Use utility function to convert to URL params
      const urlParams = searchParamsToUrl(searchParams);
      router.push(`/listings${urlParams.toString() ? `?${urlParams.toString()}` : ''}`);
    }
    
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  }, [onSearch, redirectOnSearch, router]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: typeof suggestions[0]) => {
    if (suggestion.type === 'vin_listing') {
      // Go directly to the listing
      const slug = suggestion.listingSlug || suggestion.listingId;
      router.push(`/listings/${slug}`);
      setQuery('');
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (suggestion.type === 'vin_decode' || suggestion.type === 'vin_partial') {
      // Redirect to VIN decoder
      router.push(`/tools/vin-decoder?vin=${encodeURIComponent(suggestion.text)}`);
      setQuery('');
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (suggestion.type === 'partner') {
      handleSearch(suggestion.text, { partnerId: suggestion.partnerId, partnerName: suggestion.partnerName });
    } else if (suggestion.type === 'tag') {
      handleSearch('', { tags: [suggestion.tag!] });
    } else if (suggestion.type === 'extra') {
      handleSearch('', { extras: [suggestion.extra!] });
    } else if (suggestion.type === 'bodyType') {
      handleSearch('', { bodyType: [suggestion.bodyType!] });
    } else if (suggestion.type === 'fuelType') {
      handleSearch('', { fuelType: [suggestion.fuelType!] });
    } else if (suggestion.type === 'transmission') {
      handleSearch('', { transmission: [suggestion.transmission!] });
    } else if (suggestion.type === 'specs') {
      handleSearch('', { specs: [suggestion.specs!] });
    } else if (suggestion.type === 'condition') {
      handleSearch('', { condition: suggestion.condition });
    } else if (suggestion.type === 'sellerType') {
      handleSearch('', { sellerType: suggestion.sellerType });
    } else if (suggestion.type === 'make_model_trim') {
      handleSearch('', { make: [suggestion.make!], model: [suggestion.model!], trim: [suggestion.trim!] });
    } else if (suggestion.type === 'make_model') {
      handleSearch('', { make: [suggestion.make!], model: [suggestion.model!] });
    } else if (suggestion.type === 'make') {
      handleSearch('', { make: [suggestion.make || suggestion.text] });
    } else {
      handleSearch(suggestion.text);
    }
  }, [handleSearch, router]);

  // Clamp selectedIndex if it exceeds suggestions length (derived state)
  const clampedSelectedIndex = selectedIndex >= suggestions.length ? -1 : selectedIndex;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'Enter' && query.trim()) {
        // Simple text search
        handleSearch(query.trim());
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (clampedSelectedIndex >= 0 && suggestions[clampedSelectedIndex]) {
          handleSuggestionClick(suggestions[clampedSelectedIndex]);
        } else if (query.trim()) {
          // Simple text search
          handleSearch(query.trim());
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  }, [showDropdown, suggestions, clampedSelectedIndex, query, handleSearch, handleSuggestionClick]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Size classes - use text-base (16px) on mobile to prevent iOS auto-zoom
  const sizeClasses = {
    sm: 'h-10 text-base sm:text-sm px-1',
    md: 'h-12 sm:h-11 text-base sm:text-sm px-1',
    lg: 'h-14 sm:h-12 text-base px-2',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Category colors matching mobile scheme
  const SUGGESTION_COLORS: Record<string, string> = {
    make: '#3B82F6',
    model: '#3B82F6',
    make_model: '#3B82F6',
    make_model_trim: '#3B82F6',
    partner: '#EAB308',
    tag: '#22C55E',
    extra: '#A855F7',
    bodyType: '#F97316',
    fuelType: '#F97316',
    transmission: '#F97316',
    specs: '#F97316',
    condition: '#F97316',
    sellerType: '#F97316',
  };

  const SUGGESTION_LABELS: Record<string, string> = {
    make: 'Make',
    model: 'Model',
    make_model: 'Make & Model',
    make_model_trim: 'Full Match',
    partner: 'Dealer',
    tag: 'Tag',
    extra: 'Feature',
    bodyType: 'Body Type',
    fuelType: 'Fuel',
    transmission: 'Transmission',
    specs: 'Specs',
    condition: 'Condition',
    sellerType: 'Seller',
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'vin_listing':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'vin_decode':
      case 'vin_partial':
        return <FileKey2 className="h-4 w-4 text-blue-500" />;
      default: {
        const dotColor = SUGGESTION_COLORS[type] || '#9CA3AF';
        return (
          <span
            className="inline-block h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
          />
        );
      }
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input */}
      <div className={cn(
        'relative flex items-center',
        'bg-sidebar border border-sidebar-border rounded-full',
        'shadow-sm hover:shadow-md',
        'hover:border-sidebar-border/80',
        'transition-all duration-200',
        isFocused && 'border-primary/50 ring-2 ring-primary/20 shadow-md',
        sizeClasses[size]
      )}>
        <Search className={cn(
          'absolute left-3 sm:left-3.5 transition-colors',
          isFocused ? 'text-primary' : 'text-sidebar-foreground/60',
          iconSizes[size]
        )} />
        
        {/* Styled display overlay - hides dots completely */}
        {query && (
          <div className="absolute left-10 sm:left-11 right-12 sm:right-10 pointer-events-none font-semibold tracking-tight text-sidebar-foreground truncate">
            {query.split(/(\s*\.\s*)/).map((part, i) => 
              part.match(/^\s*\.\s*$/) 
                ? <span key={i} className="text-transparent select-none">{part}</span>
                : <span key={i}>{part}</span>
            )}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          suppressHydrationWarning
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocusProp?.();
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => {
              onBlurProp?.();
            }, 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          // Prevent iOS zoom on focus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={cn(
            'w-full h-full bg-transparent pl-10 sm:pl-11 pr-12 sm:pr-10',
            'placeholder:text-sidebar-foreground/50 placeholder:font-medium',
            'focus:outline-none touch-manipulation',
            'font-semibold tracking-tight',
            // Hide text when showing styled overlay (but keep for caret positioning)
            query ? 'text-transparent caret-sidebar-foreground' : 'text-sidebar-foreground'
          )}
          aria-label="Search cars"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="search-suggestions-listbox"
          role="combobox"
        />

        {/* Clear / Loading */}
        {query && (
          <button
            onClick={() => setQuery('')}
            className={cn(
              "absolute right-2 sm:right-3 p-2 sm:p-1 rounded-full transition-all touch-manipulation",
              "text-muted-foreground/50 hover:text-foreground hover:bg-muted active:bg-muted"
            )}
            aria-label="Clear search"
          >
            {isLoading ? (
              <Loader2 className={cn('animate-spin', iconSizes[size])} />
            ) : (
              <X className={iconSizes[size]} />
            )}
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div 
          className={cn(
            'absolute top-full z-50 mt-2',
            'left-0 right-0 w-full',
            'min-w-[280px]',
            'bg-sidebar-background border border-sidebar-border rounded-2xl shadow-xl',
            'overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150'
          )}
          role="listbox"
        >
          {isLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
              <span className="text-sm font-semibold">Searching...</span>
            </div>
          ) : (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.type}-${suggestion.text}`}
                  role="option"
                  aria-selected={clampedSelectedIndex === index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 cursor-pointer',
                    'transition-colors duration-100',
                    clampedSelectedIndex === index 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-foreground">
                          {suggestion.text}
                        </span>
                        {suggestion.type === 'vin_listing' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-600 bg-green-500/10 rounded">
                            View Car
                          </span>
                        )}
                        {(suggestion.type === 'vin_decode' || suggestion.type === 'vin_partial') && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-500/10 rounded">
                            Decode VIN
                          </span>
                        )}
                        {!['vin_listing', 'vin_decode', 'vin_partial'].includes(suggestion.type) && SUGGESTION_LABELS[suggestion.type] && (
                          <span className="text-xs text-muted-foreground/60 font-medium">
                            {SUGGESTION_LABELS[suggestion.type]}
                          </span>
                        )}
                      </div>
                      {suggestion.type === 'vin_listing' && suggestion.vin && (
                        <span className="text-[11px] text-muted-foreground/60 font-mono">
                          VIN: {suggestion.vin}
                        </span>
                      )}
                    </div>
                  </div>
                  {!['vin_listing', 'vin_decode', 'vin_partial'].includes(suggestion.type) && suggestion.count >= 0 && (
                    <span className="text-sm font-semibold text-muted-foreground/70 tabular-nums">
                      {suggestion.count} {suggestion.count === 1 ? 'car' : 'cars'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          {/* Search all hint */}
          {query.trim().length >= 2 && suggestions.length > 0 && (
            <button
              onClick={() => handleSearch(query.trim())}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'px-4 py-3 border-t border-border/30',
                'text-sm font-semibold text-muted-foreground/70 hover:text-primary hover:bg-primary/5',
                'transition-colors'
              )}
            >
              <Search className="h-4 w-4" />
              Search all for &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
