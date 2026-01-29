import { Home, Code, User, Shield, ChevronRight, Menu } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string[];
}

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
}

const navItems: NavItem[] = [
  { 
    id: 'dashboard', 
    icon: <Home className="w-6 h-6" />, 
    label: 'Home',
    path: ['Home']
  },
  { 
    id: 'workspace', 
    icon: <Code className="w-6 h-6" />, 
    label: 'Editor',
    path: ['Home', 'System', 'Editor']
  },
  { 
    id: 'profile', 
    icon: <User className="w-6 h-6" />, 
    label: 'Profile',
    path: ['Home', 'Agent', 'Profile']
  },
];

const adminNavItem: NavItem = {
  id: 'admin',
  icon: <Shield className="w-6 h-6" />,
  label: 'Admin',
  path: ['Home', 'System', 'Admin', 'Control']
};

export function Navigation({ currentPage, onNavigate, isAdmin = false }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const items = isAdmin ? [...navItems, adminNavItem] : navItems;
  const currentItem = items.find(item => item.id === currentPage) || items[0];

  return (
    <>
      {/* Sidebar */}
      <div className={`
        h-full backdrop-blur-md bg-card/80 border-r border-border/50 flex flex-col
        transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Logo Header */}
        <div className="h-16 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2979FF] to-[#00E676] flex items-center justify-center">
                <span className="text-lg font-bold">O</span>
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                ODIN
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {items.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#2979FF]/20 to-[#00E676]/20 text-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.2)]' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }
                `}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#2979FF] to-[#00E676] rounded-r shadow-[0_0_10px_rgba(0,230,118,0.8)]" />
                )}

                <div className={`${isActive ? 'text-[#00E676]' : ''} transition-colors`}>
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <span className="font-medium" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {item.label}
                  </span>
                )}

                {/* Hover Glow Effect */}
                {isActive && !isCollapsed && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border/50 shrink-0">
          <div className={`
            p-3 rounded-lg bg-secondary/30 border border-border/50
            ${isCollapsed ? 'text-center' : ''}
          `}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
                  <span className="text-xs text-[#00E676] code-font">ONLINE</span>
                </div>
                <p className="text-xs text-muted-foreground code-font">
                  System v1.0
                </p>
              </>
            ) : (
              <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse mx-auto" />
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="absolute top-4 left-80 z-10">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md bg-card/60 border border-border/50 shadow-[0_0_20px_rgba(41,121,255,0.05)]">
          {currentItem.path.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm code-font text-[#00E676]">
                {crumb}
              </span>
              {index < currentItem.path.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
