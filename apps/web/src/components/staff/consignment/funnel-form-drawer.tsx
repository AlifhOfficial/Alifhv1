/**
 * Funnel Form Drawer Component
 * Create or edit a consignment funnel using a right-side drawer
 * Follows the advanced-filters UI pattern with searchable combobox
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ChevronDown, CheckCircle2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetOverlay,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input, Switch } from '@/components/ui/forms';

// Import from shared constants
import {
  CAR_MAKES,
  BODY_TYPES,
  FUEL_TYPES,
  SPECS_TYPES,
  UAE_EMIRATES,
} from '@/components/listings/listing-form/constants';

interface FunnelFilters {
  makes?: string[];
  bodyTypes?: string[];
  fuelTypes?: string[];
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  emirates?: string[];
  specs?: string[];
}

interface ConsignmentFunnel {
  id: string;
  partnerId: string;
  name: string;
  description: string | null;
  filters: FunnelFilters;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FunnelFormDrawerProps {
  open: boolean;
  onClose: () => void;
  funnel: ConsignmentFunnel | null;
}

export function FunnelFormDrawer({ open, onClose, funnel }: FunnelFormDrawerProps) {
  const queryClient = useQueryClient();
  const isEditing = !!funnel;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [filters, setFilters] = useState<FunnelFilters>({});

  // Reset form when drawer opens/closes or funnel changes
  useEffect(() => {
    if (open) {
      if (funnel) {
        setName(funnel.name);
        setDescription(funnel.description || '');
        setIsActive(funnel.isActive);
        setFilters(funnel.filters);
      } else {
        setName('');
        setDescription('');
        setIsActive(true);
        setFilters({});
      }
    }
  }, [open, funnel]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string | null; filters: FunnelFilters; isActive: boolean }) => {
      const res = await fetch('/api/partner/consignment/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create funnel');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consignment-funnels'] });
      queryClient.invalidateQueries({ queryKey: ['partner-all-funnels'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; description?: string | null; filters?: FunnelFilters; isActive?: boolean }) => {
      const res = await fetch(`/api/partner/consignment/funnels/${funnel!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to update funnel');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consignment-funnels'] });
      queryClient.invalidateQueries({ queryKey: ['partner-all-funnels'] });
      onClose();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const data = {
      name: name.trim(),
      description: description.trim() || null,
      filters,
      isActive,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleReset = () => {
    setFilters({});
  };

  const toggleArrayFilter = useCallback(<K extends keyof FunnelFilters>(key: K, value: string) => {
    setFilters(prev => {
      const current = (prev[key] as string[] | undefined) || [];
      if (current.includes(value)) {
        const newArr = current.filter(v => v !== value);
        return { ...prev, [key]: newArr.length ? newArr : undefined };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  }, []);

  const setRangeFilter = useCallback((minKey: keyof FunnelFilters, maxKey: keyof FunnelFilters, min?: number, max?: number) => {
    setFilters(prev => ({
      ...prev,
      [minKey]: min,
      [maxKey]: max,
    }));
  }, []);

  const currentYear = new Date().getFullYear();
  const filterCount = countFilters(filters);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetOverlay className="backdrop-blur-md bg-background/30" />
      <SheetContent side="right" className="w-80 sm:w-[420px] p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border">
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 p-6 pb-4 border-b border-sidebar-border/50">
          <SheetTitle className="text-xl font-bold tracking-tight">
            {isEditing ? 'Edit Funnel' : 'New Funnel'}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-foreground/10">
          
          {/* Funnel Name */}
          <div className="space-y-2">
            <label className="text-[15px] font-bold tracking-tight">Funnel Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Luxury SUVs 2020+"
              className="h-11 bg-sidebar-accent/30 border-sidebar-border/50"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[15px] font-bold tracking-tight">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes..."
              className="h-11 bg-sidebar-accent/30 border-sidebar-border/50"
              maxLength={200}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-[15px] font-bold tracking-tight">Active</span>
              <p className="text-xs text-sidebar-foreground/60 mt-0.5">Show in your funnels list</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="h-px bg-sidebar-border/30" />

          {/* Filter Criteria Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold tracking-tight">Filter Criteria</h3>
            {filterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-semibold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Makes - Searchable Combobox */}
          <SearchableFilterGroup
            title="Makes"
            options={CAR_MAKES.map(m => ({ value: m, label: m }))}
            selected={filters.makes || []}
            onChange={(value) => toggleArrayFilter('makes', value)}
            searchPlaceholder="Search makes..."
          />

          {/* Body Types - Searchable */}
          <SearchableFilterGroup
            title="Body Types"
            options={BODY_TYPES.map(b => ({ value: b.value, label: b.label }))}
            selected={filters.bodyTypes || []}
            onChange={(value) => toggleArrayFilter('bodyTypes', value)}
            searchPlaceholder="Search body types..."
          />

          {/* Fuel Types - Searchable */}
          <SearchableFilterGroup
            title="Fuel Types"
            options={FUEL_TYPES.map(f => ({ value: f.value, label: f.label }))}
            selected={filters.fuelTypes || []}
            onChange={(value) => toggleArrayFilter('fuelTypes', value)}
            searchPlaceholder="Search fuel types..."
          />

          {/* Year Range */}
          <FilterSection title="Year Range">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={filters.minYear || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Min"
                min={1990}
                max={currentYear + 1}
                className="flex-1 h-10 bg-sidebar-accent/30 border-sidebar-border/50"
              />
              <span className="text-sidebar-foreground/30 text-sm font-medium">–</span>
              <Input
                type="number"
                value={filters.maxYear || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Max"
                min={1990}
                max={currentYear + 1}
                className="flex-1 h-10 bg-sidebar-accent/30 border-sidebar-border/50"
              />
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range (AED)">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Min"
                min={0}
                step={10000}
                className="flex-1 h-10 bg-sidebar-accent/30 border-sidebar-border/50"
              />
              <span className="text-sidebar-foreground/30 text-sm font-medium">–</span>
              <Input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Max"
                min={0}
                step={10000}
                className="flex-1 h-10 bg-sidebar-accent/30 border-sidebar-border/50"
              />
            </div>
          </FilterSection>

          {/* Max Mileage */}
          <FilterSection title="Max Mileage (km)">
            <Input
              type="number"
              value={filters.maxMileage || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxMileage: e.target.value ? parseInt(e.target.value) : undefined }))}
              placeholder="e.g., 100000"
              min={0}
              step={10000}
              className="h-10 bg-sidebar-accent/30 border-sidebar-border/50"
            />
          </FilterSection>

          {/* Emirates - Searchable */}
          <SearchableFilterGroup
            title="Emirates"
            options={UAE_EMIRATES.map(e => ({ value: e.value, label: e.label }))}
            selected={filters.emirates || []}
            onChange={(value) => toggleArrayFilter('emirates', value)}
            searchPlaceholder="Search emirates..."
          />

          {/* Specs - Searchable */}
          <SearchableFilterGroup
            title="Regional Specs"
            options={SPECS_TYPES.map(s => ({ value: s.value, label: s.label }))}
            selected={filters.specs || []}
            onChange={(value) => toggleArrayFilter('specs', value)}
            searchPlaceholder="Search specs..."
          />
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-6 bg-sidebar border-t border-sidebar-border/50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 text-[15px] font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-full border border-sidebar-border/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || isPending}
              className="flex-1 px-4 py-2.5 text-[15px] font-semibold bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Funnel'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// FILTER COMPONENTS
