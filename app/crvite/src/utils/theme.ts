import type { ThemeColors } from '../types/theme';

// utils/theme.ts
export const applyTheme = (theme: ThemeColors) => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };