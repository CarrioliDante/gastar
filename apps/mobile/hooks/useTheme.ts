import { THEMES, FONTS } from '../lib/theme';
import { useAppStore, CURRENCY_SYMBOLS } from '../store/app';

export function useTheme() {
  const { theme, font, currency } = useAppStore();
  const C = THEMES[theme];
  const fonts = FONTS[font];
  return {
    theme,
    font,
    currency,
    currencyCode: CURRENCY_SYMBOLS[currency],
    isDark: theme === 'dark',
    C,
    fontBody: fonts.body,
    fontDisplay: fonts.display,
    fontMono: fonts.mono,
  };
}
