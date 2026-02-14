/**
 * ArrowRight Icon - Ionicons
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface ArrowRightIconProps {
  size?: number;
  color?: string;
}

export function ArrowRightIcon({ size = 20, color = '#FFFFFF' }: ArrowRightIconProps) {
  return <Ionicons name="arrow-forward" size={size} color={color} />;
}
