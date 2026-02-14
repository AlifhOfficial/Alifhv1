/**
 * Apple Icon - Ionicons
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface AppleIconProps {
  size?: number;
  color?: string;
}

export function AppleIcon({ size = 18, color }: AppleIconProps) {
  return <Ionicons name="logo-apple" size={size} color={color} />;
}
