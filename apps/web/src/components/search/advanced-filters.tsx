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
import { Check, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  /** Render inline content only (no sheet/popover wrapper) */
  inline?: boolean;
}

export function AdvancedFilters({
  params,
  facets: _facets,
  onFilterChange,
  activeCount: _activeCount = 0,
  children,
  inline = false,
}: AdvancedFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
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
    });
  };

  const _handleClose = () => {
    setMobileOpen(false);
    setDesktopOpen(false);
  };

  // Close desktop panel on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    };

    if (desktopOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [desktopOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopOpen(false);
      }
    };

    if (desktopOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [desktopOpen]);

  const hasAnyOptions = true;

  // Content as JSX variable (not a component) to prevent remounting on state change
  const filterContent = !hasAnyOptions ? (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <SlidersHorizontal className="h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">No filters available</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search criteria</p>
    </div>
  ) : (
    <div className="space-y-0.5">
            {/* Body Type */}
            <FilterGroup
              title="Body Type"
              options={BODY_TYPES.map(b => ({
                value: b.value,
                label: b.label,
              }))}
              selected={params.bodyType ?? []}
              onChange={(bodyType) => handleFilterChange({ bodyType: bodyType as any })}
              defaultOpen={false}
              selectedCount={params.bodyType?.length ?? 0}
            />

            {/* Fuel Type */}
            <FilterGroup
              title="Fuel Type"
              options={FUEL_TYPES.map(f => ({
                value: f.value,
                label: f.label,
              }))}
              selected={params.fuelType ?? []}
              onChange={(fuelType) => handleFilterChange({ fuelType: fuelType as any })}
              defaultOpen={false}
              selectedCount={params.fuelType?.length ?? 0}
            />

            {/* Transmission */}
            <FilterGroup
              title="Transmission"
              options={TRANSMISSION_TYPES.map(t => ({
                value: t.value,
                label: t.label,
              }))}
              selected={params.transmission ?? []}
              onChange={(transmission) => handleFilterChange({ transmission: transmission as any })}
              defaultOpen={false}
              selectedCount={params.transmission?.length ?? 0}
            />

            {/* Engine Size */}
            <FilterGroup
              title="Engine Size"
              options={ENGINE_SIZES.map(e => ({
                value: e.value,
                label: e.label,
              }))}
              selected={params.engineSize ?? []}
              onChange={(engineSize) => handleFilterChange({ engineSize: engineSize as any })}
              defaultOpen={false}
              selectedCount={params.engineSize?.length ?? 0}
            />

            {/* Exterior Color */}
            <FilterGroup
              title="Exterior Color"
              options={EXTERIOR_COLORS.map(c => ({
                value: c.value,
                label: c.label,
                hex: c.hex,
              }))}
              selected={params.exteriorColor ?? []}
              onChange={(exteriorColor) => handleFilterChange({ exteriorColor: exteriorColor as any })}
              showColors
              defaultOpen={false}
              selectedCount={params.exteriorColor?.length ?? 0}
            />

            {/* Interior Color */}
            <FilterGroup
              title="Interior Color"
              options={INTERIOR_COLORS.map(c => ({
                value: c.value,
                label: c.label,
                hex: c.hex,
              }))}
              selected={params.interiorColor ?? []}
              onChange={(interiorColor) => handleFilterChange({ interiorColor: interiorColor as any })}
              showColors
              defaultOpen={false}
              selectedCount={params.interiorColor?.length ?? 0}
            />
    </div>
  );

  // If inline mode, just return the filter content directly
  if (inline) {
    return filterContent;
  }

  // Footer component
  const FilterFooter = () => advancedCount > 0 ? (
    <div className="px-4 py-3 border-t border-sidebar-border">
      <button
        type="button"
        onClick={(e) => handleReset(e)}
        className={cn(
          "w-full px-3 py-2 text-sm font-medium",
          "text-muted-foreground/70 hover:text-sidebar-foreground/80",
          "hover:bg-muted/40 rounded-lg",
          "transition-colors"
        )}
      >
        Reset all filters
      </button>
    </div>
  ) : null;

  return (
    <>
      {/* Mobile: Use Sheet with pill-style trigger */}
      <div className="sm:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button 
              type="button"
              className={cn(
                "flex items-center gap-1.5 h-9 px-3.5 text-sm font-semibold rounded-full transition-colors touch-manipulation",
                advancedCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <span>More</span>
              {advancedCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-primary-foreground text-primary rounded-full flex items-center justify-center">
                  {advancedCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-[90vh] p-0 bg-background text-foreground border-t-0 rounded-t-3xl flex flex-col shadow-2xl"
            overlayClassName="bg-black/60"
          >
            <SheetTitle className="sr-only">More Filters</SheetTitle>
            
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">More Filters</h3>
                  {advancedCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {advancedCount} filter{advancedCount > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {advancedCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => handleReset(e)}
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground touch-manipulation px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors touch-manipulation"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {filterContent}
            </div>

            {/* Sticky Footer with Apply Button */}
            <div className="shrink-0 px-5 py-4 border-t border-border bg-background/95 backdrop-blur-sm pb-safe">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-[background-color,transform] will-change-transform touch-manipulation shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Use floating panel */}
      <div ref={containerRef} className="relative hidden sm:block">
        {/* Trigger Button */}
        {children ? (
          <div onClick={() => setDesktopOpen(!desktopOpen)}>
            {children}
          </div>
        ) : (
          <button 
            type="button"
            onClick={() => setDesktopOpen(!desktopOpen)}
            className="flex items-center gap-2 h-9 px-4 text-sm font-semibold bg-sidebar border border-sidebar-border rounded-full text-sidebar-foreground/70 hover:text-sidebar-foreground shadow-sm transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>More Filters</span>
            {advancedCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {advancedCount}
              </span>
            )}
          </button>
        )}

        {/* Floating Panel */}
        {desktopOpen && (
          <div 
            className={cn(
              "absolute top-full right-0 z-50 mt-2",
              "w-[420px]",
              "bg-sidebar border border-sidebar-border rounded-2xl shadow-xl",
              "overflow-hidden",
              "animate-in fade-in-0 slide-in-from-top-2 duration-150"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-sidebar-border">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground/70" />
                <h3 className="text-[15px] font-semibold tracking-tight text-sidebar-foreground/80">More Filters</h3>
              </div>
              <button 
                type="button"
                onClick={() => setDesktopOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[70vh] overflow-y-auto p-3">
              {filterContent}
            </div>

            <FilterFooter />
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// FILTER GROUP COMPONENT
// ============================================================================

interface FilterOption {
  value: string;
  label: string;
  count?: number;
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
  selectedCount?: number;
}

function FilterGroup({
  title,
  options,
  selected,
  onChange,
  singleSelect = false,
  showColors = false,
  defaultOpen = true,
  selectedCount = 0,
}: FilterGroupProps) {
  // Use controlled state to prevent closing on parent re-render
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const availableOptions = options;

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <div>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex w-full items-center justify-between py-3 hover:bg-muted/30 rounded-lg transition-colors touch-manipulation">
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">{title}</span>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <span className="min-w-[20px] h-[20px] px-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {selectedCount}
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground/60 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pl-3 pb-3">
          <div>
            {showColors ? (
              // Color grid - simple check mark on selected
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-all duration-150 flex items-center justify-center',
                        isSelected
                          ? 'border-foreground scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: option.hex }}
                      title={option.label}
                    >
                      {isSelected && (
                        <Check className={cn(
                          'h-3.5 w-3.5 stroke-[3]',
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
              // List items - clean and simple
              <div className="flex flex-col gap-0.5">
                {availableOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'flex items-center w-full pl-3 py-2.5 rounded-md touch-manipulation',
                        'text-base font-medium tracking-tight transition-colors duration-100',
                        isSelected 
                          ? 'bg-muted text-foreground font-semibold' 
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function countAdvancedFilters(params: SearchParams): number {
  let count = 0;
  count += params.bodyType?.length ?? 0;
  count += params.fuelType?.length ?? 0;
  count += params.transmission?.length ?? 0;
  count += params.engineSize?.length ?? 0;
  count += params.exteriorColor?.length ?? 0;
  count += params.interiorColor?.length ?? 0;
  if (params.sellerType) count++;
  return count;
}
