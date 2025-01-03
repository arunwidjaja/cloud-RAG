// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeName, ThemeColors, themes } from '../types/theme';

type ThemeContextType = {
    currentTheme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    themeColors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeName>('Light');

    const applyTheme = (theme: ThemeColors) => {
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
    };

    const setTheme = (theme: ThemeName) => {
        setCurrentTheme(theme);
        applyTheme(themes[theme]);
        localStorage.setItem('theme', theme);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeName | null;
        if (savedTheme && themes[savedTheme]) {
            setTheme(savedTheme);
        }
    }, []);

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme,
                themeColors: themes[currentTheme]
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};