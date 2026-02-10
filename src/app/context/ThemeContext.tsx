import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'academic' | 'game';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  isGameMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('academic');

  useEffect(() => {
    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('odin-theme-mode') as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    // Apply theme class to body
    const root = document.documentElement;
    if (mode === 'game') {
      root.classList.add('game-mode');
    } else {
      root.classList.remove('game-mode');
    }
    // Save to localStorage
    localStorage.setItem('odin-theme-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'academic' ? 'game' : 'academic');
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, isGameMode: mode === 'game' }}>
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
