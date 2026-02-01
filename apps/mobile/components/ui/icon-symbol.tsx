/**
 * IconSymbol - Cross-platform icon component
 * 
 * Uses SF Symbols on iOS, Material Icons on Android/Web
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * SF Symbol to Material Icon mapping
 */
const MAPPING: IconMapping = {
  // Tab icons
  'house.fill': 'home',
  'message.fill': 'chat-bubble',
  'heart.fill': 'favorite',
  'magnifyingglass': 'search',
  // Grid icons
  'square.grid.2x2': 'grid-view',
  'square.grid.2x2.fill': 'grid-view',
  // Briefcase icons
  'briefcase': 'work-outline',
  'briefcase.fill': 'work',
  // Navigation
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'xmark': 'close',
  // Actions
  'bell.fill': 'notifications',
  'person.fill': 'person',
  'gear': 'settings',
  'arrow.right.square': 'logout',
  // Theme icons
  'sun.max.fill': 'wb-sunny',
  'moon.fill': 'dark-mode',
  'circle.lefthalf.filled': 'contrast',
};

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || 'help';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
