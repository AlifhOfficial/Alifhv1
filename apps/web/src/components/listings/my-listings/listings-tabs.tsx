/**
 * Listings Tabs Component
 * Clean UI with main tabs + Deep Inventory on the right
 */

'use client';

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
  // Calculate deep inventory total (ensure numbers in case of string values)
  const deepInventoryTotal = 
    Number(stats.archived || 0) + 
    Number(stats.suspended || 0) + 
    Number(stats.sold || 0) + 
    Number(stats.expired || 0) + 
    Number(stats.deleted || 0);

  // Main tabs (active inventory)
  const mainTabs: Array<{
    key: ListingsTab;
    label: string;
    count: number;
    badgeClassName?: string;
    hideWhenZero?: boolean;
  }> = [
    {
      key: 'active',
      label: 'Active',
      count: stats.active,
      badgeClassName: 'bg-blue-500/10 text-blue-500',
    },
    {
      key: 'public',
      label: 'Public',
      count: stats.public,
      badgeClassName: 'bg-green-500/10 text-green-500',
    },
    {
      key: 'in_review',
      label: 'In Review',
      count: stats.inReview,
      badgeClassName: 'bg-blue-500/10 text-blue-500',
      hideWhenZero: true,
    },
    {
      key: 'draft',
      label: 'Drafts',
      count: stats.draft,
      badgeClassName: 'bg-yellow-500/10 text-yellow-500',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      count: stats.rejected,
      badgeClassName: 'bg-red-500/10 text-red-500',
      hideWhenZero: true,
    },
  ];

  // Deep inventory sub-filters
  const deepFilters: Array<{
    key: DeepInventoryFilter;
    label: string;
    count: number;
  }> = [
    { key: 'all', label: 'All', count: deepInventoryTotal },
    { key: 'archived', label: 'Archived', count: stats.archived },
    { key: 'sold', label: 'Sold', count: stats.sold },
    { key: 'expired', label: 'Expired', count: stats.expired },
    { key: 'suspended', label: 'Suspended', count: stats.suspended },
    { key: 'deleted', label: 'Deleted', count: stats.deleted },
  ];

  const isDeepInventoryActive = activeTab === 'deep_inventory';

  return (
    <div className="border-b border-border/40">
      <div className="flex items-center justify-between">
        {/* Main Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {mainTabs
            .filter((t) => !(t.hideWhenZero && t.count === 0))
            .map((t) => (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={`px-5 py-4 border-b-2 transition-colors whitespace-nowrap text-[15px] font-semibold tracking-tight ${
                  activeTab === t.key
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground/70 hover:text-foreground'
                }`}
              >
                {t.label}
                <span
                  className={`ml-2 px-2.5 py-1 text-sm font-semibold tracking-tight rounded-md ${
                    t.badgeClassName ?? 'bg-muted text-muted-foreground'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
        </div>

        {/* Deep Inventory Tab - Pushed to right */}
        {deepInventoryTotal > 0 && (
          <button
            onClick={() => onTabChange('deep_inventory')}
            className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-colors whitespace-nowrap text-[15px] font-semibold tracking-tight ${
              isDeepInventoryActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground/70 hover:text-foreground'
            }`}
          >
            Deep Inventory
            <span className="px-2.5 py-1 text-sm font-semibold tracking-tight rounded-md bg-muted/40 text-foreground/70">
              {deepInventoryTotal}
            </span>
          </button>
        )}
      </div>

      {/* Deep Inventory Filters - Show when deep inventory tab is active */}
      {isDeepInventoryActive && (
        <div className="flex gap-2 px-4 py-4 bg-muted/20 border-t border-border/40">
          <span className="text-sm font-semibold tracking-tight text-muted-foreground/70 mr-2 self-center">Filter:</span>
          {deepFilters
            .filter((f) => f.count > 0 || f.key === 'all')
            .map((f) => (
              <button
                key={f.key}
                onClick={() => onDeepInventoryFilterChange(f.key)}
                className={`px-5 py-2.5 text-sm font-semibold tracking-tight rounded-full transition-colors ${
                  deepInventoryFilter === f.key
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'border border-border/40 hover:bg-muted/40'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
