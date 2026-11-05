import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  isGameMode: boolean;
  isDarkMode: boolean;
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

// Light is the default. The key changed from 'odin-color-mode' because the old
// provider saved 'dark' for every visitor, so an old value isn't a real choice.
const STORAGE_KEY = 'odin-color-mode-v2';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialColorMode(): ColorMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>(getInitialColorMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', colorMode === 'dark');
    root.classList.toggle('light-mode', colorMode === 'light');
    root.dataset.theme = colorMode;
  }, [colorMode]);

  // Only an explicit toggle is saved, so the default can change later.
  const toggleColorMode = useCallback(() => {
    setColorMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Keep the selected mode for this session when storage is unavailable.
      }
      return next;
    });
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
