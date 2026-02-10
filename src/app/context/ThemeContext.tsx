import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'academic' | 'game';
type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colorMode: ColorMode;
  toggleMode: () => void;
  toggleColorMode: () => void;
  isGameMode: boolean;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('academic');
  const [colorMode, setColorMode] = useState<ColorMode>('dark');

  useEffect(() => {
    // Load saved modes from localStorage
    const savedMode = localStorage.getItem('odin-theme-mode') as ThemeMode;
    const savedColorMode = localStorage.getItem('odin-color-mode') as ColorMode;
    if (savedMode) {
      setMode(savedMode);
    }
    if (savedColorMode) {
      setColorMode(savedColorMode);
    }
  }, []);

  useEffect(() => {
    // Apply theme classes to root
    const root = document.documentElement;
    
    // Apply mode class (academic or game)
    if (mode === 'game') {
      root.classList.add('game-mode');
    } else {
      root.classList.remove('game-mode');
    }
    
    // Apply color mode class (light or dark)
    if (colorMode === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('odin-theme-mode', mode);
    localStorage.setItem('odin-color-mode', colorMode);
  }, [mode, colorMode]);

  const toggleMode = () => {
    setMode(prev => prev === 'academic' ? 'game' : 'academic');
  };

  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      colorMode, 
      toggleMode, 
      toggleColorMode,
      isGameMode: mode === 'game',
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
