/**
 * Google Icon - Ionicons
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface GoogleIconProps {
  size?: number;
  color?: string;
}

export function GoogleIcon({ size = 20, color }: GoogleIconProps) {
  return <Ionicons name="logo-google" size={size} color={color} />;
}
