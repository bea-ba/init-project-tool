import { NavLink } from 'react-router-dom';
import { Home, Moon, AlarmClock, Calendar, BookOpen, Lightbulb, Music, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/sleep-tracker', icon: Moon, label: 'Track' },
  { path: '/alarm-setup', icon: AlarmClock, label: 'Alarm' },
  { path: '/sleep-history', icon: Calendar, label: 'History' },
  { path: '/sleep-notes', icon: BookOpen, label: 'Notes' },
  { path: '/insights', icon: Lightbulb, label: 'Insights' },
  { path: '/sounds', icon: Music, label: 'Sounds' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/premium', icon: Crown, label: 'Premium' },
];

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Dreamwell
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Rest Deeply, Live Fully</p>
      </div>
      
      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
