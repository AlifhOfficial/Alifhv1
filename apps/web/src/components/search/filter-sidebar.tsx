'use client';

/**
 * FilterSidebar - Medium tier filters
 * 
 * Collapsible filter sections inspired by app-sidebar.
 * Uses same spacing and typography patterns.
 * 
 * @module components/search/filter-sidebar
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import type { SearchParams, SearchFacets, FacetBucket } from '@/lib/search-utils';
import { SPECS_TYPES, UAE_EMIRATES } from '@/lib/filter-constants';
import { EXPORT_STATUSES } from '@/lib/filter-constants';

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
  isLoading: _isLoading,
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
  const mileageCount = (params.mileageMin || params.mileageMax) ? 1 : 0;
  const locationCount = params.emirate?.length ?? 0;
  const negotiableCount = params.isNegotiable ? 1 : 0;
  const specsCount = params.specs?.length ?? 0;
  const sellerTypeCount = params.sellerType ? 1 : 0;
  const exportStatusCount = params.exportStatus?.length ?? 0;
  const [sectionOpenState, setSectionOpenState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.sessionStorage.getItem('revvup:listings-filter-sections:v1');
    if (!saved) return;

    try {
      setSectionOpenState(JSON.parse(saved) as Record<string, boolean>);
    } catch {
      // Ignore invalid stored state.
    }
  }, []);

  const handleSectionOpenChange = useCallback((title: string, open: boolean) => {
    setSectionOpenState((current) => {
      const next = { ...current, [title]: open };
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('revvup:listings-filter-sections:v1', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col">
      <FilterSection
        title="Popular"
        selectedCount={popularCount}
        open={sectionOpenState.Popular}
        onOpenChange={(open) => handleSectionOpenChange('Popular', open)}
      >
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onFilterChange({ condition: params.condition === 'new' ? undefined : 'new' })}
            className={cn(
              'flex items-center w-full pl-3 py-2.5 rounded-md touch-manipulation',
              'text-callout font-medium tracking-tight transition-colors duration-100',
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
              'flex items-center w-full pl-3 py-2.5 rounded-md touch-manipulation',
              'text-callout font-medium tracking-tight transition-colors duration-100',
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
              'flex items-center w-full pl-3 py-2.5 rounded-md touch-manipulation',
              'text-callout font-medium tracking-tight transition-colors duration-100',
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
      <FilterSection
        title="Price"
        selectedCount={priceCount}
        open={sectionOpenState.Price}
        onOpenChange={(open) => handleSectionOpenChange('Price', open)}
      >
        <RangeFilter
          minValue={params.priceMin}
          maxValue={params.priceMax}
          rangeMin={0}
          rangeMax={facets?.priceRange.max ?? 5000000}
          onChange={(priceMin, priceMax) => onFilterChange({ priceMin, priceMax })}
          formatLabel={formatPrice}
          step={10000}
          presets={PRICE_PRESETS}
        />
      </FilterSection>

      {/* Year Range */}
      <FilterSection
        title="Year"
        selectedCount={yearCount}
        open={sectionOpenState.Year}
        onOpenChange={(open) => handleSectionOpenChange('Year', open)}
      >
        <RangeFilter
          minValue={params.yearMin}
          maxValue={params.yearMax}
          rangeMin={1900}
          rangeMax={facets?.yearRange.max ?? new Date().getFullYear() + 1}
          onChange={(yearMin, yearMax) => onFilterChange({ yearMin, yearMax })}
          formatLabel={(val) => String(val)}
        />
      </FilterSection>

      {/* Mileage */}
      <FilterSection
        title="Mileage"
        selectedCount={mileageCount}
        open={sectionOpenState.Mileage}
        onOpenChange={(open) => handleSectionOpenChange('Mileage', open)}
      >
        <RangeFilter
          minValue={params.mileageMin}
          maxValue={params.mileageMax}
          rangeMin={0}
          rangeMax={facets?.mileageRange.max ?? 300000}
          onChange={(mileageMin, mileageMax) => onFilterChange({ mileageMin, mileageMax })}
          formatLabel={formatMileage}
          step={10000}
          presets={MILEAGE_PRESETS}
        />
      </FilterSection>

      {/* Location */}
      <FilterSection
        title="Location"
        selectedCount={locationCount}
        open={sectionOpenState.Location}
        onOpenChange={(open) => handleSectionOpenChange('Location', open)}
      >
        <MultiSelectFilter
          options={UAE_EMIRATES.map((emirate) => ({
            value: emirate.value,
            label: emirate.label,
            count: 0,
          }))}
          selected={params.emirate ?? []}
          onChange={(emirate) => onFilterChange({ emirate })}
          placeholder="Any location"
        />
      </FilterSection>

      {/* Negotiable Toggle */}
      <FilterSection
        title="Negotiable"
        selectedCount={negotiableCount}
        open={sectionOpenState.Negotiable}
        onOpenChange={(open) => handleSectionOpenChange('Negotiable', open)}
      >
        <button
          type="button"
          onClick={() => onFilterChange({ isNegotiable: params.isNegotiable ? undefined : true })}
          className={cn(
            'flex items-center w-full pl-3 py-2.5 rounded-md touch-manipulation',
            'text-callout font-medium tracking-tight transition-colors duration-100',
            params.isNegotiable
              ? 'bg-muted text-foreground font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          Negotiable prices only
        </button>
      </FilterSection>

      {/* Regional Specs */}
      <FilterSection
        title="Regional Specs"
        selectedCount={specsCount}
        open={sectionOpenState['Regional Specs']}
        onOpenChange={(open) => handleSectionOpenChange('Regional Specs', open)}
      >
        <MultiSelectFilter
          options={SPECS_TYPES.map((spec) => ({
            value: spec.value,
            label: spec.label,
            count: 0,
          }))}
          selected={params.specs ?? []}
          onChange={(specs) => onFilterChange({ specs: specs as SearchParams['specs'] })}
          placeholder="Any specs"
        />
      </FilterSection>

      {/* Seller Type */}
      <FilterSection
        title="Seller Type"
        selectedCount={sellerTypeCount}
        open={sectionOpenState['Seller Type']}
        onOpenChange={(open) => handleSectionOpenChange('Seller Type', open)}
      >
        <div className="flex flex-col gap-0.5">
          {(['dealer', 'private'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFilterChange({ sellerType: params.sellerType === type ? undefined : type })}
              className={cn(
                'flex items-center w-full pl-3 py-2.5 rounded-md touch-manipulation',
                'text-callout font-medium tracking-tight transition-colors duration-100',
                params.sellerType === type
                  ? 'bg-muted text-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {type === 'dealer' ? 'Dealer' : 'Private Seller'}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Export Status */}
      <FilterSection
        title="Export Status"
        selectedCount={exportStatusCount}
        open={sectionOpenState['Export Status']}
        onOpenChange={(open) => handleSectionOpenChange('Export Status', open)}
      >
        <div className="flex flex-col gap-0.5">
          {EXPORT_STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => {
                const current = params.exportStatus ?? [];
                const updated = current.includes(status.value)
                  ? current.filter(v => v !== status.value)
                  : [...current, status.value];
                onFilterChange({ exportStatus: updated.length ? updated : undefined });
              }}
              className={cn(
                'flex items-center w-full pl-3 py-2.5 rounded-md touch-manipulation',
                'text-callout font-medium tracking-tight transition-colors duration-100',
                params.exportStatus?.includes(status.value)
                  ? 'bg-muted text-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function FilterSection({
  title,
  children,
  defaultOpen = false,
  selectedCount = 0,
  open,
  onOpenChange,
}: FilterSectionProps) {
  return (
    <Collapsible
      open={open ?? defaultOpen}
      onOpenChange={onOpenChange}
      className="group/collapsible"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-muted/30 rounded-lg transition-colors touch-manipulation">
        <span className="text-callout font-semibold tracking-tight text-sidebar-foreground">{title}</span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="min-w-[20px] h-[20px] px-1.5 text-caption1 font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {selectedCount}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground/60 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-3 pb-3">
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
      <p className="text-callout text-muted-foreground/50 pl-3 py-2.5 font-medium">No options available</p>
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
              'flex items-center justify-between w-full pl-3 pr-3 py-2.5 rounded-md touch-manipulation',
              'text-callout font-medium tracking-tight transition-colors duration-100',
              isSelected
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <span>{option.label}</span>
            {option.count > 0 && (
              <span className={cn(
                "text-subhead tabular-nums",
                isSelected ? "text-foreground/60" : "text-muted-foreground/60"
              )}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
      
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-callout font-medium text-muted-foreground hover:text-foreground pl-3 py-2.5 text-left transition-colors touch-manipulation"
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
  // Local state for input display — avoids triggering search on every keystroke
  const [localMin, setLocalMin] = useState(minValue?.toString() ?? '');
  const [localMax, setLocalMax] = useState(maxValue?.toString() ?? '');

  // Sync local state if the external value changes (e.g. clear all filters)
  const externalMinRef = useRef(minValue);
  const externalMaxRef = useRef(maxValue);
  useEffect(() => {
    if (minValue !== externalMinRef.current) {
      externalMinRef.current = minValue;
      setLocalMin(minValue?.toString() ?? '');
    }
    if (maxValue !== externalMaxRef.current) {
      externalMaxRef.current = maxValue;
      setLocalMax(maxValue?.toString() ?? '');
    }
  }, [minValue, maxValue]);

  const debouncedOnChange = useDebouncedCallback(
    (min: number | undefined, max: number | undefined) => onChange(min, max),
    300
  );

  const handleMinChange = useCallback((value: string) => {
    setLocalMin(value);
    const num = parseInt(value, 10);
    if (!value) {
      debouncedOnChange(undefined, maxValue);
    } else if (!isNaN(num)) {
      debouncedOnChange(num, maxValue);
    }
  }, [debouncedOnChange, maxValue]);

  const handleMaxChange = useCallback((value: string) => {
    setLocalMax(value);
    const num = parseInt(value, 10);
    if (!value) {
      debouncedOnChange(minValue, undefined);
    } else if (!isNaN(num)) {
      debouncedOnChange(minValue, num);
    }
  }, [debouncedOnChange, minValue]);

  const handlePresetClick = useCallback((preset: { min?: number; max?: number }) => {
    // Toggle off if already active (tap to remove)
    const isActive = 
      (preset.min === minValue || (!preset.min && !minValue)) &&
      (preset.max === maxValue || (!preset.max && !maxValue));
    
    if (isActive) {
      debouncedOnChange.cancel();
      setLocalMin('');
      setLocalMax('');
      onChange(undefined, undefined);
    } else {
      debouncedOnChange.cancel();
      setLocalMin(preset.min?.toString() ?? '');
      setLocalMax(preset.max?.toString() ?? '');
      onChange(preset.min, preset.max);
    }
  }, [onChange, debouncedOnChange, minValue, maxValue]);

  const handleClear = useCallback(() => {
    debouncedOnChange.cancel();
    setLocalMin('');
    setLocalMax('');
    onChange(undefined, undefined);
  }, [onChange, debouncedOnChange]);

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
                  'px-3 py-2 text-subhead font-semibold rounded-lg transition-colors duration-100 touch-manipulation',
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
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="Min"
              min={rangeMin}
              max={rangeMax}
              step={step}
              className="flex-1 h-10 rounded-lg text-callout"
            />
            <span className="text-muted-foreground/40 text-callout font-medium">–</span>
          </>
        )}
        <Input
          type="number"
          value={localMax}
          onChange={(e) => handleMaxChange(e.target.value)}
          placeholder="Max"
          min={rangeMin}
          max={rangeMax}
          step={step}
          className="flex-1 h-10 rounded-lg text-callout"
        />
      </div>

      {/* Current range label */}
      {(minValue || maxValue) && (
        <div className="flex items-center justify-between bg-sidebar-accent rounded-lg px-3 py-2.5">
          <span className="text-callout font-semibold tracking-tight text-sidebar-foreground">
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
            className="text-muted-foreground/70 hover:text-sidebar-foreground transition-colors font-semibold text-subhead touch-manipulation px-2 py-1 -mr-2"
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
