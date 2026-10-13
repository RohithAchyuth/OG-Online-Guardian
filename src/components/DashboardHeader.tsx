import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { 
  Globe, 
  Bell, 
  Search, 
  Building2, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Camera
} from 'lucide-react';
import { DashboardTab } from './Sidebar';
import { avatarImg } from '../assets/images';
import { AvatarSelectionModal } from './AvatarSelectionModal';

interface DashboardHeaderProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenFirebaseModal: () => void;
  onSearchQuery?: (q: string) => void;
}

const DashboardHeaderComponent: React.FC<DashboardHeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenFirebaseModal,
}) => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const { user } = useAuth();
  const { brand, notifications, markNotificationRead, markAllNotificationsRead } = useBrand();

  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const tabLabels: Record<DashboardTab, string> = {
    overview: t.navOverview,
    'brand-profile': t.navBrandProfile,
    'social-monitoring': t.navSocialMonitoring,
    'app-monitoring': t.navAppMonitoring,
    investigations: t.navThreatInvestigations,
    reports: t.navReports,
    notifications: t.navNotifications,
    settings: t.navSettings,
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 glass-panel border-b border-white/10 shadow-lg">
      {/* Left: Organization & Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Organization Switcher Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel-subtle border border-white/10 rounded-xl text-xs text-slate-300 shadow-sm">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">{brand.brandName}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{user?.organizationName || 'Enterprise'}</span>
        </div>

        {/* Current Section Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-cyan-300 font-semibold tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{tabLabels[currentTab]}</span>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden lg:flex items-center relative w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search findings, handles, packages..."
          className="w-full pl-9 pr-3 py-1.5 glass-input rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">

        {/* Firebase Architecture Button */}
        <button
          onClick={onOpenFirebaseModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyan-300 glass-button rounded-xl transition-all whitespace-nowrap"
          title="Inspect Firebase status and Firestore rules"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-medium">Firebase Status</span>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Language selector"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase font-mono text-[11px]">{language}</span>
          </button>

          {langOpen && (
            <div 
              className="absolute right-0 mt-2 w-40 p-1.5 glass-dropdown layer-2 rounded-xl shadow-2xl z-50 space-y-1"
              onMouseLeave={() => setLangOpen(false)}
            >
              {availableLanguages.map((item, idx) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLanguage(item.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-all flex items-center justify-between option-fly stagger-${idx + 1} ${
                    language === item.code ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 font-semibold' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{item.nativeName}</span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">{item.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setLangOpen(false);
              setProfileOpen(false);
            }}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div 
              className="absolute right-0 mt-2 w-80 glass-dropdown layer-2 rounded-2xl shadow-2xl z-50 overflow-hidden"
              onMouseLeave={() => setNotifOpen(false)}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <span className="text-xs font-bold text-white">{t.notificationsTitle}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    {t.notificationsMarkAllRead}
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {t.notificationsEmpty}
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n, nIdx) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.targetId) {
                          onSelectTab(n.targetId.startsWith('app') ? 'app-monitoring' : 'social-monitoring');
                          setNotifOpen(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer transition-all option-fly stagger-${nIdx + 1} ${
                        !n.read ? 'bg-cyan-500/10 hover:bg-cyan-500/20' : 'hover:bg-white/[0.05] text-slate-400'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.severity === 'CRITICAL' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-white/10 text-center bg-white/[0.02]">
                <button
                  onClick={() => {
                    onSelectTab('notifications');
                    setNotifOpen(false);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setLangOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center overflow-hidden shadow-sm relative group">
              <img
                src={user?.avatarUrl || avatarImg}
                alt={user?.fullName || 'User Avatar'}
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden xl:inline text-xs font-medium text-slate-200">
              {user?.fullName?.split(' ')[0] || 'Analyst'}
            </span>
          </button>

          {profileOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 p-3.5 glass-dropdown layer-2 rounded-2xl shadow-2xl z-50 text-xs space-y-2"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="pb-2.5 border-b border-white/10 flex items-start gap-2.5">
                <div className="relative group shrink-0">
                  <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/50 overflow-hidden shadow-sm">
                    <img
                      src={user?.avatarUrl || avatarImg}
                      alt={user?.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setIsAvatarModalOpen(true);
                      setProfileOpen(false);
                    }}
                    className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-cyan-500 text-slate-950 shadow-sm hover:scale-110 transition-transform"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-2.5 h-2.5 stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{user?.fullName || 'Analyst'}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 font-mono text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full font-bold">
                    {user?.role || 'ADMIN'} · {user?.isDemoUser ? 'Judge Access' : 'Verified'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAvatarModalOpen(true);
                  setProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-cyan-300 hover:text-white hover:bg-cyan-950/50 rounded-xl transition-all flex items-center gap-2 font-medium"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Change Profile Photo</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('brand-profile');
                  setProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all option-fly stagger-1"
              >
                Manage Brand Assets
              </button>

              <button
                onClick={() => {
                  onSelectTab('settings');
                  setProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all option-fly stagger-2"
              >
                Platform Settings
              </button>
            </div>
          )}
        </div>
      </div>

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </header>
  );
};

export const DashboardHeader = React.memo(DashboardHeaderComponent);
