/**
 * Seller Contact Utilities
 */

import { Linking, Alert } from 'react-native';

/**
 * Format price with AED currency
 */
export function formatPrice(price: number): string {
  return `AED ${price.toLocaleString('en-AE')}`;
}

/**
 * Format mileage with km suffix
 */
export function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString('en-AE')} km`;
}

/**
 * Format member since date
 */
export function formatMemberSince(date: string): string {
  try {
    return new Date(date).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' });
  } catch {
    return date;
  }
}

/**
 * Calculate EMI (Equated Monthly Installment)
 */
export function calculateEMI(principal: number, rate: number, months: number): number {
  const r = rate / 100 / 12;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

/**
 * Safe URL opener with error handling
 */
export async function safeOpenURL(url: string, fallbackMessage?: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      if (fallbackMessage) {
        Alert.alert('Unable to Open', fallbackMessage);
      }
      return false;
    }
  } catch (error) {
    console.log('[SellerContact] Failed to open URL:', url, error);
    if (fallbackMessage) {
      Alert.alert('Unable to Open', fallbackMessage);
    }
    return false;
  }
}
