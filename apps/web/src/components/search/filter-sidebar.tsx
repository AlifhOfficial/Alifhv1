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
import { ChevronDown, Check } from 'lucide-react';
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
  onClearFilters,
  activeFilterCount,
}: FilterSidebarProps) {
  return (
    <div className="flex flex-col space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Make */}
      <FilterSection title="Make" defaultOpen>
        <MultiSelectFilter
          options={facets?.make ?? []}
          selected={params.make ?? []}
          onChange={(make) => onFilterChange({ make, model: undefined })}
          placeholder="Any make"
          isLoading={isLoading}
        />
      </FilterSection>

      {/* Model (shown when make is selected) */}
      {params.make?.length ? (
        <FilterSection title="Model">
          <MultiSelectFilter
            options={facets?.model ?? []}
            selected={params.model ?? []}
            onChange={(model) => onFilterChange({ model })}
            placeholder="Any model"
            isLoading={isLoading}
          />
        </FilterSection>
      ) : null}

      {/* Year Range */}
      <FilterSection title="Year">
        <RangeFilter
          minValue={params.yearMin}
          maxValue={params.yearMax}
          rangeMin={facets?.yearRange.min ?? 2000}
          rangeMax={facets?.yearRange.max ?? new Date().getFullYear() + 1}
          onChange={(yearMin, yearMax) => onFilterChange({ yearMin, yearMax })}
          formatLabel={(val) => String(val)}
        />
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price (AED)">
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

      {/* Mileage */}
      <FilterSection title="Mileage (km)">
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

      {/* Emirate */}
      <FilterSection title="Location">
        <MultiSelectFilter
          options={facets?.emirate ?? []}
          selected={params.emirate ?? []}
          onChange={(emirate) => onFilterChange({ emirate })}
          placeholder="Any location"
          isLoading={isLoading}
        />
      </FilterSection>

      {/* Specs */}
      <FilterSection title="Regional Specs">
        <MultiSelectFilter
          options={facets?.specs ?? []}
          selected={params.specs ?? []}
          onChange={(specs) => onFilterChange({ specs: specs as any })}
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

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-sm font-medium tracking-tight text-foreground/90 hover:text-foreground transition-colors">
        <span>{title}</span>
        <ChevronDown className="size-3.5 text-muted-foreground/60 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 pb-6">
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
  placeholder,
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
          <div key={i} className="h-9 bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 py-2">No options available</p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {visibleOptions.map((option) => {
        const isSelected = selected.includes(option.value);
        
        return (
          <button
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={cn(
              'flex items-center justify-between w-full py-2 px-2.5 rounded-md',
              'text-sm transition-all',
              isSelected
                ? 'text-foreground font-medium bg-muted/50'
                : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted/30'
            )}
          >
            <span className="tracking-tight">
              {option.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/50 tabular-nums">{option.count}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-foreground" />}
            </div>
          </button>
        );
      })}
      
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-muted-foreground/50 hover:text-foreground py-2 px-2.5 text-left transition-colors mt-1"
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
  const [localMin, setLocalMin] = useState(minValue?.toString() ?? '');
  const [localMax, setLocalMax] = useState(maxValue?.toString() ?? '');

  const handleMinChange = (value: string) => {
    setLocalMin(value);
    const num = parseInt(value, 10);
    if (!value) {
      onChange(undefined, maxValue);
    } else if (!isNaN(num)) {
      onChange(num, maxValue);
    }
  };

  const handleMaxChange = (value: string) => {
    setLocalMax(value);
    const num = parseInt(value, 10);
    if (!value) {
      onChange(minValue, undefined);
    } else if (!isNaN(num)) {
      onChange(minValue, num);
    }
  };

  const handlePresetClick = (preset: { min?: number; max?: number }) => {
    onChange(preset.min, preset.max);
    setLocalMin(preset.min?.toString() ?? '');
    setLocalMax(preset.max?.toString() ?? '');
  };

  return (
    <div className="space-y-3">
      {/* Quick presets */}
      {presets && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isActive = 
              (preset.min === minValue || (!preset.min && !minValue)) &&
              (preset.max === maxValue || (!preset.max && !maxValue));
            
            return (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md transition-all',
                  isActive
                    ? 'bg-foreground/90 text-background font-medium'
                    : 'bg-muted/40 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60'
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
              className="flex-1 h-9"
            />
            <span className="text-muted-foreground/40 text-sm">–</span>
          </>
        )}
        <Input
          type="number"
          value={localMax}
          onChange={(e) => handleMaxChange(e.target.value)}
          placeholder={singleValue ? 'Max' : 'Max'}
          min={rangeMin}
          max={rangeMax}
          step={step}
          className="flex-1 h-9"
        />
      </div>

      {/* Current range label */}
      {(minValue || maxValue) && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground/60">
            {minValue && maxValue
              ? `${formatLabel(minValue)} - ${formatLabel(maxValue)}`
              : minValue
              ? `From ${formatLabel(minValue)}`
              : maxValue
              ? `Up to ${formatLabel(maxValue)}`
              : null}
          </span>
          <button
            onClick={() => {
              onChange(undefined, undefined);
              setLocalMin('');
              setLocalMax('');
            }}
            className="text-muted-foreground/50 hover:text-foreground transition-colors"
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
