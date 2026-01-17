'use client';

/**
 * AdvancedFilters - Floating panel for advanced filters
 * 
 * A floating panel (like search dropdown) on the right side:
 * - Body type
 * - Fuel type
 * - Transmission
 * - Engine size
 * - Colors
 * - Seller type
 * 
 * @module components/search/advanced-filters
 */

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      {children ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {children}
        </div>
      ) : (
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 h-9 px-4 text-sm font-semibold bg-sidebar border border-sidebar-border rounded-full text-sidebar-foreground/70 hover:text-sidebar-foreground shadow-sm transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">More Filters</span>
          <span className="sm:hidden">Filters</span>
        </button>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div 
          className={cn(
            "absolute top-full right-0 z-50 mt-2",
            "w-[360px] sm:w-[420px]",
            "bg-sidebar border border-sidebar-border rounded-2xl shadow-xl",
            "overflow-hidden",
            "animate-in fade-in-0 slide-in-from-top-2 duration-150"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-base font-bold text-sidebar-foreground">More Filters</h3>
            </div>
            <button 
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[85vh] overflow-y-auto p-4 space-y-1">
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
              defaultOpen={false}
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
              defaultOpen={false}
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
              defaultOpen={false}
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
              defaultOpen={false}
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
              defaultOpen={true}
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
              defaultOpen={true}
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
              defaultOpen={true}
            />
          </div>

          {/* Footer */}
          {advancedCount > 0 && (
            <div className="px-5 py-4 border-t border-sidebar-border">
              <button
                type="button"
                onClick={(e) => handleReset(e)}
                className={cn(
                  "w-full px-4 py-3 text-sm font-semibold",
                  "text-muted-foreground hover:text-sidebar-foreground",
                  "hover:bg-muted rounded-2xl",
                  "transition-colors"
                )}
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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
  defaultOpen?: boolean;
}

function FilterGroup({
  title,
  options,
  selected,
  onChange,
  singleSelect = false,
  showColors = false,
  defaultOpen = true,
}: FilterGroupProps) {
  // Show all options - no more "show more"
  const availableOptions = options.filter(o => o.count > 0 || selected.includes(o.value));

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
    <Collapsible asChild defaultOpen={defaultOpen} className="group/collapsible">
      <div>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex w-full items-center justify-between px-4 py-4 hover:bg-muted/30 rounded-2xl transition-colors">
            <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">{title}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {showColors ? (
              // Color grid with labels on hover
              <div className="flex flex-wrap gap-2.5">
                {availableOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all duration-150 flex items-center justify-center',
                        isSelected
                          ? 'border-foreground ring-2 ring-foreground/20 scale-110'
                          : 'border-sidebar-border hover:border-muted-foreground/50 hover:scale-105'
                      )}
                      style={{ backgroundColor: option.hex }}
                      title={`${option.label}`}
                    >
                      {isSelected && (
                        <CheckCircle2 className={cn(
                          'h-4 w-4',
                          option.value === 'white' || option.value === 'beige' || option.value === 'yellow' || option.value === 'gold'
                            ? 'text-foreground'
                            : 'text-white'
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // List items with clear hierarchy
              <ul className="space-y-1">
                {availableOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <li
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 cursor-pointer rounded-2xl',
                        'transition-colors duration-100',
                        isSelected 
                          ? 'bg-muted/50' 
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <span className={cn(
                        "text-[15px]",
                        isSelected 
                          ? "font-semibold text-sidebar-foreground" 
                          : "font-medium text-sidebar-foreground/70"
                      )}>
                        {option.label}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-foreground" />}
                    </li>
                  );
                })}
              </ul>
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
        {checked && <CheckCircle2 className="h-3.5 w-3.5 text-sidebar" />}
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
