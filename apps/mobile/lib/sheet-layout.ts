import { SheetChrome } from '@/constants/theme';

export function getSheetBottomPadding(bottomInset: number, extraPadding = 0): number {
  return bottomInset + SheetChrome.bottomSafeAreaSpacing + extraPadding;
}
