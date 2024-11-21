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
        primary: '#111111',
        secondary: '#000000',
        background: '#FFFFFF',
        text: '#FFFFFF',
        accent: '#585858',
    },
    DEHR: {
        primary: '#111111',
        secondary: '#000000',
        background: '#000000',
        text: '#6A4C02',
        accent: '#000000',
    }
}