import { NavLink } from 'react-router-dom';
import { Home, Moon, AlarmClock, Calendar, BookOpen, Lightbulb, Music, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

const NAV_ITEMS = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/sleep-tracker', icon: Moon, labelKey: 'nav.track' },
  { path: '/alarm-setup', icon: AlarmClock, labelKey: 'nav.alarm' },
  { path: '/sleep-history', icon: Calendar, labelKey: 'nav.history' },
  { path: '/sleep-notes', icon: BookOpen, labelKey: 'nav.notes' },
  { path: '/insights', icon: Lightbulb, labelKey: 'nav.insights' },
  { path: '/sounds', icon: Music, labelKey: 'nav.sounds' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
  { path: '/premium', icon: Crown, labelKey: 'nav.premium' },
];

export const Navigation = () => {
  const { t } = useLanguage();

  return (
    <nav
      id="mobile-navigation"
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="px-2 py-1" role="menubar">
        {/* First row - Primary navigation */}
        <div className="flex items-center justify-around mb-1">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                role="menuitem"
                aria-label={`Navigate to ${label}`}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-medium truncate px-1">{label}</span>
              </NavLink>
            );
          })}
        </div>
        {/* Second row - Secondary navigation */}
        <div className="flex items-center justify-around">
          {NAV_ITEMS.slice(5).map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                role="menuitem"
                aria-label={`Navigate to ${label}`}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-medium truncate px-1">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const DesktopSidebar = () => {
  const { t } = useLanguage();

  return (
    <aside
      id="desktop-navigation"
      className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen sticky top-0"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Dreamwell
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Rest Deeply, Live Fully</p>
      </div>

      <nav className="flex-1 px-3" role="menu" aria-label="Main menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const label = t(item.labelKey);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              role="menuitem"
              aria-label={`Navigate to ${label}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
