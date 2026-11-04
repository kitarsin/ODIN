import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  isGameMode: boolean;
  isDarkMode: boolean;
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

const STORAGE_KEY = 'odin-color-mode';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialColorMode(): ColorMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>(getInitialColorMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', colorMode === 'dark');
    root.classList.toggle('light-mode', colorMode === 'light');
    root.dataset.theme = colorMode;
    try {
      window.localStorage.setItem(STORAGE_KEY, colorMode);
    } catch {
      // Keep the selected mode for this session when storage is unavailable.
    }
  }, [colorMode]);

  const toggleColorMode = useCallback(() => {
    setColorMode((current) => current === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ isGameMode: false, isDarkMode: colorMode === 'dark', colorMode, toggleColorMode }}>
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
