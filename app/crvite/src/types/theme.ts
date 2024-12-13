// types/theme.ts
export type ThemeColors = {
    primary: string;
    primary_light: string;
    secondary: string;
    secondary_light: string;
    background: string;
    text: string;
    text2: string;
    accent: string;
    highlight: string;
    warning: string;
}

export type ThemeName = 'Light' | 'Dark';

export const themes: Record<ThemeName,ThemeColors> = {
    Light: {
        primary: '#1f1f1f',
        primary_light: '#383838',
        secondary: '#1f1f1f',
        secondary_light: '#383838',
        background: '#CCCCCC',
        text: '#CCCCCC',
        text2: '#343434',
        accent: '#181818',
        highlight: '#D5C1F3',
        warning: '#EF4444'
    },
    Dark: {
        primary: '#111111',
        primary_light: '#383838',
        secondary: '#000000',
        secondary_light: '#262626',
        background: '#FFFFFF',
        text: '#FFFFFF',
        text2: '#343434',
        accent: '#343434',
        highlight: '#D5C1F3',
        warning: '#EF4444'
    },
}