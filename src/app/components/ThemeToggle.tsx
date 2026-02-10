import { useTheme } from '../context/ThemeContext';
import { Briefcase, Gamepad2, Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { mode, colorMode, toggleMode, toggleColorMode, isGameMode, isDarkMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Academic / Game Mode Toggle */}
      <button
        onClick={toggleMode}
        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
          isGameMode
            ? 'bg-[#00ff41] border-[#00ff41] text-[#1a1a2e]'
            : 'bg-[#1E293B] border-[#10B981] text-[#10B981]'
        }`}
        style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
        title={isGameMode ? 'Switch to Academic Mode' : 'Switch to Game Mode'}
      >
        {isGameMode ? (
          <>
            <Gamepad2 className="w-4 h-4" />
            <span>GAME MODE</span>
            <span className="animate-pulse">█</span>
          </>
        ) : (
          <>
            <Briefcase className="w-4 h-4" />
            <span className="text-sm">Academic</span>
          </>
        )}
      </button>

      {/* Light / Dark Mode Toggle */}
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
