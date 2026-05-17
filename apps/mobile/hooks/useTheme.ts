import { THEMES, FONTS } from '../lib/theme';
import { useAppStore } from '../store/app';

export function useTheme() {
  const { theme, font } = useAppStore();
  const C = THEMES[theme];
  const fonts = FONTS[font];
  return {
    theme,
    font,
    isDark: theme === 'dark',
    C,
    fontBody: fonts.body,
    fontDisplay: fonts.display,
    fontMono: fonts.mono,
  };
}
