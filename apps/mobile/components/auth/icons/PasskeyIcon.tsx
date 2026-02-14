/**
 * Passkey Icon - Ionicons
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface PasskeyIconProps {
  size?: number;
  color?: string;
}

export function PasskeyIcon({ size = 20, color }: PasskeyIconProps) {
  return <Ionicons name="finger-print-outline" size={size} color={color} />;
}
