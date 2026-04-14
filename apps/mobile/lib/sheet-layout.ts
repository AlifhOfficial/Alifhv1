import { SheetChrome, Spacing } from '@/constants/theme';

const SHEET_BOTTOM_BREATHING_ROOM = Spacing.sm;

export function getSheetBottomPadding(bottomInset: number, extraPadding = 0): number {
  return bottomInset + SheetChrome.bottomSafeAreaSpacing + SHEET_BOTTOM_BREATHING_ROOM + extraPadding;
}
