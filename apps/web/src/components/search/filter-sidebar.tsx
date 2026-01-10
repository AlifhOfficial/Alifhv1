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
import { ChevronDown, CheckCircle2 } from 'lucide-react';
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
  return (
    <div className="flex flex-col">
      <FilterSection title="Popular" defaultOpen>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onFilterChange({ condition: params.condition === 'new' ? undefined : 'new' })}
            className={cn(
              'flex items-center justify-between w-full py-2.5 px-3 rounded-lg',
              'text-sm transition-all duration-150',
              params.condition === 'new'
                ? 'text-foreground font-bold bg-muted/50'
                : 'text-muted-foreground font-semibold hover:text-foreground hover:bg-muted/30'
            )}
          >
            <span>New Cars</span>
            {params.condition === 'new' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ isBlkListing: params.isBlkListing ? undefined : true })}
            className={cn(
              'flex items-center justify-between w-full py-2.5 px-3 rounded-lg',
              'text-sm transition-all duration-150',
              params.isBlkListing
                ? 'text-foreground font-bold bg-muted/50'
                : 'text-muted-foreground font-semibold hover:text-foreground hover:bg-muted/30'
            )}
          >
            <span>Black Listings</span>
            {params.isBlkListing && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ isBlackTierPartner: params.isBlackTierPartner ? undefined : true })}
            className={cn(
              'flex items-center justify-between w-full py-2.5 px-3 rounded-lg',
              'text-sm transition-all duration-150',
              params.isBlackTierPartner
                ? 'text-foreground font-bold bg-muted/50'
                : 'text-muted-foreground font-semibold hover:text-foreground hover:bg-muted/30'
            )}
          >
            <span>Black Members</span>
            {params.isBlackTierPartner && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </button>
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price" defaultOpen>
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
      <FilterSection title="Year" defaultOpen>
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
      <FilterSection title="Mileage">
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
      <FilterSection title="Location">
        <MultiSelectFilter
          options={facets?.emirate ?? []}
          selected={params.emirate ?? []}
          onChange={(emirate) => onFilterChange({ emirate })}
          placeholder="Any location"
          isLoading={isLoading}
        />
      </FilterSection>

      {/* Negotiable Toggle */}
      <FilterSection title="Negotiable">
        <button
          type="button"
          onClick={() => onFilterChange({ isNegotiable: params.isNegotiable ? undefined : true })}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-all',
            params.isNegotiable
              ? 'text-foreground font-bold bg-muted/50'
              : 'bg-muted/30 text-muted-foreground font-semibold hover:bg-muted/50 hover:text-foreground'
          )}
        >
          <span>Negotiable prices only</span>
          {params.isNegotiable && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </button>
      </FilterSection>

      {/* Regional Specs */}
      <FilterSection title="Regional Specs">
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
}

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-sm font-bold text-foreground hover:text-foreground transition-colors">
        <span>{title}</span>
        <ChevronDown className="size-4 text-muted-foreground/50 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-5">
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
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted/10 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/50 py-3 font-medium">No options available</p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {visibleOptions.map((option) => {
        const isSelected = selected.includes(option.value);
        
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={cn(
              'flex items-center justify-between w-full py-2.5 px-3 rounded-lg',
              'text-sm transition-all duration-150',
              isSelected
                ? 'text-foreground font-bold bg-muted/50'
                : 'text-muted-foreground font-semibold hover:text-foreground hover:bg-muted/30'
            )}
          >
            <span>
              {option.label}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-muted-foreground/50 tabular-nums font-semibold">{option.count}</span>
              {isSelected && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </button>
        );
      })}
      
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-sm font-semibold text-muted-foreground/60 hover:text-foreground py-3 px-3 text-left transition-colors"
        >
          {showAll ? 'Show less' : `+${options.length - maxVisible} more`}
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
        <div className="flex flex-wrap gap-2">
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
                  'px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-150',
                  isActive
                    ? 'bg-muted/50 text-foreground'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Range inputs */}
      <div className="flex items-center gap-3">
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
              className="flex-1 h-10"
            />
            <span className="text-muted-foreground/40 text-sm font-semibold">–</span>
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
          className="flex-1 h-10"
        />
      </div>

      {/* Current range label */}
      {(minValue || maxValue) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-semibold">
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
            className="text-muted-foreground/50 hover:text-foreground transition-colors font-semibold"
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
