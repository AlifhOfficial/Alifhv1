/**
 * ChevronLeft Icon - Ionicons
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface ChevronLeftIconProps {
  size?: number;
  color?: string;
}

export function ChevronLeftIcon({ size = 24, color }: ChevronLeftIconProps) {
  return <Ionicons name="chevron-back" size={size} color={color} />;
}
