'use client';

/**
 * AdvancedFilters - Advanced tier filters drawer
 * 
 * All remaining filters in a drawer/modal:
 * - Body type
 * - Fuel type
 * - Transmission
 * - Engine size
 * - Colors
 * - Seller type
 * - Features
 * 
 * @module components/search/advanced-filters
 */

import { useState } from 'react';
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { SearchParams, SearchFacets } from '@/lib/search-utils';

// Static data for filters (client-safe)
const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'pickup', label: 'Pickup Truck' },
  { value: 'van', label: 'Van' },
  { value: 'sports', label: 'Sports Car' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'other', label: 'Other' },
];

const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plugin_hybrid', label: 'Plug-in Hybrid' },
  { value: 'hydrogen', label: 'Hydrogen' },
];

const TRANSMISSION_TYPES = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
  { value: 'dct', label: 'Dual Clutch (DCT)' },
  { value: 'semi_automatic', label: 'Semi-Automatic' },
];

const ENGINE_SIZES = [
  { value: 'under_1.5L', label: 'Under 1.5L' },
  { value: '1.5L_2.0L', label: '1.5L - 2.0L' },
  { value: '2.0L_2.5L', label: '2.0L - 2.5L' },
  { value: '2.5L_3.0L', label: '2.5L - 3.0L' },
  { value: '3.0L_4.0L', label: '3.0L - 4.0L' },
  { value: '4.0L_5.0L', label: '4.0L - 5.0L' },
  { value: '5.0L_6.0L', label: '5.0L - 6.0L' },
  { value: 'over_6.0L', label: 'Over 6.0L' },
  { value: 'electric', label: 'Electric' },
];

const EXTERIOR_COLORS = [
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'silver', label: 'Silver', hex: '#C0C0C0' },
  { value: 'grey', label: 'Grey', hex: '#808080' },
  { value: 'blue', label: 'Blue', hex: '#0066CC' },
  { value: 'red', label: 'Red', hex: '#CC0000' },
  { value: 'green', label: 'Green', hex: '#228B22' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'gold', label: 'Gold', hex: '#FFD700' },
  { value: 'orange', label: 'Orange', hex: '#FF8C00' },
  { value: 'yellow', label: 'Yellow', hex: '#FFD700' },
  { value: 'purple', label: 'Purple', hex: '#800080' },
  { value: 'other', label: 'Other', hex: '#CCCCCC' },
];

const INTERIOR_COLORS = [
  { value: 'black', label: 'Black', hex: '#1A1A1A' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'tan', label: 'Tan', hex: '#D2B48C' },
  { value: 'grey', label: 'Grey', hex: '#808080' },
  { value: 'white', label: 'White', hex: '#F5F5F5' },
  { value: 'red', label: 'Red', hex: '#8B0000' },
  { value: 'burgundy', label: 'Burgundy', hex: '#800020' },
  { value: 'other', label: 'Other', hex: '#CCCCCC' },
];

interface AdvancedFiltersProps {
  params: SearchParams;
  facets: SearchFacets | undefined;
  onFilterChange: (filters: Partial<SearchParams>) => void;
  activeCount?: number;
  children?: React.ReactNode;
}

