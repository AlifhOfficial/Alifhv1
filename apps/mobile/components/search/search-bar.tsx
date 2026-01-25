/**
 * SearchBar Component - Mobile
 * 
 * Matches web design with rounded pill input
 * Uses Alifh typography system
 */

import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, CORNERS } from '@/theme/globals';
import { Search, X } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform } from 'react-native';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  onFocus?: () => void;
}

export function SearchBar({ 
  value = '', 
  placeholder = 'Search make, model, dealer...', 
  onSearch,
  onFocus,
}: SearchBarProps) {
  const [query, setQuery] = useState(value);
  
  // Theme colors
  const sidebar = useColor('sidebar');
  const border = useColor('border');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const primary = useColor('primary');

  const handleSubmit = useCallback(() => {
    onSearch(query.trim());
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const hasQuery = query.length > 0;

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: sidebar, 
          borderColor: border,
        }
      ]}
    >
      {/* Search Icon */}
      <Search size={16} color={mutedFg} style={styles.icon} />
      
      {/* Input */}
      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={mutedFg}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { 
            color: fg,
            fontFamily: FONT_FAMILY,
          }
        ]}
      />

      {/* Clear Button */}
      {hasQuery && (
        <Pressable 
          onPress={handleClear} 
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={14} color={mutedFg} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: CORNERS,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    gap: 8,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    ...Platform.select({
      android: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },
  clearButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
