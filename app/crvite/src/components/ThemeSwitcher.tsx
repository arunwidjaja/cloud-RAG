import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeName } from '../types/theme';

export const ThemeSwitcher = () => {
  const { currentTheme, setTheme } = useTheme();
  const [position, setPosition] = useState(0);

  const themes: ThemeName[] = ['Light', 'Dark', 'DEHR'];

  useEffect(() => {
    const index = themes.indexOf(currentTheme);
    setPosition(index);
  }, [currentTheme]);

  const handleClick = (theme: ThemeName, index: number) => {
    setTheme(theme);
    setPosition(index);
  };

  return (
    <div className="relative inline-flex items-center bg-primary rounded-full p-1 h-10 w-32 m-2">
      {/* Background slider */}
      <div
        className="absolute h-8 w-10 bg-secondary rounded-full transition-all duration-200 ease-in-out"
        style={{
          left: `${position * 40 + 2}px`,
        }}
      />

      {/* Theme buttons */}
      {themes.map((theme, index) => {
        return (
          <button
            key={theme}
            onClick={() => handleClick(theme, index)}
            className={`text-text relative z-10 flex items-center justify-center w-14 h-8 rounded-full transition-colors text-xs font-light
            ${position === index ? 'text-background' : 'text-text hover:bg-secondary_light'}`}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </button>
        );
      })}
    </div>
  );
};