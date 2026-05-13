import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Gamepad2, Book, User, Database, LogOut, Settings, ShieldAlert, Lock, ClipboardList } from 'lucide-react';
import logo64 from '../../img/brand/odin-logo-transparent-64.png';
import logo128 from '../../img/brand/odin-logo-transparent-128.png';
import logo256 from '../../img/brand/odin-logo-transparent-256.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFeatureLockdown } from '../context/FeatureLockdownContext';
import { Button } from './ui/button';

export function Navigation() {
  const { user, logout } = useAuth();
  const { isGameMode } = useTheme();
  const { isFeatureLocked } = useFeatureLockdown();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Helper to render a nav link that respects lockdown for students
  const NavLink = ({ to, featureKey, icon, label, gameLabel }: { to: string; featureKey?: string; icon: React.ReactNode; label: string; gameLabel: string }) => {
    const locked = featureKey ? isFeatureLocked(featureKey).locked : false;
    const active = isActive(to);

    return (
      <Link
        to={locked ? '#' : to}
        onClick={locked ? (e: React.MouseEvent) => e.preventDefault() : undefined}
        title={locked ? 'This feature is currently locked' : undefined}
        className={`relative flex items-center gap-2 px-3 py-2 rounded transition-colors ${
          locked
            ? 'opacity-40 cursor-not-allowed'
            : active
            ? isGameMode
              ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
              : 'text-primary bg-primary/10'
            : isGameMode
            ? 'text-[#4ecdc4] hover:text-[#00ff41]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
      >
        {icon}
        {isGameMode ? gameLabel : label}
        {locked && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-[#FF5252]" />}
      </Link>
    );
  };

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
            <img
              src={logo128}
              srcSet={`${logo64} 64w, ${logo128} 128w, ${logo256} 256w`}
              sizes="40px"
              alt="ODIN"
              className={`w-10 h-10 ${isGameMode ? 'drop-shadow-[0_0_12px_rgba(100,241,209,0.6)]' : ''}`}
              style={{ imageRendering: 'pixelated' }}
            />
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
                  <Settings className="w-4 h-4" />
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
                <Link
                  to="/admin/gamelogs"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/admin/gamelogs')
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
                  {isGameMode ? 'LOGS' : 'Game Logs'}
                </Link>
                <Link
                  to="/admin/responses"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/admin/responses')
                      ? isGameMode
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <ClipboardList className="w-4 h-4" />
                  {isGameMode ? 'RESP' : 'Responses'}
                </Link>
                <Link
                  to="/admin/lockdown"
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive('/admin/lockdown')
                      ? isGameMode
                        ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
                        : 'text-primary bg-primary/10'
                      : isGameMode
                      ? 'text-[#4ecdc4] hover:text-[#00ff41]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {isGameMode ? 'LOCK' : 'Lockdown'}
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" featureKey="dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" gameLabel="HQ" />
                <NavLink to="/play" featureKey="game" icon={<Gamepad2 className="w-4 h-4" />} label="Game" gameLabel="PLAY" />
                <NavLink to="/wiki" featureKey="wiki" icon={<Book className="w-4 h-4" />} label="Wiki" gameLabel="WIKI" />
                <NavLink to="/posttest" featureKey="posttest" icon={<ClipboardList className="w-4 h-4" />} label="Post Test" gameLabel="POST" />
                <NavLink to="/profile" featureKey="profile" icon={<User className="w-4 h-4" />} label="Profile" gameLabel="PROF" />
                <NavLink to="/account-settings" featureKey="account-settings" icon={<Settings className="w-4 h-4" />} label="Settings" gameLabel="ACC" />
              </>
            )}

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