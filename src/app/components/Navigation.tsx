import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Home, Gamepad2, Book, User, Database, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const { user, logout } = useAuth();
  const { isGameMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`border-b transition-all ${
      isGameMode 
        ? 'border-[#00ff41] bg-[#16213e] shadow-[0_0_10px_rgba(0,255,65,0.3)]' 
        : 'border-border bg-card'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded flex items-center justify-center transition-all ${
              isGameMode 
                ? 'bg-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]' 
                : 'bg-primary'
            }`}>
              <Shield className={`w-6 h-6 ${isGameMode ? 'text-[#1a1a2e]' : 'text-primary-foreground'}`} />
            </div>
            <span 
              className={`text-xl font-semibold transition-all ${
                isGameMode ? 'text-[#00ff41]' : 'text-foreground'
              }`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)' } : { fontFamily: 'var(--font-mono)' }}
            >
              ODIN
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {user?.role === 'admin' ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/profile')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <User className="w-4 h-4" />
                  {isGameMode ? 'PROF' : 'Profile'}
                </Link>
                <Link
                  to="/account-settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/account-settings')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <User className="w-4 h-4" />
                  {isGameMode ? 'ACC' : 'Settings'}
                </Link>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/admin')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <Database className="w-4 h-4" />
                  {isGameMode ? 'DATA' : 'Database'}
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/admin/analytics')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <Book className="w-4 h-4" />
                  {isGameMode ? 'STATS' : 'Analytics'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/dashboard')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <Home className="w-4 h-4" />
                  {isGameMode ? 'HQ' : 'Dashboard'}
                </Link>
                <Link
                  to="/play"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/play')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <Gamepad2 className="w-4 h-4" />
                  {isGameMode ? 'PLAY' : 'Game'}
                </Link>
                <Link
                  to="/wiki"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/wiki')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <Book className="w-4 h-4" />
                  {isGameMode ? 'WIKI' : 'Wiki'}
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/profile')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <User className="w-4 h-4" />
                  {isGameMode ? 'PROF' : 'Profile'}
                </Link>
                <Link
                  to="/account-settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/account-settings')
                      ? isGameMode 
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <User className="w-4 h-4" />
                  {isGameMode ? 'ACC' : 'Settings'}
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Info & Logout */}
            <div className={`flex items-center gap-3 ml-4 pl-4 border-l ${
              isGameMode ? 'border-[#00ff41]' : 'border-border'
            }`}>
              <div className="text-right">
                <div className={`text-sm ${isGameMode ? 'text-[#00ff41]' : 'text-foreground'}`}>
                  {user?.name}
                </div>
                <div 
                  className={`text-xs ${isGameMode ? 'text-[#4ecdc4]' : 'text-muted-foreground'}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {user?.studentId}
                </div>
              </div>
              <Button
                onClick={async () => { await logout(); navigate('/login'); }}
                variant="ghost"
                size="sm"
                className={isGameMode ? 'text-[#ff6b6b] hover:text-[#ff6b6b]' : 'text-muted-foreground hover:text-destructive'}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}