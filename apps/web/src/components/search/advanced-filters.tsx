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
}

export function AdvancedFilters({
  params,
  facets,
  onFilterChange,
  activeCount = 0,
  children,
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
      sellerType: undefined,
    });
  };

  const handleClose = () => {
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

  // Content component to avoid duplication
  const FilterContent = () => (
    <div className="space-y-0.5">
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
              defaultOpen={false}
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
              defaultOpen={false}
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
        defaultOpen={false}
      />
    </div>
  );

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
              <FilterContent />
            </div>

            {/* Sticky Footer with Apply Button */}
            <div className="shrink-0 px-5 py-4 border-t border-border bg-background/95 backdrop-blur-sm pb-safe">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all touch-manipulation shadow-lg"
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
              <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-foreground text-background rounded-full flex items-center justify-center">
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
              <FilterContent />
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
          <button type="button" className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-muted/30 rounded-lg transition-colors">
            <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground/80">{title}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3">
            {showColors ? (
              // Color grid with labels on hover
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'w-7 h-7 rounded-full border transition-all duration-150 flex items-center justify-center',
                        isSelected
                          ? 'border-foreground/80 ring-1 ring-foreground/15 scale-105'
                          : 'border-sidebar-border/80 hover:border-muted-foreground/40 hover:scale-105'
                      )}
                      style={{ backgroundColor: option.hex }}
                      title={`${option.label}`}
                    >
                      {isSelected && (
                        <CheckCircle2 className={cn(
                          'h-3.5 w-3.5',
                          option.value === 'white' || option.value === 'beige' || option.value === 'yellow' || option.value === 'gold'
                            ? 'text-foreground/80'
                            : 'text-white/90'
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // List items with clear hierarchy
              <ul className="space-y-0.5">
                {availableOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <li
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 cursor-pointer rounded-md',
                        'transition-colors duration-100',
                        isSelected 
                          ? 'bg-sidebar-accent' 
                          : 'hover:bg-sidebar-accent'
                      )}
                    >
                      <span className={cn(
                        "text-[15px] font-semibold tracking-tight",
                        isSelected 
                          ? "text-sidebar-foreground" 
                          : "text-sidebar-foreground/80"
                      )}>
                        {option.label}
                      </span>
                      {isSelected && <CheckCircle2 className="size-4 text-foreground" />}
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
