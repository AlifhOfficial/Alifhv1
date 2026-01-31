'use client';

/**
 * FilterSidebar - Medium tier filters
 * 
 * Collapsible filter sections inspired by app-sidebar.
 * Uses same spacing and typography patterns.
 * 
 * @module components/search/filter-sidebar
 */

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import type { SearchParams, SearchFacets, FacetBucket } from '@/lib/search-utils';

interface FilterSidebarProps {
  params: SearchParams;
  facets: SearchFacets | undefined;
  isLoading?: boolean;
  onFilterChange: (filters: Partial<SearchParams>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function FilterSidebar({
  params,
  facets,
  isLoading,
  onFilterChange,
  onClearFilters: _onClearFilters,
  activeFilterCount: _activeFilterCount,
}: FilterSidebarProps) {
  // Calculate selected counts for each section
  const popularCount = [
    params.condition === 'new',
    params.isBlkListing,
    params.isBlackTierPartner,
  ].filter(Boolean).length;

  const priceCount = (params.priceMin || params.priceMax) ? 1 : 0;
  const yearCount = (params.yearMin || params.yearMax) ? 1 : 0;
  const mileageCount = params.mileageMax ? 1 : 0;
  const locationCount = params.emirate?.length ?? 0;
  const negotiableCount = params.isNegotiable ? 1 : 0;
  const specsCount = params.specs?.length ?? 0;

  return (
    <div className="flex flex-col">
      <FilterSection title="Popular" selectedCount={popularCount}>
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onFilterChange({ condition: params.condition === 'new' ? undefined : 'new' })}
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-md touch-manipulation',
              'text-[15px] font-medium tracking-tight transition-colors duration-100',
              params.condition === 'new'
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            New Cars
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ isBlkListing: params.isBlkListing ? undefined : true })}
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-md touch-manipulation',
              'text-[15px] font-medium tracking-tight transition-colors duration-100',
              params.isBlkListing
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            Black Listings
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ isBlackTierPartner: params.isBlackTierPartner ? undefined : true })}
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-md touch-manipulation',
              'text-[15px] font-medium tracking-tight transition-colors duration-100',
              params.isBlackTierPartner
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            Black Members
          </button>
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price" selectedCount={priceCount}>
        <RangeFilter
          minValue={params.priceMin}
          maxValue={params.priceMax}
          rangeMin={facets?.priceRange.min ?? 0}
          rangeMax={facets?.priceRange.max ?? 5000000}
          onChange={(priceMin, priceMax) => onFilterChange({ priceMin, priceMax })}
          formatLabel={formatPrice}
          step={10000}
          presets={PRICE_PRESETS}
        />
      </FilterSection>

      {/* Year Range */}
      <FilterSection title="Year" selectedCount={yearCount}>
        <RangeFilter
          minValue={params.yearMin}
          maxValue={params.yearMax}
          rangeMin={facets?.yearRange.min ?? 2000}
          rangeMax={facets?.yearRange.max ?? new Date().getFullYear() + 1}
          onChange={(yearMin, yearMax) => onFilterChange({ yearMin, yearMax })}
          formatLabel={(val) => String(val)}
        />
      </FilterSection>

      {/* Mileage */}
      <FilterSection title="Mileage" selectedCount={mileageCount}>
        <RangeFilter
          minValue={0}
          maxValue={params.mileageMax}
          rangeMin={0}
          rangeMax={facets?.mileageRange.max ?? 300000}
          onChange={(_, mileageMax) => onFilterChange({ mileageMax })}
          formatLabel={formatMileage}
          step={10000}
          singleValue
          presets={MILEAGE_PRESETS}
        />
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location" selectedCount={locationCount}>
        <MultiSelectFilter
          options={facets?.emirate ?? []}
          selected={params.emirate ?? []}
          onChange={(emirate) => onFilterChange({ emirate })}
          placeholder="Any location"
          isLoading={isLoading}
        />
      </FilterSection>

      {/* Negotiable Toggle */}
      <FilterSection title="Negotiable" selectedCount={negotiableCount}>
        <button
          type="button"
          onClick={() => onFilterChange({ isNegotiable: params.isNegotiable ? undefined : true })}
          className={cn(
            'flex items-center w-full px-3 py-2 rounded-md touch-manipulation',
            'text-[15px] font-medium tracking-tight transition-colors duration-100',
            params.isNegotiable
              ? 'bg-muted text-foreground font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          Negotiable prices only
        </button>
      </FilterSection>

      {/* Regional Specs */}
      <FilterSection title="Regional Specs" selectedCount={specsCount}>
        <MultiSelectFilter
          options={facets?.specs ?? []}
          selected={params.specs ?? []}
          onChange={(specs) => onFilterChange({ specs: specs as SearchParams['specs'] })}
          placeholder="Any specs"
          isLoading={isLoading}
        />
      </FilterSection>
    </div>
  );
}

// ============================================================================
// FILTER COMPONENTS
// ============================================================================

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  selectedCount?: number;
}

