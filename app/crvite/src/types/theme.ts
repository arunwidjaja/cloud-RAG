// types/theme.ts
export type ThemeColors = {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
}

export type ThemeName = 'Light' | 'Dark' | 'DEHR';

export const themes: Record<ThemeName,ThemeColors> = {
    Light: {
        primary: '#C7A3FA',
        secondary: '#57B6FF',
        background: '#000000',
        text: '#000000',
        accent: '#9AD1FF',
    },
    Dark: {
        primary: '#60a5fa',
        secondary: '#9ca3af',
        background: '#1f2937',
        text: '#f9fafb',
        accent: '#a78bfa',
    },
    DEHR: {
        primary: '#60a5fa',
        secondary: '#9ca3af',
        background: '#1f2937',
        text: '#f9fafb',
        accent: '#a78bfa',
    }
}