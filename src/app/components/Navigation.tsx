import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Gamepad2, Book, User, Database, LogOut, Settings,
  ShieldAlert, Lock, ClipboardList, FlaskConical, ChevronDown, Menu, X,
} from 'lucide-react';
import logo64  from '../../img/brand/odin-logo-transparent-64.png';
import logo128 from '../../img/brand/odin-logo-transparent-128.png';
import logo256 from '../../img/brand/odin-logo-transparent-256.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFeatureLockdown } from '../context/FeatureLockdownContext';
import { Button } from './ui/button';
import { LandingPageLink } from './LandingPageLink';

// ── Nav link definitions ──────────────────────────────────────────────────────

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  gameLabel: string;
  featureKey?: string;
  menuOnly?: boolean;
}

const ADMIN_LINKS: NavItem[] = [
  { to: '/profile',          icon: <User className="w-4 h-4" />,        label: 'Profile',     gameLabel: 'PROF' },
  { to: '/account-settings', icon: <Settings className="w-4 h-4" />,    label: 'Settings',    gameLabel: 'ACC'  },
  { to: '/admin',            icon: <Database className="w-4 h-4" />,    label: 'Database',    gameLabel: 'DATA' },
  { to: '/admin/analytics',  icon: <Book className="w-4 h-4" />,        label: 'Analytics',   gameLabel: 'STATS'},
  { to: '/admin/gamelogs',   icon: <Gamepad2 className="w-4 h-4" />,    label: 'Game Logs',   gameLabel: 'LOGS' },
  { to: '/admin/responses',  icon: <ClipboardList className="w-4 h-4" />,label: 'Responses',  gameLabel: 'RESP' },
  { to: '/admin/lockdown',   icon: <ShieldAlert className="w-4 h-4" />, label: 'Lockdown',    gameLabel: 'LOCK', menuOnly: true },
  { to: '/test-bench',       icon: <FlaskConical className="w-4 h-4" />,label: 'Test Bench',  gameLabel: 'TEST', menuOnly: true },
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
  // Phones and small tablets: one slim bar with a MENU button; everything else lives in its sheet.
  const [sheetOpen, setSheetOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const sheetButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;
  const stripLinks = links.filter((item) => !item.menuOnly);
  const menuLinks = links.filter((item) => item.menuOnly);
  const showMore = hasOverflow || menuLinks.length > 0;

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

  // Close the sheet after navigating, on Escape, on a tap outside the bar, or once the window is wide.
  useEffect(() => { setSheetOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSheetOpen(false);
      sheetButtonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => { if (!navRef.current?.contains(e.target as Node)) setSheetOpen(false); };
    const wide = window.matchMedia('(min-width: 1024px)');
    const onWide = () => { if (wide.matches) setSheetOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      wide.removeEventListener('change', onWide);
    };
  }, [sheetOpen]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  // Renders one nav link, respecting lockdown for students. Styling lives in odin-app.css (.odin-nav).
  const renderLink = (item: NavItem, inDropdown = false) => {
    const locked = item.featureKey ? isFeatureLocked(item.featureKey).locked : false;
    const active = isActive(item.to);
    return (
      <Link
        key={item.to}
        to={locked ? '#' : item.to}
        onClick={locked ? (e: React.MouseEvent) => e.preventDefault() : () => { setMoreOpen(false); setSheetOpen(false); }}
        title={locked ? 'This feature is currently locked' : undefined}
        aria-current={active ? 'page' : undefined}
        className={`odin-nav-link${active ? ' is-active' : ''}${locked ? ' is-locked' : ''}${inDropdown ? ' in-menu' : ''}`}
      >
        {item.icon}
        {isGameMode ? item.gameLabel : item.label}
        {locked && <Lock className="odin-nav-lock" />}
      </Link>
    );
  };

  return (
    <>
    <nav className="odin-nav" ref={navRef} data-sheet-open={sheetOpen || undefined}>
      <div className="odin-nav-inner">

        {/* Logo */}
        <Link to="/dashboard" className="odin-nav-brand">
          <img
            src={logo128}
            srcSet={`${logo64} 64w, ${logo128} 128w, ${logo256} 256w`}
            sizes="40px"
            alt="ODIN"
            style={{ imageRendering: 'pixelated' }}
          />
          <span>ODIN</span>
        </Link>

        {/* Right side: links + more button + user */}
        <div className="odin-nav-right">

          {/* Inline links — hidden overflow gets picked up by More dropdown */}
          <div ref={linksRef} className={`odin-nav-links${user?.role === 'admin' ? ' is-compact' : ''}`}>
            {stripLinks.map((item) => renderLink(item))}
          </div>

          {/* More dropdown — visible when links overflow or when any link is menu-only */}
          {showMore && (
            <div className="odin-nav-more" data-more-menu>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`odin-nav-link${moreOpen ? ' is-active' : ''}`}
                aria-expanded={moreOpen}
              >
                {isGameMode ? 'MORE' : 'More'}
                <ChevronDown className={moreOpen ? 'is-open' : ''} />
              </button>
              {moreOpen && (
                <div className="odin-nav-menu">
                  {menuLinks.map((item) => renderLink(item, true))}
                </div>
              )}
            </div>
          )}

          <LandingPageLink className="odin-nav-back" />

          {/* User info + logout */}
          <div className="odin-nav-user">
            <div className="odin-nav-who">
              <div className="odin-nav-name">{user?.name}</div>
              <div className="odin-nav-id">{user?.studentId}</div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="odin-nav-logout"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Narrow screens only (CSS hides it on wide ones). */}
        <button
          ref={sheetButtonRef}
          type="button"
          className="odin-nav-toggle"
          aria-expanded={sheetOpen}
          aria-controls="odin-nav-sheet"
          onClick={() => setSheetOpen((open) => !open)}
        >
          {sheetOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span>{sheetOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      <div id="odin-nav-sheet" className="odin-nav-sheet" hidden={!sheetOpen}>
        <div className="odin-nav-sheet-who">
          <div className="odin-nav-name">{user?.name}</div>
          <div className="odin-nav-id">{user?.studentId}</div>
        </div>
        <div className="odin-nav-sheet-links">
          {links.map((item) => renderLink(item, true))}
        </div>
        <div className="odin-nav-sheet-foot">
          <LandingPageLink className="odin-nav-back" />
          <button type="button" className="odin-nav-sheet-logout" onClick={handleLogout}>
            <LogOut aria-hidden="true" /> Log out
          </button>
        </div>
      </div>
    </nav>
    {/* Dims the page under an open sheet; a tap on it closes the sheet (outside the nav). */}
    {sheetOpen && <div className="odin-nav-scrim" aria-hidden="true" />}
    </>
  );
}
