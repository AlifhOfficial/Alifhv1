/**
 * Search Utilities - Web Client
 *
 * This file intentionally re-exports the shared client-safe search contract so
 * the web app, mobile app, API route, and DB query layer speak the same search
 * dialect.
 */

export {
  SORT_OPTIONS,
  countActiveFilters,
  searchParamsToUrl,
  urlToSearchParams,
  type FacetBucket,
  type SearchFacets,
  type SearchParams,
  type SearchResponse,
  type SearchResultItem,
  type SearchSortOption,
} from '../../../../packages/database/src/schema/search-types';
