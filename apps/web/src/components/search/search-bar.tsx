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
import { Search, X, Loader2, CircleDot, Factory, FileKey2, Car } from 'lucide-react';
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
}

export function SearchBar({
  placeholder = 'Search make, model, dealer...',
  size = 'md',
  className,
  autoFocus = false,
  onSearch,
  redirectOnSearch = true,
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
  const handleSearch = useCallback((searchQuery: string, make?: string, model?: string, trim?: string, partnerId?: string, partnerName?: string) => {
    // Build filters object for callback - clear all search-related filters first
    const filters: Partial<SearchParams> = {
      // Clear all search-related filters
      q: undefined,
      make: undefined,
      model: undefined,
      trim: undefined,
      partnerId: undefined,
      partnerName: undefined,
    };
    
    // Then set the new ones
    if (partnerId && partnerId.trim()) {
      filters.partnerId = partnerId.trim();
      if (partnerName && partnerName.trim()) {
        filters.partnerName = partnerName.trim();
      }
    } else if (make && make.trim()) {
      filters.make = [make.trim()];
      if (model && model.trim()) {
        filters.model = [model.trim()];
      }
      if (trim && trim.trim()) {
        filters.trim = [trim.trim()];
      }
    } else if (searchQuery && searchQuery.trim()) {
      filters.q = searchQuery.trim();
    }
    
    if (onSearch) {
      onSearch(filters);
    }
    
    if (redirectOnSearch) {
      // Build proper SearchParams object
      const searchParams: SearchParams = {};
      
      // Partner ID takes priority
      if (partnerId && partnerId.trim()) {
        searchParams.partnerId = partnerId.trim();
        if (partnerName && partnerName.trim()) {
          searchParams.partnerName = partnerName.trim();
        }
      } 
      // Make, model, and trim filters
      else if (make && make.trim()) {
        searchParams.make = [make.trim()];
        if (model && model.trim()) {
          searchParams.model = [model.trim()];
        }
        if (trim && trim.trim()) {
          searchParams.trim = [trim.trim()];
        }
      }
      // Fallback to text search
      else if (searchQuery && searchQuery.trim()) {
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
      handleSearch(suggestion.text, undefined, undefined, undefined, suggestion.partnerId, suggestion.partnerName);
    } else if (suggestion.type === 'make_model_trim') {
      // Full selection - apply filters
      handleSearch(suggestion.text, suggestion.make, suggestion.model, suggestion.trim);
    } else if (suggestion.type === 'make_model') {
      // Direct selection - apply make + model filters
      handleSearch('', suggestion.make, suggestion.model);
    } else if (suggestion.type === 'make') {
      // Apply make filter immediately - facets will update to show models
      handleSearch('', suggestion.make);
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

  // Size classes
  const sizeClasses = {
    sm: 'h-10 text-sm px-1',
    md: 'h-11 text-sm px-1',
    lg: 'h-12 text-base px-2',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'vin_listing':
        return <Car className="h-4 w-4 text-green-500" />;
      case 'vin_decode':
      case 'vin_partial':
        return <FileKey2 className="h-4 w-4 text-blue-500" />;
      case 'partner':
        return <Factory className="h-4 w-4 text-muted-foreground/80" />;
      case 'make':
      case 'make_model':
      default:
        return <CircleDot className="h-4 w-4 text-muted-foreground/60" />;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input */}
      <div className={cn(
        'relative flex items-center',
        'bg-background border border-border/40 rounded-full',
        'hover:border-border/60',
        'transition-all duration-200',
        isFocused && 'border-primary/40 ring-1 ring-primary/20',
        sizeClasses[size]
      )}>
        <Search className={cn(
          'absolute left-3.5 transition-colors',
          isFocused ? 'text-primary' : 'text-muted-foreground/70',
          iconSizes[size]
        )} />
        
        {/* Styled display overlay - hides dots completely */}
        {query && (
          <div className="absolute left-11 right-10 pointer-events-none font-semibold tracking-tight text-foreground truncate">
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
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full h-full bg-transparent pl-11 pr-10',
            'placeholder:text-muted-foreground/60 placeholder:font-medium',
            'focus:outline-none',
            'font-semibold tracking-tight',
            // Hide text when showing styled overlay (but keep for caret positioning)
            query ? 'text-transparent caret-foreground' : 'text-foreground'
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
              "absolute right-3 p-1 rounded-full transition-all",
              "text-muted-foreground/50 hover:text-foreground hover:bg-muted"
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
            'absolute top-full left-0 right-0 z-50 mt-2',
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
                        {suggestion.type === 'partner' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 bg-muted rounded">
                            Dealer
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
                  {!['vin_listing', 'vin_decode', 'vin_partial'].includes(suggestion.type) && (
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
