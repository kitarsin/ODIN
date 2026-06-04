import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Gamepad2, Book, User, Database, LogOut, Settings,
  ShieldAlert, Lock, ClipboardList, FlaskConical, ChevronDown,
} from 'lucide-react';
import logo64  from '../../img/brand/odin-logo-transparent-64.png';
import logo128 from '../../img/brand/odin-logo-transparent-128.png';
import logo256 from '../../img/brand/odin-logo-transparent-256.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFeatureLockdown } from '../context/FeatureLockdownContext';
import { Button } from './ui/button';

// ── Nav link definitions ──────────────────────────────────────────────────────

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  gameLabel: string;
  featureKey?: string;
}

const ADMIN_LINKS: NavItem[] = [
  { to: '/profile',          icon: <User className="w-4 h-4" />,        label: 'Profile',     gameLabel: 'PROF' },
  { to: '/account-settings', icon: <Settings className="w-4 h-4" />,    label: 'Settings',    gameLabel: 'ACC'  },
  { to: '/admin',            icon: <Database className="w-4 h-4" />,    label: 'Database',    gameLabel: 'DATA' },
  { to: '/admin/analytics',  icon: <Book className="w-4 h-4" />,        label: 'Analytics',   gameLabel: 'STATS'},
  { to: '/admin/gamelogs',   icon: <Gamepad2 className="w-4 h-4" />,    label: 'Game Logs',   gameLabel: 'LOGS' },
  { to: '/admin/responses',  icon: <ClipboardList className="w-4 h-4" />,label: 'Responses',  gameLabel: 'RESP' },
  { to: '/admin/lockdown',   icon: <ShieldAlert className="w-4 h-4" />, label: 'Lockdown',    gameLabel: 'LOCK' },
  { to: '/test-bench',       icon: <FlaskConical className="w-4 h-4" />,label: 'Test Bench',  gameLabel: 'TEST' },
];

const STUDENT_LINKS: NavItem[] = [
  { to: '/dashboard',        icon: <Home className="w-4 h-4" />,         label: 'Dashboard', gameLabel: 'HQ',   featureKey: 'dashboard'       },
  { to: '/play',             icon: <Gamepad2 className="w-4 h-4" />,     label: 'Game',      gameLabel: 'PLAY', featureKey: 'game'            },
  { to: '/wiki',             icon: <Book className="w-4 h-4" />,         label: 'Wiki',      gameLabel: 'WIKI', featureKey: 'wiki'            },
  { to: '/posttest',         icon: <ClipboardList className="w-4 h-4" />,label: 'Post Test', gameLabel: 'POST', featureKey: 'posttest'        },
  { to: '/profile',          icon: <User className="w-4 h-4" />,         label: 'Profile',   gameLabel: 'PROF', featureKey: 'profile'         },
  { to: '/account-settings', icon: <Settings className="w-4 h-4" />,     label: 'Settings',  gameLabel: 'ACC',  featureKey: 'account-settings'},
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Navigation() {
  const { user, logout } = useAuth();
  const { isGameMode } = useTheme();
  const { isFeatureLocked } = useFeatureLockdown();
  const location = useLocation();
  const navigate = useNavigate();

  const [moreOpen, setMoreOpen] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const linksRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;

  // Detect when inline links overflow the available space
  useLayoutEffect(() => {
    const el = linksRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollWidth > el.clientWidth + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();
    return () => ro.disconnect();
  }, [links]);

  // Close the More dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-more-menu]')) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  // ── Shared style helpers ──
  const itemClass = (active: boolean, locked = false) =>
    `flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm whitespace-nowrap ${
      locked
        ? 'opacity-40 cursor-not-allowed'
        : active
        ? isGameMode
          ? 'text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]'
          : 'text-primary bg-primary/10'
        : isGameMode
        ? 'text-[#4ecdc4] hover:text-[#00ff41]'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  const itemStyle = isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {};

  // Renders one nav link, respecting lockdown for students
  const renderLink = (item: NavItem, inDropdown = false) => {
    const locked = item.featureKey ? isFeatureLocked(item.featureKey).locked : false;
    const active = isActive(item.to);
    return (
      <Link
        key={item.to}
        to={locked ? '#' : item.to}
        onClick={locked ? (e: React.MouseEvent) => e.preventDefault() : () => setMoreOpen(false)}
        title={locked ? 'This feature is currently locked' : undefined}
        className={`relative ${itemClass(active, locked)} ${inDropdown ? 'w-full' : ''}`}
        style={itemStyle}
      >
        {item.icon}
        {isGameMode ? item.gameLabel : item.label}
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
        <div className="flex items-center justify-between gap-4 min-w-0">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
            <img
              src={logo128}
              srcSet={`${logo64} 64w, ${logo128} 128w, ${logo256} 256w`}
              sizes="40px"
              alt="ODIN"
              className={`w-10 h-10 ${isGameMode ? 'drop-shadow-[0_0_12px_rgba(100,241,209,0.6)]' : ''}`}
              style={{ imageRendering: 'pixelated' }}
            />
            <span
              className={`text-xl font-semibold transition-all ${isGameMode ? 'text-[#00ff41]' : 'text-foreground'}`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)' } : { fontFamily: 'var(--font-mono)' }}
            >
              ODIN
            </span>
          </Link>

          {/* Right side: links + more button + user */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">

            {/* Inline links — hidden overflow gets picked up by More dropdown */}
            <div
              ref={linksRef}
              className="flex items-center gap-1 overflow-hidden min-w-0"
            >
              {links.map((item) => renderLink(item))}
            </div>

            {/* More dropdown — only visible when links overflow */}
            {hasOverflow && (
              <div className="relative shrink-0" data-more-menu>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded transition-colors text-sm shrink-0 ${
                    moreOpen
                      ? isGameMode ? 'text-[#00ff41] bg-[#00ff41]/10' : 'text-primary bg-primary/10'
                      : isGameMode ? 'text-[#4ecdc4] hover:text-[#00ff41]' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={itemStyle}
                >
                  {isGameMode ? 'MORE' : 'More'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className={`absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border shadow-lg py-1 ${
                    isGameMode ? 'bg-[#16213e] border-[#00ff41]' : 'bg-card border-border'
                  }`}>
                    {links.map((item) => renderLink(item, true))}
                  </div>
                )}
              </div>
            )}

            {/* User info + logout */}
            <div className={`flex items-center gap-3 shrink-0 ml-2 pl-3 border-l ${
              isGameMode ? 'border-[#00ff41]' : 'border-border'
            }`}>
              <div className="text-right hidden sm:block">
                <div className={`text-sm ${isGameMode ? 'text-[#00ff41]' : 'text-foreground'}`}>{user?.name}</div>
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
