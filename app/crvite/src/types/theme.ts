// types/theme.ts
export type ThemeColors = {
    primary: string;
    primary_light: string;
    secondary: string;
    secondary_light: string;
    background: string;
    text: string;
    accent: string;
}

export type ThemeName = 'Light' | 'Dark' | 'DEHR';

export const themes: Record<ThemeName,ThemeColors> = {
    Light: {
        primary: '#C7A3FA',
        primary_light: '#DDCCFF',
        secondary: '#4DC3FF',
        secondary_light: '#99DDFF',
        background: '#000000',
        text: '#000000',
        accent: '#9AD1FF',
    },
    Dark: {
        primary: '#111111',
        primary_light: '#383838',
        secondary: '#000000',
        secondary_light: '#262626',
        background: '#FFFFFF',
        text: '#FFFFFF',
        accent: '#343434',
    },
    DEHR: {
        primary: '#111111',
        primary_light: '#383838',
        secondary: '#000000',
        secondary_light: '#262626',
        background: '#000000',
        text: '#6A4C02',
        accent: '#1E1D1D',
    }
}