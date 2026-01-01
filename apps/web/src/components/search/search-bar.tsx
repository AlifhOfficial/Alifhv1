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
import { Search, X, Loader2, CircleDot, Factory } from 'lucide-react';
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
  placeholder = 'Search by make, model or dealer...',
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
  const handleSearch = useCallback((searchQuery: string, make?: string, model?: string, partnerId?: string) => {
    if (onSearch) {
      onSearch(searchQuery);
    }
    
    if (redirectOnSearch) {
      const params = new URLSearchParams();
      if (partnerId) params.set('partnerId', partnerId);
      if (make) params.set('make', make);
      if (model) params.set('model', model);
      if (!make && !model && !partnerId && searchQuery) {
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
    if (suggestion.type === 'partner') {
      handleSearch(suggestion.text, undefined, undefined, suggestion.partnerId);
    } else if (suggestion.type === 'make_model') {
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
    lg: 'h-12 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'partner':
        return <Factory className="h-4 w-4 text-muted-foreground/70" />;
      case 'make':
      case 'make_model':
      default:
        return <CircleDot className="h-4 w-4 text-muted-foreground/50" />;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input */}
      <div className={cn(
        'relative flex items-center',
        'bg-muted/30 border border-border/50 rounded-xl',
        'transition-all duration-200',
        isFocused && 'bg-background border-primary/40 shadow-sm ring-2 ring-primary/10',
        sizeClasses[size]
      )}>
        <Search className={cn(
          'absolute left-3.5 transition-colors',
          isFocused ? 'text-primary' : 'text-muted-foreground/50',
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
            'w-full h-full bg-transparent pl-11 pr-10',
            'placeholder:text-muted-foreground/40',
            'focus:outline-none',
            'font-medium tracking-tight'
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
            className={cn(
              "absolute right-3 p-1 rounded-full transition-all",
              "text-muted-foreground/50 hover:text-foreground hover:bg-muted"
            )}
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
            'absolute top-full left-0 right-0 z-50 mt-2',
            'bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl',
            'overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150'
          )}
          role="listbox"
        >
          {isLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
              <span className="text-sm font-medium">Searching...</span>
            </div>
          ) : (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.type}-${suggestion.text}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 cursor-pointer',
                    'transition-colors duration-100',
                    selectedIndex === index 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {suggestion.text}
                      </span>
                      {suggestion.type === 'partner' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted rounded">
                          Dealer
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground/60 tabular-nums">
                    {suggestion.count} {suggestion.count === 1 ? 'car' : 'cars'}
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
                'px-4 py-3 border-t border-border/30',
                'text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5',
                'transition-colors'
              )}
            >
              <Search className="h-4 w-4" />
              Search all for "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