// ============================================================================

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-[15px] hover:bg-sidebar-accent/50 rounded-lg px-2 -mx-2 transition-colors">
        <span className="font-bold tracking-tight">{title}</span>
        <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-3 pb-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface FilterGroupProps {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (value: string) => void;
}

function FilterGroup({ title, options, selected, onChange }: FilterGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = expanded ? options : options.slice(0, 3);
  const hasMore = !expanded && options.length > 3;

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-[15px] hover:bg-sidebar-accent/50 rounded-lg px-2 -mx-2 transition-colors">
        <span className="font-bold tracking-tight">{title}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="w-5 h-5 text-xs font-semibold bg-sidebar-accent text-sidebar-foreground rounded-full flex items-center justify-center">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="pt-3 pb-2 space-y-1">
          {visibleOptions.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => onChange(option.value)}
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
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-sidebar-foreground" />
                )}
              </button>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground font-semibold transition-colors mt-2 px-3"
            >
              Show {options.length - 3} more
            </button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Searchable Filter Group with search input
interface SearchableFilterGroupProps {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (value: string) => void;
  searchPlaceholder?: string;
}

function SearchableFilterGroup({ 
  title, 
  options, 
  selected, 
  onChange,
  searchPlaceholder = 'Search...' 
}: SearchableFilterGroupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query) || 
      opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const visibleOptions = expanded ? filteredOptions : filteredOptions.slice(0, 3);
  const hasMore = !expanded && filteredOptions.length > 3;

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-[15px] hover:bg-sidebar-accent/50 rounded-lg px-2 -mx-2 transition-colors">
        <span className="font-bold tracking-tight">{title}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="w-5 h-5 text-xs font-semibold bg-sidebar-accent text-sidebar-foreground rounded-full flex items-center justify-center">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="pt-3 pb-2 space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground/40" />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!expanded && e.target.value) setExpanded(true);
              }}
              placeholder={searchPlaceholder}
              className="h-10 pl-9 pr-9 bg-sidebar-accent/30 border-sidebar-border/50 text-[15px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-sidebar-accent/50 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-sidebar-foreground/60" />
              </button>
            )}
          </div>

          {/* Filtered Results */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-sidebar-foreground/50">
              No matches found
            </div>
          ) : (
            <div className="space-y-1">
              {visibleOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => onChange(option.value)}
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
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-sidebar-foreground" />
                    )}
                  </button>
                );
              })}

              {hasMore && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground font-semibold transition-colors mt-2 px-3"
                >
                  Show {filteredOptions.length - 3} more
                </button>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function countFilters(filters: FunnelFilters): number {
  let count = 0;
  if (filters.makes?.length) count++;
  if (filters.bodyTypes?.length) count++;
  if (filters.fuelTypes?.length) count++;
  if (filters.minYear || filters.maxYear) count++;
  if (filters.minPrice || filters.maxPrice) count++;
  if (filters.maxMileage) count++;
  if (filters.emirates?.length) count++;
  if (filters.specs?.length) count++;
  return count;
}
