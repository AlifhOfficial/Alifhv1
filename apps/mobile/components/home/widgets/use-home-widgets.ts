/**
 * useHomeWidgets — Lazy-loading hook
 *
 * Fetches widget data in batches of 4 as the user scrolls.
 * Static widgets (brandGrid with searchParams: null) are passed through
 * without a fetch. Failed widgets are silently filtered out.
 *
 * brandGrid widgets are enriched with live partner data from the API.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { searchApi } from '@/lib/search-api';
import { getPartnersList } from '@/lib/partner-api';
import { WIDGET_CONFIGS } from './widget-configs';
import type { WidgetConfig, WidgetData, PartnerBrand } from './types';

const BATCH_SIZE = 4;

/** Fetch partners from API and map to PartnerBrand[] */
async function fetchPartnerBrands(): Promise<PartnerBrand[]> {
  try {
    const partners = await getPartnersList();
    return partners.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.brandName,
      logo: p.logoUrl || p.logo || '',
      tier: p.tier,
      isVerified: p.isVerified,
    }));
  } catch (e) {
    console.warn('[Widget] Failed to fetch partner brands', e);
    return [];
  }
}

export function useHomeWidgets() {
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadedCount = useRef(0);
  const isFetching = useRef(false);
  const cachedBrands = useRef<PartnerBrand[] | null>(null);

  /** Get partner brands (cached after first fetch) */
  const getPartnerBrands = useCallback(async (): Promise<PartnerBrand[]> => {
    if (cachedBrands.current) return cachedBrands.current;
    const brands = await fetchPartnerBrands();
    if (brands.length > 0) cachedBrands.current = brands;
    return brands;
  }, []);

  /** Enrich brandGrid configs with live partner data */
  const enrichConfig = useCallback(async (config: WidgetConfig): Promise<WidgetConfig> => {
    if (config.layout !== 'brandGrid') return config;
    const brands = await getPartnerBrands();
    if (brands.length === 0) return config; // fallback to hardcoded
    return { ...config, brands };
  }, [getPartnerBrands]);

  /** Fetch a single widget's listings (or pass through static ones) */
  const fetchWidget = useCallback(async (config: WidgetConfig): Promise<WidgetData> => {
    // Enrich brandGrid with live data
    const enriched = await enrichConfig(config);

    // Static widgets (no search) — pass through immediately
    if (!enriched.searchParams) {
      return {
        config: enriched,
        listings: [],
        isLoading: false,
        error: null,
        hasMore: false,
      };
    }

    try {
      const res = await searchApi.search(enriched.searchParams);
      if (res.listings.length === 0) {
        return { config: enriched, listings: [], isLoading: false, error: 'empty', hasMore: false };
      }
      return {
        config: enriched,
        listings: res.listings,
        isLoading: false,
        error: null,
        hasMore: res.meta.hasMore,
      };
    } catch (e) {
      console.warn(`[Widget] Failed: ${enriched.id}`, e);
      return { config: enriched, listings: [], isLoading: false, error: 'fetch-failed', hasMore: false };
    }
  }, [enrichConfig]);

  /** Load next batch */
  const loadMore = useCallback(async () => {
    if (isFetching.current) return;
    if (loadedCount.current >= WIDGET_CONFIGS.length) return;

    isFetching.current = true;
    setIsLoadingMore(true);

    const start = loadedCount.current;
    const end = Math.min(start + BATCH_SIZE, WIDGET_CONFIGS.length);
    const batch = WIDGET_CONFIGS.slice(start, end);

    // Placeholders
    const placeholders: WidgetData[] = batch.map((c) => ({
      config: c,
      listings: [],
      isLoading: !!c.searchParams, // static widgets don't load
      error: null,
      hasMore: false,
    }));
    setWidgets((prev) => [...prev, ...placeholders]);

    // Fetch
    const results = await Promise.all(batch.map(fetchWidget));

    // Replace placeholders — keep static widgets, filter out failed ones with searchParams
    setWidgets((prev) => {
      const existing = prev.filter((w) => !batch.some((b) => b.id === w.config.id));
      const successful = results.filter((r) => {
        // Static widgets (brandGrid) always pass
        if (!r.config.searchParams) return true;
        // Data widgets need listings
        return !r.error && r.listings.length > 0;
      });
      return [...existing, ...successful];
    });

    loadedCount.current = end;
    isFetching.current = false;
    setIsLoadingMore(false);
  }, [fetchWidget]);

  /** Pull-to-refresh */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    loadedCount.current = 0;
    isFetching.current = false;
    cachedBrands.current = null; // Clear partner cache on refresh
    setWidgets([]);

    const end = Math.min(BATCH_SIZE, WIDGET_CONFIGS.length);
    const batch = WIDGET_CONFIGS.slice(0, end);
    const results = await Promise.all(batch.map(fetchWidget));
    const successful = results.filter((r) => {
      if (!r.config.searchParams) return true;
      return !r.error && r.listings.length > 0;
    });

    setWidgets(successful);
    loadedCount.current = end;
    setIsRefreshing(false);
  }, [fetchWidget]);

  /** Initial load */
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = loadedCount.current < WIDGET_CONFIGS.length;

  return { widgets, isLoadingMore, isRefreshing, hasMore, loadMore, refresh };
}
