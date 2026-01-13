/**
 * INTER FONT & LUCIDE ICONS - Usage Examples
 * 
 * This file demonstrates how to use Inter font and Lucide icons in your app.
 * Delete this file once you're familiar with the patterns.
 */

import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart,
  Star,
  User,
  ShoppingCart,
  Search,
  Settings,
  Camera,
  Send,
  Bell,
  MessageCircle,
} from '@/components/ui/icons';

export default function ExampleScreen() {
  return (
    <View style={{ flex: 1, padding: 20, gap: 20 }}>
      {/* Text with Inter font - automatically applied */}
      <Text variant="heading">Inter Font Examples</Text>
      <Text variant="title">Title with Inter</Text>
      <Text variant="subtitle">Subtitle with Inter</Text>
      <Text variant="body">Body text with Inter font looks beautiful!</Text>
      <Text variant="caption">Caption text with Inter</Text>

      {/* Icons - Simple usage */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Icon name={Heart} size={24} />
        <Icon name={Star} size={24} />
        <Icon name={User} size={24} />
        <Icon name={ShoppingCart} size={24} />
      </View>

      {/* Icons with custom colors */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Icon name={Heart} size={24} color="#FF0000" />
        <Icon name={Star} size={24} color="#FFD700" />
        <Icon name={User} size={24} color="#00FF00" />
        <Icon name={ShoppingCart} size={24} color="#0000FF" />
      </View>

      {/* Icons with custom sizes and stroke width */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Icon name={Camera} size={32} strokeWidth={2} />
        <Icon name={Send} size={28} strokeWidth={2.5} />
        <Icon name={Bell} size={24} strokeWidth={1.5} />
        <Icon name={MessageCircle} size={20} strokeWidth={1} />
      </View>

      {/* Input with icon */}
      <Input 
        placeholder="Search with icon..." 
        icon={Search}
      />

      {/* Button with icon */}
      <Button 
        variant="default"
        iconLeft={Settings}
        onPress={() => console.log('Settings pressed')}
      >
        Settings
      </Button>

      {/* Theme-aware icons (will change color with dark/light mode) */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Icon name={Heart} />
        <Icon name={Star} />
        <Icon name={User} />
      </View>

      {/* Icons with theme color overrides */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Icon name={Heart} lightColor="#FF0000" darkColor="#FF6B6B" />
        <Icon name={Star} lightColor="#FFD700" darkColor="#FFA500" />
        <Icon name={User} lightColor="#0000FF" darkColor="#6B8CFF" />
      </View>
    </View>
  );
}

/**
 * QUICK REFERENCE:
 * 
 * 1. INTER FONT:
 *    - Automatically applied to all <Text> components
 *    - Uses Inter variable font with full weight support
 *    - Supports italic variant
 * 
 * 2. LUCIDE ICONS:
 *    Import from: @/components/ui/icons
 *    Usage: <Icon name={IconName} size={24} color="#000" strokeWidth={2} />
 * 
 *    Available props:
 *    - name: Icon component (required)
 *    - size: number (default: 24)
 *    - color: string (optional, uses theme color if not provided)
 *    - strokeWidth: number (default: 1.8)
 *    - lightColor: string (theme-aware color for light mode)
 *    - darkColor: string (theme-aware color for dark mode)
 * 
 * 3. WHERE TO FIND MORE ICONS:
 *    Visit: https://lucide.dev/icons/
 *    Import any icon from 'lucide-react-native'
 */
