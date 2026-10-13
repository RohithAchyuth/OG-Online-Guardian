import React from 'react';
import { SentinelLogo } from './SentinelLogo';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Share2, 
  Smartphone, 
  AlertTriangle, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type DashboardTab = 
  | 'overview' 
  | 'brand-profile' 
  | 'social-monitoring' 
  | 'app-monitoring' 
  | 'investigations' 
  | 'reports' 
  | 'notifications' 
  | 'settings';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut: () => void;
  unreadNotificationCount: number;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onSignOut,
  unreadNotificationCount,
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'overview' as DashboardTab, label: t.navOverview, icon: LayoutDashboard },
    { id: 'brand-profile' as DashboardTab, label: t.navBrandProfile, icon: ShieldCheck },
    { id: 'social-monitoring' as DashboardTab, label: t.navSocialMonitoring, icon: Share2 },
    { id: 'app-monitoring' as DashboardTab, label: t.navAppMonitoring, icon: Smartphone },
    { id: 'investigations' as DashboardTab, label: t.navThreatInvestigations, icon: AlertTriangle },
    { id: 'reports' as DashboardTab, label: t.navReports, icon: FileText },
    { 
      id: 'notifications' as DashboardTab, 
      label: t.navNotifications, 
      icon: Bell, 
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined 
    },
    { id: 'settings' as DashboardTab, label: t.navSettings, icon: Settings },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col justify-between h-screen glass-panel border-r border-white/10 transition-all duration-300 shadow-2xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="overflow-hidden">
            <SentinelLogo size="md" showText={!collapsed} />
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5" aria-label="Dashboard navigation">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium option-fly stagger-${index + 1} transition-all ${
                  active
                    ? 'text-cyan-200 bg-cyan-500/20 border border-cyan-400/40 shadow-lg shadow-cyan-950/50 backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/10 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${active ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-200 bg-cyan-950/80 border border-cyan-700/60 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t border-white/10 bg-white/[0.01]">
        <button
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs text-rose-400/90 hover:text-rose-200 hover:bg-rose-950/30 border border-transparent hover:border-rose-800/40 rounded-xl transition-all option-fly stagger-9 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? t.navSignOut : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap font-medium">{t.navSignOut}</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export const Sidebar = React.memo(SidebarComponent);
