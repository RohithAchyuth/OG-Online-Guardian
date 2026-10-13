import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { SeverityBadge } from '../../components/SeverityBadge';
import { useInvestigation } from '../../context/InvestigationContext';
import { 
  ShieldCheck, 
  Smartphone, 
  UserCheck, 
  Share2, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Clock, 
  ExternalLink,
  CheckCircle2,
  Info
} from 'lucide-react';

interface RecentAlert {
  id: string;
  category: 'APP' | 'LOOKALIKE' | 'SOCIAL';
  title: string;
  detail: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  target: string;
}

export const PersonalOverviewView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { isCaseActive, startInvestigation, startMultipleInvestigations } = useInvestigation();

  const [quickInput, setQuickInput] = useState('');

  // Curated recent detections and alerts for the personal overview
  const recentAlerts: RecentAlert[] = [
    {
      id: 'alert-1',
      category: 'APP',
      title: 'Potential Clone Detected on Apple App Store',
      detail: 'Application title incorporates your stem with developer mismatch: published by "QuickUtility Global".',
      severity: 'HIGH',
      timestamp: '15 mins ago',
      target: 'Fast Rewards Companion',
    },
    {
      id: 'alert-2',
      category: 'LOOKALIKE',
      title: 'Deceptive Homoglyph Handle Discovered',
      detail: 'Registered public profile mimics username using character substitution "0" for "o" and "_official" suffix.',
      severity: 'CRITICAL',
      timestamp: '2 hours ago',
      target: '@alex_0fficial',
    },
    {
      id: 'alert-3',
      category: 'SOCIAL',
      title: 'Suspicious Support Account on Public Index',
      detail: 'Matching profile claiming official helpdesk affiliation discovered on public developer directory.',
      severity: 'HIGH',
      timestamp: '5 hours ago',
      target: 'GitHub & X Directory',
    },
  ];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    // Route to Look-alike detection with search context
    navigate('/personal/lookalike');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 glass-panel border border-cyan-500/20 rounded-2xl relative overflow-hidden layer-1 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl glass-panel-subtle border border-cyan-400/30 text-cyan-300 text-xs font-mono shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Personal Brand & Identity Protection</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.fullName || 'User'}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Your personal digital risk defense center. Monitor mobile application stores for copycats, detect deceptive look-alike names and homoglyphs, and track unauthorized social media impersonation across public networks.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleQuickSearch} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Scan name, username, or profile handle..."
                className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 glass-button-primary text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-cyan-500/30"
            >
              <span>Scan Identity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Monitoring Status & Transparency Notice */}
      <div className="p-4 glass-panel-subtle border border-white/10 rounded-2xl text-xs text-slate-300 flex items-start gap-3 layer-1">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-white">Public Intelligence Transparency Statement</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All personal threat detections are performed via on-demand queries to live public endpoints (Apple App Store Search API, GitHub Public API, Reddit User Directory, and public look-alike analysis engines). No scan results are fabricated. Continuous 24/7 background polling requires platform API webhook credentials.
          </p>
        </div>
      </div>

      {/* The 3 Main Feature Sections */}
      <div className="layer-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
          Core Personal Protection Suites
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: App Store Monitoring */}
          <div 
            onClick={() => navigate('/personal/apps')}
            className="group cursor-pointer p-5.5 glass-card rounded-2xl transition-all flex flex-col justify-between space-y-4 option-fly stagger-1"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-sm shadow-cyan-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  1. App Store Monitoring
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Search live Apple App Store and mobile catalogs. Identify unauthorized copycat apps, package bundle hijackers, and developer mismatches with algorithmic explanations.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>Launch App Store Monitor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Look-alike Name Detection */}
          <div 
            onClick={() => navigate('/personal/lookalike')}
            className="group cursor-pointer p-5.5 glass-card rounded-2xl transition-all flex flex-col justify-between space-y-4 option-fly stagger-2"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-sm shadow-sky-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  2. Look-alike Name Detection
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Input personal names, handles, or profile URLs. Generates homoglyph character changes, dots, and numbers, clearly distinguishing algorithmic suggestions from discovered live profiles.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-sky-400 font-semibold">
              <span>Open Look-alike Engine</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Social Media Monitoring */}
          <div 
            onClick={() => navigate('/personal/social')}
            className="group cursor-pointer p-5.5 glass-card rounded-2xl transition-all flex flex-col justify-between space-y-4 option-fly stagger-3"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-sm shadow-emerald-500/20">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  3. Social Media Monitoring
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Scan supported networks (GitHub, Reddit, X public directories) for actual matching profiles and suspicious-account impersonation alerts with verifiable timestamps.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>View Social Monitor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Simple Overview: Recent Detections & Alerts */}
      <div className="p-6 glass-panel rounded-2xl space-y-4 layer-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Recent Detections & Alerts
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                startMultipleInvestigations(recentAlerts, true);
              }}
              className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Investigate All ({recentAlerts.length})</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">Showing 3 latest items</span>
          </div>
        </div>

        <div className="space-y-3">
          {recentAlerts.map((alert, idx) => (
            <div
              key={alert.id}
              className={`p-4 glass-card rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 option-fly stagger-${idx + 1}`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-semibold">
                    {alert.category}
                  </span>
                  <SeverityBadge severity={alert.severity} size="sm" />
                  <span className="text-xs font-bold text-white">{alert.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">{alert.detail}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{alert.timestamp}</span>
                </div>
                {(() => {
                  const active = isCaseActive(alert.id);
                  return (
                    <button
                      onClick={() => {
                        startInvestigation(alert, alert.title);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-sans text-xs transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-cyan-500 text-slate-950 font-bold border border-cyan-400 shadow-sm shadow-cyan-500/30'
                          : 'glass-button text-cyan-300 hover:text-white'
                      }`}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                      <span>{active ? 'Investigating' : 'Investigate'}</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