function FilterSection({ title, children, defaultOpen = false, selectedCount = 0 }: FilterSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-3 hover:bg-muted/30 rounded-lg transition-colors touch-manipulation">
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground/80">{title}</span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {selectedCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface MultiSelectFilterProps {
  options: FacetBucket[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  isLoading?: boolean;
  maxVisible?: number;
}

function MultiSelectFilter({
  options,
  selected,
  onChange,
  placeholder: _placeholder, // Reserved for future search functionality
  isLoading,
  maxVisible = 6,
}: MultiSelectFilterProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleOptions = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;

  const toggleOption = useCallback((value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }, [selected, onChange]);

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 bg-muted/30 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-[15px] text-muted-foreground/50 py-2 font-medium">No options available</p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {visibleOptions.map((option) => {
        const isSelected = selected.includes(option.value);
        
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded-md touch-manipulation',
              'text-[15px] font-medium tracking-tight transition-colors duration-100',
              isSelected
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <span>{option.label}</span>
            <span className={cn(
              "text-sm tabular-nums",
              isSelected ? "text-foreground/60" : "text-muted-foreground/60"
            )}>
              {option.count}
            </span>
          </button>
        );
      })}
      
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground py-2 px-3 text-left transition-colors touch-manipulation"
        >
          {showAll ? 'Show less' : `Show ${options.length - maxVisible} more`}
        </button>
      )}
    </div>
  );
}

interface RangeFilterProps {
  minValue: number | undefined;
  maxValue: number | undefined;
  rangeMin: number;
  rangeMax: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  formatLabel: (value: number) => string;
  step?: number;
  singleValue?: boolean;
  presets?: Array<{ label: string; min?: number; max?: number }>;
}

function RangeFilter({
  minValue,
  maxValue,
  rangeMin,
  rangeMax,
  onChange,
  formatLabel,
  step = 1,
  singleValue = false,
  presets,
}: RangeFilterProps) {
  // Use controlled inputs - derive display value from props
  // For typing experience, we allow empty string to clear
  const displayMin = minValue?.toString() ?? '';
  const displayMax = maxValue?.toString() ?? '';

  const handleMinChange = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (!value) {
      onChange(undefined, maxValue);
    } else if (!isNaN(num)) {
      onChange(num, maxValue);
    }
  }, [onChange, maxValue]);

  const handleMaxChange = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (!value) {
      onChange(minValue, undefined);
    } else if (!isNaN(num)) {
      onChange(minValue, num);
    }
  }, [onChange, minValue]);

  const handlePresetClick = useCallback((preset: { min?: number; max?: number }) => {
    // Toggle off if already active (tap to remove)
    const isActive = 
      (preset.min === minValue || (!preset.min && !minValue)) &&
      (preset.max === maxValue || (!preset.max && !maxValue));
    
    if (isActive) {
      onChange(undefined, undefined);
    } else {
      onChange(preset.min, preset.max);
    }
  }, [onChange, minValue, maxValue]);

  const handleClear = useCallback(() => {
    onChange(undefined, undefined);
  }, [onChange]);

  return (
    <div className="space-y-4">
      {/* Quick presets */}
      {presets && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isActive = 
              (preset.min === minValue || (!preset.min && !minValue)) &&
              (preset.max === maxValue || (!preset.max && !maxValue));
            
            return (
              <button
                type="button"
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-colors duration-100 touch-manipulation',
                  isActive
                    ? 'bg-sidebar-foreground text-sidebar'
                    : 'bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Range inputs */}
      <div className="flex items-center gap-2">
        {!singleValue && (
          <>
            <Input
              type="number"
              value={displayMin}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="Min"
              min={rangeMin}
              max={rangeMax}
              step={step}
              className="flex-1 h-9 rounded-lg text-[15px]"
            />
            <span className="text-muted-foreground/40 text-sm font-medium">–</span>
          </>
        )}
        <Input
          type="number"
          value={displayMax}
          onChange={(e) => handleMaxChange(e.target.value)}
          placeholder="Max"
          min={rangeMin}
          max={rangeMax}
          step={step}
          className="flex-1 h-9 rounded-lg text-[15px]"
        />
      </div>

      {/* Current range label */}
      {(minValue || maxValue) && (
        <div className="flex items-center justify-between bg-sidebar-accent rounded-lg px-3 py-2">
          <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
            {minValue && maxValue
              ? `${formatLabel(minValue)} - ${formatLabel(maxValue)}`
              : minValue
              ? `From ${formatLabel(minValue)}`
              : maxValue
              ? `Up to ${formatLabel(maxValue)}`
              : null}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground/70 hover:text-sidebar-foreground transition-colors font-semibold text-sm touch-manipulation px-2 py-1 -mr-2"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

const PRICE_PRESETS = [
  { label: 'Under 50K', max: 50000 },
  { label: '50K-100K', min: 50000, max: 100000 },
  { label: '100K-200K', min: 100000, max: 200000 },
  { label: '200K+', min: 200000 },
];

const MILEAGE_PRESETS = [
  { label: 'Under 20K', max: 20000 },
  { label: 'Under 50K', max: 50000 },
  { label: 'Under 100K', max: 100000 },
];

function formatPrice(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }
  return value.toString();
}

function formatMileage(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K km`;
  }
  return `${value} km`;
}
