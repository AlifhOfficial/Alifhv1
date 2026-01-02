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
import { ChevronDown, CheckCircle2, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [showAllMakes, setShowAllMakes] = useState(false);
  
  return (
    <div className="flex flex-col [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/15">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-2 border-b border-border/30">
        <h2 className="text-lg font-bold tracking-tight">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-semibold text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Make */}
      <FilterSection title="Make" defaultOpen>
        <MakeFilter
          options={facets?.make ?? []}
          selected={params.make ?? []}
          onChange={(make) => onFilterChange({ make, model: undefined })}
          isLoading={isLoading}
          onViewAll={() => setShowAllMakes(true)}
        />
      </FilterSection>

      {/* Make Modal */}
      <MakeModal
        isOpen={showAllMakes}
        onClose={() => setShowAllMakes(false)}
        options={facets?.make ?? []}
        selected={params.make ?? []}
        onChange={(make) => onFilterChange({ make, model: undefined })}
      />

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

      {/* Negotiable Toggle */}
      <FilterSection title="Negotiable">
        <button
          type="button"
          onClick={() => onFilterChange({ isNegotiable: params.isNegotiable ? undefined : true })}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2.5 text-[15px] font-semibold rounded-lg transition-all',
            params.isNegotiable
              ? 'bg-foreground text-background'
              : 'bg-muted/20 text-foreground/80 hover:bg-muted/40 hover:text-foreground'
          )}
        >
          <span className="tracking-tight">Negotiable prices only</span>
          {params.isNegotiable && <CheckCircle2 className="h-4 w-4" />}
        </button>
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

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible border-b border-border/20">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-[15px] font-bold tracking-tight text-foreground hover:text-foreground transition-colors">
        <span>{title}</span>
        <ChevronDown className="size-4 text-muted-foreground/60 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// MAKE FILTER WITH MODAL
// ============================================================================

interface MakeFilterProps {
  options: FacetBucket[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
  onViewAll: () => void;
}

function MakeFilter({ options, selected, onChange, isLoading, onViewAll }: MakeFilterProps) {
  const topMakes = options.slice(0, 3);
  const hasMore = options.length > 3;
  
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
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted/10 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/40 py-3">No makes available</p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Selected makes not in top 3 */}
      {selected.filter(s => !topMakes.some(m => m.value === s)).map((value) => {
        const option = options.find(o => o.value === value);
        if (!option) return null;
        
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-[15px] transition-all duration-150 text-foreground font-semibold bg-muted/40"
          >
            <span className="tracking-tight">{option.label}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-muted-foreground/60 tabular-nums font-medium">{option.count}</span>
              <CheckCircle2 className="h-4 w-4 text-foreground" />
            </div>
          </button>
        );
      })}
      
      {/* Top 3 makes */}
      {topMakes.map((option) => {
        const isSelected = selected.includes(option.value);
        
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={cn(
              'flex items-center justify-between w-full py-2.5 px-3 rounded-lg',
              'text-[15px] transition-all duration-150',
              isSelected
                ? 'text-foreground font-semibold bg-muted/40'
                : 'text-foreground/80 font-medium hover:text-foreground hover:bg-muted/20'
            )}
          >
            <span className="tracking-tight">{option.label}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-muted-foreground/60 tabular-nums font-medium">{option.count}</span>
              {isSelected && <CheckCircle2 className="h-4 w-4 text-foreground" />}
            </div>
          </button>
        );
      })}
      
      {/* View all button */}
      {hasMore && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-primary hover:text-primary/80 py-3 px-3 text-left transition-colors"
        >
          View all {options.length} makes
        </button>
      )}
    </div>
  );
}

interface MakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: FacetBucket[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function MakeModal({ isOpen, onClose, options, selected, onChange }: MakeModalProps) {
  const [search, setSearch] = useState('');
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );
  
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col bg-background/95 backdrop-blur-2xl border-border/30">
        <DialogHeader className="pb-4 border-b border-border/20">
          <DialogTitle className="text-lg font-semibold tracking-tight">Select Make</DialogTitle>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative py-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            type="text"
            placeholder="Search makes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-muted/20 border-border/30"
          />
        </div>
        
        {/* Selected count */}
        {selected.length > 0 && (
          <div className="flex items-center justify-between py-2 px-1">
            <span className="text-sm text-muted-foreground/70 font-medium">{selected.length} selected</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm font-semibold text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        )}
        
        {/* Options list */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-1 min-h-0 [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/15">
          {filteredOptions.map((option) => {
            const isSelected = selected.includes(option.value);
            
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex items-center justify-between w-full py-3 px-3 rounded-lg',
                  'text-[15px] transition-all duration-150',
                  isSelected
                    ? 'text-foreground font-semibold bg-muted/40'
                    : 'text-foreground/80 font-medium hover:text-foreground hover:bg-muted/20'
                )}
              >
                <span className="tracking-tight">{option.label}</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-muted-foreground/60 tabular-nums font-medium">{option.count}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-foreground" />}
                </div>
              </button>
            );
          })}
          
          {filteredOptions.length === 0 && (
            <p className="text-sm text-muted-foreground/50 text-center py-8">No makes found</p>
          )}
        </div>
        
        {/* Done button */}
        <div className="pt-4 border-t border-border/20">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
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
          <div key={i} className="h-10 bg-muted/10 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/40 py-3">No options available</p>
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
              'text-[15px] transition-all duration-150',
              isSelected
                ? 'text-foreground font-semibold bg-muted/40'
                : 'text-foreground/80 font-medium hover:text-foreground hover:bg-muted/20'
            )}
          >
            <span className="tracking-tight">
              {option.label}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-muted-foreground/60 tabular-nums font-medium">{option.count}</span>
              {isSelected && <CheckCircle2 className="h-4 w-4 text-foreground" />}
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
                  'px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'bg-muted/20 text-foreground/80 hover:text-foreground hover:bg-muted/40'
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
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="Min"
              min={rangeMin}
              max={rangeMax}
              step={step}
              className="flex-1 h-10"
            />
            <span className="text-muted-foreground/30 text-sm font-medium">–</span>
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
          className="flex-1 h-10"
        />
      </div>

      {/* Current range label */}
      {(minValue || maxValue) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground/70 font-semibold">
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
            onClick={() => {
              onChange(undefined, undefined);
              setLocalMin('');
              setLocalMax('');
            }}
            className="text-muted-foreground/60 hover:text-foreground transition-colors font-semibold"
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
