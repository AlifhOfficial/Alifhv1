'use client';

/**
 * useDebounce Hook
 * 
 * Debounces a value by the specified delay.
 * Useful for search inputs and other rapid-fire value changes.
 * 
 * @module hooks/use-debounce
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value by the specified delay
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns The debounced value
 * 
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 300);
 * 
 * useEffect(() => {
 *   // This runs 300ms after the user stops typing
 *   fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns A debounced version of the callback
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query);
 * }, 300);
 * 
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
