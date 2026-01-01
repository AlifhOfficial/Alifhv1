'use client';

/**
 * SearchBar - Basic tier search component
 * 
 * Features:
 * - Auto-suggest as you type
 * - Keyboard navigation
 * - Mobile-friendly
 * - Accessible
 * 
 * @module components/search/search-bar
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuickSearch } from '@/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show on mobile */
  className?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Redirect to listings page on search */
  redirectOnSearch?: boolean;
}

export function SearchBar({
  placeholder = 'Search cars...',
  size = 'md',
  className,
  autoFocus = false,
  onSearch,
  redirectOnSearch = true,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Debounce query for API calls
  const debouncedQuery = useDebounce(query, 200);
  
  // Get suggestions
  const { suggestions, isLoading } = useQuickSearch(debouncedQuery, isFocused);
  
  // Show dropdown when focused and has suggestions
  const showDropdown = isFocused && (suggestions.length > 0 || (isLoading && debouncedQuery.length >= 2));

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string, make?: string, model?: string) => {
    if (onSearch) {
      onSearch(searchQuery);
    }
    
    if (redirectOnSearch) {
      const params = new URLSearchParams();
      if (make && model) {
        params.set('make', make);
        params.set('model', model);
      } else if (make) {
        params.set('make', make);
      } else if (searchQuery) {
        params.set('q', searchQuery);
      }
      
      router.push(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
    }
    
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  }, [onSearch, redirectOnSearch, router]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: typeof suggestions[0]) => {
    if (suggestion.type === 'make_model') {
      handleSearch(suggestion.text, suggestion.make, suggestion.model);
    } else if (suggestion.type === 'make') {
      handleSearch(suggestion.text, suggestion.make);
    } else {
      handleSearch(suggestion.text);
    }
  }, [handleSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'Enter' && query.trim()) {
        handleSearch(query.trim());
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearch(query.trim());
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  }, [showDropdown, suggestions, selectedIndex, query, handleSearch, handleSuggestionClick]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Size classes
  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-11 text-sm',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input */}
      <div className={cn(
        'relative flex items-center',
        'bg-transparent border border-border/40 rounded-lg',
        'transition-colors duration-150',
        isFocused && 'border-foreground/30',
        sizeClasses[size]
      )}>
        <Search className={cn(
          'absolute left-3 text-muted-foreground/60',
          iconSizes[size]
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full h-full bg-transparent pl-10 pr-10',
            'placeholder:text-muted-foreground/50',
            'focus:outline-none'
          )}
          aria-label="Search cars"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Clear / Loading */}
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            {isLoading ? (
              <Loader2 className={cn('animate-spin', iconSizes[size])} />
            ) : (
              <X className={iconSizes[size]} />
            )}
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div 
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-1',
            'bg-popover border border-border/40 rounded-lg shadow-lg',
            'overflow-hidden animate-in fade-in-0 slide-in-from-top-1 duration-100'
          )}
          role="listbox"
        >
          {isLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.type}-${suggestion.text}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 cursor-pointer',
                    'transition-colors duration-75',
                    selectedIndex === index 
                      ? 'bg-muted' 
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <div>
                      <span className="text-sm text-foreground">
                        {suggestion.text}
                      </span>
                      {suggestion.type === 'make' && (
                        <span className="ml-2 text-xs text-muted-foreground/70">
                          Brand
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground/70">
                    {suggestion.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
          
          {/* Search all hint */}
          {query.trim().length >= 2 && suggestions.length > 0 && (
            <button
              onClick={() => handleSearch(query.trim())}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'px-4 py-2.5 border-t border-border/40',
                'text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30',
                'transition-colors'
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Search for "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
