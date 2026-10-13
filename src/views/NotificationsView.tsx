import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { SeverityBadge } from '../components/SeverityBadge';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { DashboardTab } from '../components/Sidebar';

interface NotificationsViewProps {
  onSelectTab: (tab: DashboardTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onSelectTab }) => {
  const { t } = useLanguage();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useBrand();

  return (
    <div className="space-y-6 layer-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span>{t.notificationsTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security telemetry, scan completions, and high-priority look-alike alerts.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-cyan-300 hover:text-white glass-button rounded-xl transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.notificationsMarkAllRead}</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="p-5.5 glass-card rounded-2xl space-y-3 layer-2 shadow-xl">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            {t.notificationsEmpty}
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.targetId) {
                    onSelectTab(notif.targetId.startsWith('app') ? 'app-monitoring' : 'social-monitoring');
                  }
                }}
                className={`py-4 px-3 flex items-start justify-between gap-4 cursor-pointer rounded-xl transition-all option-fly stagger-${(idx % 10) + 1} ${
                  !notif.read ? 'bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 shadow-sm' : 'hover:bg-white/5 text-slate-400 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {notif.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </span>
                      <SeverityBadge severity={notif.severity} />
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {notif.targetId && (
                    <ArrowRight className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
