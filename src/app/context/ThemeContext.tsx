import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  isGameMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always use light mode - apply it on mount
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add('light-mode');
    root.classList.remove('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      isGameMode: false
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
