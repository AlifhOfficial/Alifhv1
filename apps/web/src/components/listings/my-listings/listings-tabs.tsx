/**
 * Listings Tabs Component
 * Clean minimal tabs with Deep Inventory dropdown
 */

'use client';

import { useState } from 'react';
import { ChevronDown, Archive, CheckCircle, Clock, Trash2, Ban } from 'lucide-react';
import { cn } from '@/utils';
import type { ListingStats, ListingsTab, DeepInventoryFilter } from './types';

interface ListingsTabsProps {
  stats: ListingStats;
  activeTab: ListingsTab;
  deepInventoryFilter: DeepInventoryFilter;
  onTabChange: (tab: ListingsTab) => void;
  onDeepInventoryFilterChange: (filter: DeepInventoryFilter) => void;
}

export function ListingsTabs({ 
  stats, 
  activeTab, 
  deepInventoryFilter,
  onTabChange,
  onDeepInventoryFilterChange,
}: ListingsTabsProps) {
  const [isDeepOpen, setIsDeepOpen] = useState(false);

  // Calculate deep inventory total
  const deepInventoryTotal = 
    Number(stats.archived || 0) + 
    Number(stats.suspended || 0) + 
    Number(stats.sold || 0) + 
    Number(stats.expired || 0) + 
    Number(stats.deleted || 0);

  // Main tabs
  const mainTabs: Array<{
    key: ListingsTab;
    label: string;
    count: number;
    hideWhenZero?: boolean;
  }> = [
    { key: 'active', label: 'Active', count: stats.active },
    { key: 'public', label: 'Public', count: stats.public },
    { key: 'in_review', label: 'In Review', count: stats.inReview, hideWhenZero: true },
    { key: 'draft', label: 'Drafts', count: stats.draft },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, hideWhenZero: true },
  ];

  // Deep inventory filters with icons
  const deepFilters: Array<{
    key: DeepInventoryFilter;
    label: string;
    count: number;
    icon: React.ElementType;
  }> = [
    { key: 'archived', label: 'Archived', count: stats.archived, icon: Archive },
    { key: 'sold', label: 'Sold', count: stats.sold, icon: CheckCircle },
    { key: 'expired', label: 'Expired', count: stats.expired, icon: Clock },
    { key: 'suspended', label: 'Suspended', count: stats.suspended, icon: Ban },
    { key: 'deleted', label: 'Deleted', count: stats.deleted, icon: Trash2 },
  ];

  const isDeepInventoryActive = activeTab === 'deep_inventory';
  const activeDeepFilter = deepFilters.find(f => f.key === deepInventoryFilter);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      {/* Main Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide w-full sm:w-auto pb-1 sm:pb-0">
        {mainTabs
          .filter((t) => !(t.hideWhenZero && t.count === 0))
          .map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "text-subhead font-semibold tracking-tight transition-colors whitespace-nowrap",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn(
                    "ml-1.5 text-caption1 font-bold tabular-nums",
                    isActive ? "text-foreground" : "text-muted-foreground/50"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Deep Inventory Dropdown */}
      {deepInventoryTotal > 0 && (
        <div className="relative shrink-0">
          <button
            onClick={() => setIsDeepOpen(!isDeepOpen)}
            onBlur={() => setTimeout(() => setIsDeepOpen(false), 150)}
            className={cn(
              "flex items-center gap-2 text-subhead font-semibold transition-colors",
              isDeepInventoryActive
                ? "text-foreground"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            {isDeepInventoryActive && activeDeepFilter ? (
              <>
                <activeDeepFilter.icon className="w-4 h-4" />
                {activeDeepFilter.label}
              </>
            ) : (
              'Deep Inventory'
            )}
            <span className="text-caption1 font-bold tabular-nums text-muted-foreground/50">
              {deepInventoryTotal}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground/40 transition-transform",
              isDeepOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {isDeepOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-48 py-2 rounded-xl bg-sidebar border border-sidebar-border shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* All option */}
              <button
                onClick={() => {
                  onTabChange('deep_inventory');
                  onDeepInventoryFilterChange('all');
                  setIsDeepOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-subhead transition-colors",
                  isDeepInventoryActive && deepInventoryFilter === 'all'
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>All</span>
                <span className="text-caption1 font-bold tabular-nums text-muted-foreground/50">
                  {deepInventoryTotal}
                </span>
              </button>

              <div className="my-1.5 mx-3 border-t border-sidebar-border/60" />

              {/* Filter options */}
              {deepFilters
                .filter((f) => f.count > 0)
                .map((filter) => {
                  const Icon = filter.icon;
                  const isSelected = isDeepInventoryActive && deepInventoryFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      onClick={() => {
                        onTabChange('deep_inventory');
                        onDeepInventoryFilterChange(filter.key);
                        setIsDeepOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-subhead transition-colors",
                        isSelected
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        {filter.label}
                      </span>
                      <span className="text-caption1 font-bold tabular-nums text-muted-foreground/50">
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
