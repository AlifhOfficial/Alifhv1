/**
 * SortSheet Component - Mobile
 * 
 * Bottom sheet for sort options
 * Matches web dropdown but in sheet format
 */

import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD, CORNERS } from '@/theme/globals';
import { CheckCircle2, X } from 'lucide-react-native';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SORT_OPTIONS, SearchSortOption } from '@/lib/search-utils';

interface SortSheetProps {
  visible: boolean;
  onClose: () => void;
  currentSort: SearchSortOption;
  onSelect: (sort: SearchSortOption) => void;
}

export function SortSheet({ visible, onClose, currentSort, onSelect }: SortSheetProps) {
  const insets = useSafeAreaInsets();
  
  // Theme colors
  const background = useColor('background');
  const sidebar = useColor('sidebar');
  const border = useColor('border');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');

  const handleSelect = (sort: SearchSortOption) => {
    onSelect(sort);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View 
          style={[
            styles.sheet, 
            { 
              backgroundColor: sidebar,
              paddingBottom: insets.bottom + 16,
            }
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: border }]} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: fg, fontFamily: FONT_FAMILY_BOLD }]}>
              Sort By
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={20} color={mutedFg} />
            </Pressable>
          </View>

          {/* Options */}
          <View style={styles.options}>
            {SORT_OPTIONS.map((option) => {
              const isActive = currentSort === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={[
                    styles.option,
                    isActive && { backgroundColor: background }
                  ]}
                >
                  <Text 
                    style={[
                      styles.optionText, 
                      { 
                        color: isActive ? fg : mutedFg,
                        fontFamily: FONT_FAMILY_SEMIBOLD,
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isActive && (
                    <CheckCircle2 size={18} color={fg} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
  },
  options: {
    paddingHorizontal: 12,
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  optionText: {
    fontSize: 15,
  },
});
