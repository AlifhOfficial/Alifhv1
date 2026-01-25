/**
 * FilterSheet Component - Mobile
 * 
 * Full-screen bottom sheet for filters
 * Matches web's FilterSidebar functionality
 */

import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD, CORNERS } from '@/theme/globals';
import { X, ChevronDown, Check } from 'lucide-react-native';
import { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Modal, 
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchParams, SearchFacets, FacetBucket } from '@/lib/search-utils';

// ============================================================================
// TYPES
// ============================================================================

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  params: SearchParams;
  facets: SearchFacets | null;
  isLoading: boolean;
  onApply: (filters: Partial<SearchParams>) => void;
  onClear: () => void;
  activeFilterCount: number;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const border = useColor('border');

  return (
    <View style={[styles.section, { borderBottomColor: border }]}>
      <Pressable 
        onPress={() => setIsOpen(!isOpen)} 
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, { color: fg, fontFamily: FONT_FAMILY_BOLD }]}>
          {title}
        </Text>
        <ChevronDown 
          size={18} 
          color={mutedFg} 
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
}

interface ChipProps {
  label: string;
  count?: number;
  selected: boolean;
  onPress: () => void;
}

function Chip({ label, count, selected, onPress }: ChipProps) {
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const sidebar = useColor('sidebar');
  const background = useColor('background');

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { 
          backgroundColor: selected ? fg : sidebar,
          borderColor: selected ? fg : mutedFg,
        }
      ]}
    >
      <Text 
        style={[
          styles.chipText, 
          { 
            color: selected ? background : fg,
            fontFamily: FONT_FAMILY_MEDIUM,
          }
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text 
          style={[
            styles.chipCount, 
            { color: selected ? background : mutedFg }
          ]}
        >
          {count}
        </Text>
      )}
    </Pressable>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FilterSheet({ 
  visible, 
  onClose, 
  params, 
  facets, 
  isLoading, 
  onApply, 
  onClear,
  activeFilterCount,
}: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  
  // Local state for draft filters
  const [draft, setDraft] = useState<Partial<SearchParams>>(params);

  // Reset draft when sheet opens
  const handleOpen = () => {
    setDraft(params);
  };

  // Theme colors
  const background = useColor('background');
  const sidebar = useColor('sidebar');
  const border = useColor('border');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const primary = useColor('primary');

  // Handlers
  const toggleArrayValue = (key: keyof SearchParams, value: string) => {
    setDraft(prev => {
      const current = (prev[key] as string[] | undefined) || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists 
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClear = () => {
    setDraft({});
    onClear();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <View style={[styles.container, { backgroundColor: sidebar }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: border, paddingTop: insets.top || 16 }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={22} color={fg} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: fg, fontFamily: FONT_FAMILY_BOLD }]}>
            Filters
          </Text>
          {activeFilterCount > 0 && (
            <Pressable onPress={handleClear}>
              <Text style={[styles.clearText, { color: primary, fontFamily: FONT_FAMILY_SEMIBOLD }]}>
                Clear all
              </Text>
            </Pressable>
          )}
          {activeFilterCount === 0 && <View style={{ width: 60 }} />}
        </View>

        {/* Filters */}
        <ScrollView 
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Condition */}
          <FilterSection title="Condition">
            <View style={styles.chipRow}>
              <Chip
                label="All"
                selected={!draft.condition}
                onPress={() => setDraft(prev => ({ ...prev, condition: undefined }))}
              />
              <Chip
                label="New Cars"
                selected={draft.condition === 'new'}
                onPress={() => setDraft(prev => ({ ...prev, condition: 'new' }))}
              />
              <Chip
                label="Used Cars"
                selected={draft.condition === 'used'}
                onPress={() => setDraft(prev => ({ ...prev, condition: 'used' }))}
              />
            </View>
          </FilterSection>

          {/* Make */}
          <FilterSection title="Make">
            <View style={styles.chipRow}>
              {(facets?.make || []).slice(0, 12).map((make) => (
                <Chip
                  key={make.value}
                  label={make.label}
                  count={make.count}
                  selected={(draft.make || []).includes(make.value)}
                  onPress={() => toggleArrayValue('make', make.value)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Model - only show when make is selected */}
          {draft.make?.length ? (
            <FilterSection title="Model">
              <View style={styles.chipRow}>
                {(facets?.model || []).slice(0, 12).map((model) => (
                  <Chip
                    key={model.value}
                    label={model.label}
                    count={model.count}
                    selected={(draft.model || []).includes(model.value)}
                    onPress={() => toggleArrayValue('model', model.value)}
                  />
                ))}
                {(facets?.model || []).length === 0 && (
                  <Text style={[styles.emptyText, { color: mutedFg }]}>
                    No models available
                  </Text>
                )}
              </View>
            </FilterSection>
          ) : null}

          {/* Body Type */}
          <FilterSection title="Body Type" defaultOpen={false}>
            <View style={styles.chipRow}>
              {(facets?.bodyType || []).map((type) => (
                <Chip
                  key={type.value}
                  label={type.label}
                  count={type.count}
                  selected={(draft.bodyType || []).includes(type.value)}
                  onPress={() => toggleArrayValue('bodyType', type.value)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Emirate */}
          <FilterSection title="Location" defaultOpen={false}>
            <View style={styles.chipRow}>
              {(facets?.emirate || []).map((emirate) => (
                <Chip
                  key={emirate.value}
                  label={emirate.label}
                  count={emirate.count}
                  selected={(draft.emirate || []).includes(emirate.value)}
                  onPress={() => toggleArrayValue('emirate', emirate.value)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Fuel Type */}
          <FilterSection title="Fuel Type" defaultOpen={false}>
            <View style={styles.chipRow}>
              {(facets?.fuelType || []).map((fuel) => (
                <Chip
                  key={fuel.value}
                  label={fuel.label}
                  count={fuel.count}
                  selected={(draft.fuelType || []).includes(fuel.value)}
                  onPress={() => toggleArrayValue('fuelType', fuel.value)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Seller Type */}
          <FilterSection title="Seller Type" defaultOpen={false}>
            <View style={styles.chipRow}>
              <Chip
                label="All"
                selected={!draft.sellerType}
                onPress={() => setDraft(prev => ({ ...prev, sellerType: undefined }))}
              />
              <Chip
                label="Dealers"
                count={facets?.sellerType?.find(s => s.value === 'dealer')?.count}
                selected={draft.sellerType === 'dealer'}
                onPress={() => setDraft(prev => ({ ...prev, sellerType: 'dealer' }))}
              />
              <Chip
                label="Private"
                count={facets?.sellerType?.find(s => s.value === 'private')?.count}
                selected={draft.sellerType === 'private'}
                onPress={() => setDraft(prev => ({ ...prev, sellerType: 'private' }))}
              />
            </View>
          </FilterSection>

          {/* Premium Filters */}
          <FilterSection title="Premium" defaultOpen={false}>
            <View style={styles.chipRow}>
              <Chip
                label="BLK Listings"
                selected={draft.isBlkListing === true}
                onPress={() => setDraft(prev => ({ 
                  ...prev, 
                  isBlkListing: prev.isBlkListing ? undefined : true 
                }))}
              />
              <Chip
                label="Black Members"
                selected={draft.isBlackTierPartner === true}
                onPress={() => setDraft(prev => ({ 
                  ...prev, 
                  isBlackTierPartner: prev.isBlackTierPartner ? undefined : true 
                }))}
              />
            </View>
          </FilterSection>
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom || 16, backgroundColor: sidebar, borderTopColor: border }]}>
          <Pressable 
            onPress={handleApply} 
            style={[styles.applyButton, { backgroundColor: fg }]}
          >
            <Text style={[styles.applyText, { color: background, fontFamily: FONT_FAMILY_BOLD }]}>
              Show Results
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 17,
  },
  clearText: {
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  chipText: {
    fontSize: 13,
  },
  chipCount: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
  },
  applyButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 15,
  },
});