export function AdvancedFilters({
  params,
  facets,
  onFilterChange,
  activeCount = 0,
  children,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Partial<SearchParams>>({});

  const mergedParams = { ...params, ...localFilters };
  const advancedCount = countAdvancedFilters(mergedParams);

  const handleLocalChange = (filters: Partial<SearchParams>) => {
    setLocalFilters(prev => ({ ...prev, ...filters }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setLocalFilters({});
    setIsOpen(false);
  };

  const handleReset = () => {
    onFilterChange({
      bodyType: undefined,
      fuelType: undefined,
      transmission: undefined,
      engineSize: undefined,
      exteriorColor: undefined,
      interiorColor: undefined,
      sellerType: undefined,
      partnerVerified: undefined,
      isNegotiable: undefined,
    });
    setLocalFilters({});
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">More</span>
            {advancedCount > 0 && (
              <span className="w-5 h-5 text-xs font-medium bg-foreground text-background rounded-full flex items-center justify-center">
                {advancedCount}
              </span>
            )}
          </button>
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-80 sm:w-[400px] p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border">
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 p-6 pb-4 border-b border-sidebar-border/50">
          <SheetTitle className="text-lg font-semibold tracking-tight">More Filters</SheetTitle>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Body Type */}
          <FilterGroup
            title="Body Type"
            options={BODY_TYPES.map(b => ({
              value: b.value,
              label: b.label,
              count: facets?.bodyType.find(f => f.value === b.value)?.count ?? 0,
            }))}
            selected={mergedParams.bodyType ?? []}
            onChange={(bodyType) => handleLocalChange({ bodyType: bodyType as any })}
          />

          {/* Fuel Type */}
          <FilterGroup
            title="Fuel Type"
            options={FUEL_TYPES.map(f => ({
              value: f.value,
              label: f.label,
              count: facets?.fuelType.find(x => x.value === f.value)?.count ?? 0,
            }))}
            selected={mergedParams.fuelType ?? []}
            onChange={(fuelType) => handleLocalChange({ fuelType: fuelType as any })}
          />

          {/* Transmission */}
          <FilterGroup
            title="Transmission"
            options={TRANSMISSION_TYPES.map(t => ({
              value: t.value,
              label: t.label,
              count: facets?.transmission.find(x => x.value === t.value)?.count ?? 0,
            }))}
            selected={mergedParams.transmission ?? []}
            onChange={(transmission) => handleLocalChange({ transmission: transmission as any })}
          />

          {/* Engine Size */}
          <FilterGroup
            title="Engine Size"
            options={ENGINE_SIZES.map(e => ({
              value: e.value,
              label: e.label,
              count: facets?.engineSize.find(x => x.value === e.value)?.count ?? 0,
            }))}
            selected={mergedParams.engineSize ?? []}
            onChange={(engineSize) => handleLocalChange({ engineSize: engineSize as any })}
          />

          {/* Exterior Color */}
          <FilterGroup
            title="Exterior Color"
            options={EXTERIOR_COLORS.map(c => ({
              value: c.value,
              label: c.label,
              count: facets?.exteriorColor.find(x => x.value === c.value)?.count ?? 0,
              hex: c.hex,
            }))}
            selected={mergedParams.exteriorColor ?? []}
            onChange={(exteriorColor) => handleLocalChange({ exteriorColor: exteriorColor as any })}
            showColors
          />

          {/* Interior Color */}
          <FilterGroup
            title="Interior Color"
            options={INTERIOR_COLORS.map(c => ({
              value: c.value,
              label: c.label,
              count: facets?.interiorColor.find(x => x.value === c.value)?.count ?? 0,
              hex: c.hex,
            }))}
            selected={mergedParams.interiorColor ?? []}
            onChange={(interiorColor) => handleLocalChange({ interiorColor: interiorColor as any })}
            showColors
          />

          {/* Seller Type */}
          <FilterGroup
            title="Seller Type"
            options={[
              { 
                value: 'dealer', 
                label: 'Dealer', 
                count: facets?.sellerType.find(x => x.value === 'dealer')?.count ?? 0 
              },
              { 
                value: 'private', 
                label: 'Private', 
                count: facets?.sellerType.find(x => x.value === 'private')?.count ?? 0 
              },
            ]}
            selected={mergedParams.sellerType ? [mergedParams.sellerType] : []}
            onChange={(sellerType) => handleLocalChange({ 
              sellerType: sellerType[0] as 'dealer' | 'private' | undefined 
            })}
            singleSelect
          />

          {/* Other Options */}
          <Collapsible asChild defaultOpen className="group/collapsible">
            <div>
              <CollapsibleTrigger asChild>
                <button className="flex w-full items-center justify-between py-2 text-sm hover:bg-sidebar-accent/50 rounded-lg px-2 -mx-2 transition-colors">
                  <span className="font-semibold tracking-tight">Other Options</span>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="pt-3 space-y-1">
                  <ToggleOption
                    label="Verified Partner"
                    checked={mergedParams.partnerVerified === true}
                    onChange={(checked) => handleLocalChange({ 
                      partnerVerified: checked ? true : undefined 
                    })}
                  />
                  
                  <ToggleOption
                    label="Negotiable Price"
                    checked={mergedParams.isNegotiable === true}
                    onChange={(checked) => handleLocalChange({ 
                      isNegotiable: checked ? true : undefined 
                    })}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-6 bg-sidebar border-t border-sidebar-border/50">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-full border border-sidebar-border/50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 rounded-full transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// FILTER GROUP COMPONENT
// ============================================================================

interface FilterOption {
  value: string;
  label: string;
  count: number;
  hex?: string;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  singleSelect?: boolean;
  showColors?: boolean;
}

function FilterGroup({
  title,
  options,
  selected,
  onChange,
  singleSelect = false,
  showColors = false,
}: FilterGroupProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Filter out options with 0 count unless selected
  const availableOptions = options.filter(o => o.count > 0 || selected.includes(o.value));
  const visibleOptions = expanded ? availableOptions : availableOptions.slice(0, 6);
  const hasMore = !expanded && availableOptions.length > 6;

  const toggleOption = (value: string) => {
    if (singleSelect) {
      onChange(selected.includes(value) ? [] : [value]);
    } else {
      if (selected.includes(value)) {
        onChange(selected.filter(v => v !== value));
      } else {
        onChange([...selected, value]);
      }
    }
  };

  if (availableOptions.length === 0) return null;

  return (
    <Collapsible asChild defaultOpen className="group/collapsible">
      <div>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between py-2 text-sm hover:bg-sidebar-accent/50 rounded-lg px-2 -mx-2 transition-colors">
            <span className="font-semibold tracking-tight">{title}</span>
            <div className="flex items-center gap-2">
              {selected.length > 0 && (
                <span className="w-5 h-5 text-xs font-medium bg-sidebar-accent text-sidebar-foreground rounded-full flex items-center justify-center">
                  {selected.length}
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="pt-3 pb-2">
            {showColors ? (
              // Color grid
              <div className="flex flex-wrap gap-2.5">
                {visibleOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center',
                        isSelected
                          ? 'border-sidebar-foreground ring-2 ring-offset-2 ring-sidebar-foreground/20'
                          : 'border-sidebar-border hover:border-sidebar-foreground/40'
                      )}
                      style={{ backgroundColor: option.hex }}
                      title={`${option.label} (${option.count})`}
                    >
                      {isSelected && (
                        <Check className={cn(
                          'h-4 w-4',
                          option.value === 'white' || option.value === 'beige' || option.value === 'yellow' || option.value === 'gold'
                            ? 'text-sidebar-foreground'
                            : 'text-white'
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Standard list
              <div className="space-y-1">
                {visibleOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors',
                        'text-sm text-left',
                        isSelected
                          ? 'bg-sidebar-accent text-sidebar-foreground'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <span className={isSelected ? 'font-medium tracking-tight' : 'tracking-tight'}>
                        {option.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-sidebar-foreground/50 tabular-nums">
                          {option.count}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-sidebar-foreground" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {hasMore && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mt-2 px-3"
              >
                Show {availableOptions.length - 6} more
              </button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ============================================================================
// TOGGLE OPTION
// ============================================================================

interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({ label, checked, onChange }: ToggleOptionProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors',
        checked 
          ? 'bg-sidebar-accent text-sidebar-foreground' 
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
      )}
    >
      <span className="text-sm font-medium tracking-tight">{label}</span>
      <div className={cn(
        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
        checked
          ? 'bg-sidebar-foreground border-sidebar-foreground'
          : 'border-sidebar-border bg-transparent'
      )}>
        {checked && <Check className="h-3.5 w-3.5 text-sidebar" />}
      </div>
    </button>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function countAdvancedFilters(params: SearchParams): number {
  let count = 0;
  if (params.bodyType?.length) count++;
  if (params.fuelType?.length) count++;
  if (params.transmission?.length) count++;
  if (params.engineSize?.length) count++;
  if (params.exteriorColor?.length) count++;
  if (params.interiorColor?.length) count++;
  if (params.sellerType) count++;
  if (params.partnerVerified !== undefined) count++;
  if (params.isNegotiable !== undefined) count++;
  return count;
}
