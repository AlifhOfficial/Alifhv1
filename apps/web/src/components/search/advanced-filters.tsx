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
import { CheckCircle2, ChevronDown, SlidersHorizontal } from 'lucide-react';
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

// Import static data from centralized constants (client-side, no DB calls)
import {
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  ENGINE_SIZES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
} from '@/lib/filter-constants';

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

  const advancedCount = countAdvancedFilters(params);

  const handleFilterChange = (filters: Partial<SearchParams>) => {
    onFilterChange(filters);
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onFilterChange({
      bodyType: undefined,
      fuelType: undefined,
      transmission: undefined,
      engineSize: undefined,
      exteriorColor: undefined,
      interiorColor: undefined,
      sellerType: undefined,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <SheetTrigger asChild>
        {children || (
          <button type="button" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-[15px] transition-colors text-primary font-semibold hover:text-primary/90 whitespace-nowrap">
            <span className="hidden sm:inline">Advanced Filters</span>
            <span className="sm:hidden">Filters</span>
            {advancedCount > 0 && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-semibold bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0">
                {advancedCount}
              </span>
            )}
          </button>
        )}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        overlayClassName="backdrop-blur-md bg-background/30"
        className="w-80 sm:w-[400px] p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border !fixed !inset-y-0 !right-0"
      >
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 p-6 pb-4 border-b border-sidebar-border/50">
          <SheetTitle className="text-xl font-bold tracking-tight">More Filters</SheetTitle>
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
            selected={params.bodyType ?? []}
            onChange={(bodyType) => handleFilterChange({ bodyType: bodyType as any })}
          />

          {/* Fuel Type */}
          <FilterGroup
            title="Fuel Type"
            options={FUEL_TYPES.map(f => ({
              value: f.value,
              label: f.label,
              count: facets?.fuelType.find(x => x.value === f.value)?.count ?? 0,
            }))}
            selected={params.fuelType ?? []}
            onChange={(fuelType) => handleFilterChange({ fuelType: fuelType as any })}
          />

          {/* Transmission */}
          <FilterGroup
            title="Transmission"
            options={TRANSMISSION_TYPES.map(t => ({
              value: t.value,
              label: t.label,
              count: facets?.transmission.find(x => x.value === t.value)?.count ?? 0,
            }))}
            selected={params.transmission ?? []}
            onChange={(transmission) => handleFilterChange({ transmission: transmission as any })}
          />

          {/* Engine Size */}
          <FilterGroup
            title="Engine Size"
            options={ENGINE_SIZES.map(e => ({
              value: e.value,
              label: e.label,
              count: facets?.engineSize.find(x => x.value === e.value)?.count ?? 0,
            }))}
            selected={params.engineSize ?? []}
            onChange={(engineSize) => handleFilterChange({ engineSize: engineSize as any })}
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
            selected={params.exteriorColor ?? []}
            onChange={(exteriorColor) => handleFilterChange({ exteriorColor: exteriorColor as any })}
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
            selected={params.interiorColor ?? []}
            onChange={(interiorColor) => handleFilterChange({ interiorColor: interiorColor as any })}
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
            selected={params.sellerType ? [params.sellerType] : []}
            onChange={(sellerType) => handleFilterChange({ 
              sellerType: sellerType[0] as 'dealer' | 'private' | undefined 
            })}
            singleSelect
          />
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-6 bg-sidebar border-t border-sidebar-border/50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleReset(e)}
              className="flex-1 px-4 py-2.5 text-[15px] font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-full border border-sidebar-border/50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors"
            >
              Close
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
          <button type="button" className="flex w-full items-center justify-between py-2 text-[15px] hover:bg-sidebar-accent/50 rounded-lg px-2 -mx-2 transition-colors">
            <span className="font-bold tracking-tight">{title}</span>
            <div className="flex items-center gap-2">
              {selected.length > 0 && (
                <span className="w-5 h-5 text-xs font-semibold bg-sidebar-accent text-sidebar-foreground rounded-full flex items-center justify-center">
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
                      type="button"
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
                        <CheckCircle2 className={cn(
                          'h-4 w-4',
                          option.value === 'white' || option.value === 'beige' || option.value === 'yellow' || option.value === 'gold'
                            ? 'text-green-600'
                            : 'text-green-400'
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
                      type="button"
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors',
                        'text-[15px] text-left',
                        isSelected
                          ? 'bg-sidebar-accent text-sidebar-foreground'
                          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <span className={isSelected ? 'font-semibold tracking-tight' : 'font-medium tracking-tight'}>
                        {option.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-sidebar-foreground/60 tabular-nums font-medium">
                          {option.count}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground font-semibold transition-colors mt-2 px-3"
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
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors',
        checked 
          ? 'bg-sidebar-accent text-sidebar-foreground' 
          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
      )}
    >
      <span className="text-[15px] font-semibold tracking-tight">{label}</span>
      <div className={cn(
        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
        checked
          ? 'bg-sidebar-foreground border-sidebar-foreground'
          : 'border-sidebar-border bg-transparent'
      )}>
        {checked && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
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
  return count;
}
