import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, toggleColorMode } = useTheme();
  const nextMode = isDarkMode ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="color-mode-toggle"
      onClick={toggleColorMode}
      aria-label={`Switch to ${nextMode} mode`}
      title={`Switch to ${nextMode} mode`}
      aria-pressed={isDarkMode}
    >
      {isDarkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
