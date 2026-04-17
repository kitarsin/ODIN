import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { toggleColorMode, isDarkMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleColorMode}
        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#1E293B] border-[#10B981] text-[#10B981]'
            : 'bg-[#F5F7FA] border-[#059669] text-[#059669]'
        }`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <>
            <Moon className="w-4 h-4" />
            <span className="text-sm">Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4" />
            <span className="text-sm">Light</span>
          </>
        )}
      </button>
    </div>
  );
}
