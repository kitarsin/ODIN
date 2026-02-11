import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  isGameMode: boolean;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>('dark');

  useEffect(() => {
    const savedColorMode = localStorage.getItem('odin-color-mode') as ColorMode;
    if (savedColorMode) {
      setColorMode(savedColorMode);
    }
  }, []);

  useEffect(() => {
    // Apply theme classes to root
    const root = document.documentElement;
    
    // Apply color mode class (light or dark)
    if (colorMode === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('odin-color-mode', colorMode);
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      colorMode, 
      toggleColorMode,
      isGameMode: false,
      isDarkMode: colorMode === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
