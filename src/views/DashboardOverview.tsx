import React, { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { 
  ShieldCheck, 
  Share2, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { SocialFinding, AppFinding } from '../types';
import { DashboardTab } from '../components/Sidebar';
import { useInvestigation } from '../context/InvestigationContext';

interface DashboardOverviewProps {
  onSelectTab: (tab: DashboardTab) => void;
  onOpenFinding: (finding: SocialFinding | AppFinding) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectTab,
  onOpenFinding,
}) => {
  const { t } = useLanguage();
  const { isCaseActive, startInvestigation, startMultipleInvestigations } = useInvestigation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { 
    brand, 
    socialFindings, 
    appFindings, 
    lastScanTimestamp, 
    scanSocials, 
    scanApps,
    isScanningSocial, 
    isScanningApps 
  } = useBrand();

  const stats = useMemo(() => {
    const totalAssetsMonitored = brand.officialSocials.length + brand.officialApps.length;
    let activeSocialThreats = 0;
    let highPrioritySocials = 0;
    let resolvedSocials = 0;
    let critSocials = 0;
    let highSocials = 0;
    let medSocials = 0;
    let lowSocials = 0;

    for (let i = 0; i < socialFindings.length; i++) {
      const f = socialFindings[i];
      const isResolved = f.status === 'RESOLVED' || f.status === 'FALSE_POSITIVE';
      if (!isResolved) {
        activeSocialThreats++;
        if (f.severity === 'CRITICAL' || f.severity === 'HIGH') {
          highPrioritySocials++;
        }
      } else {
        resolvedSocials++;
      }
      if (f.severity === 'CRITICAL') critSocials++;
      else if (f.severity === 'HIGH') highSocials++;
      else if (f.severity === 'MEDIUM') medSocials++;
      else if (f.severity === 'LOW') lowSocials++;
    }

    let activeAppThreats = 0;
    let highPriorityApps = 0;
    let resolvedApps = 0;
    let critApps = 0;
    let highApps = 0;
    let medApps = 0;
    let lowApps = 0;

    for (let i = 0; i < appFindings.length; i++) {
      const f = appFindings[i];
      const isResolved = f.status === 'RESOLVED' || f.status === 'FALSE_POSITIVE';
      if (!isResolved) {
        activeAppThreats++;
        if (f.severity === 'CRITICAL' || f.severity === 'HIGH') {
          highPriorityApps++;
        }
      } else {
        resolvedApps++;
      }
      if (f.severity === 'CRITICAL') critApps++;
      else if (f.severity === 'HIGH') highApps++;
      else if (f.severity === 'MEDIUM') medApps++;
      else if (f.severity === 'LOW') lowApps++;
    }

    return {
      totalAssetsMonitored,
      activeSocialThreats,
      activeAppThreats,
      highPriorityCount: highPrioritySocials + highPriorityApps,
      resolvedCount: resolvedSocials + resolvedApps,
      criticalTotal: critSocials + critApps,
      highTotal: highSocials + highApps,
      mediumTotal: medSocials + medApps,
      lowTotal: lowSocials + lowApps,
    };
  }, [brand.officialSocials.length, brand.officialApps.length, socialFindings, appFindings]);

  // Combine top recent findings
  const recentDetections = useMemo(() => [
    ...socialFindings.map(s => ({ ...s, type: 'social' as const })),
    ...appFindings.map(a => ({ ...a, type: 'app' as const })),
  ].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()).slice(0, 5), [socialFindings, appFindings]);

  const handleRunFullScan = async () => {
    await Promise.all([scanSocials(), scanApps()]);
  };

  const isScanning = isScanningSocial || isScanningApps;

  return (
    <div className="space-y-6 layer-1">
      {/* Top Banner: Fictional Data / Demo Mode Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4.5 glass-panel rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm shadow-cyan-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                {t.demoMode}
              </span>
              <span className="text-[10px] bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 px-2.5 py-0.5 rounded-full font-bold">
                {t.fictionalDataLabel}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {t.demoModeNotice}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunFullScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 glass-button-primary disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-md shadow-cyan-500/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning External Feeds...' : 'Run Full Ecosystem Scan'}</span>
        </button>
      </div>

      {/* KPI Stats Grid - 6 Key Metrics with Layered Fly-In */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 layer-2">
        {/* Metric 1 */}
        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{t.statAssetsMonitored}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            {stats.totalAssetsMonitored}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {brand.officialSocials.length} Social · {brand.officialApps.length} App
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{t.statSocialImpersonations}</span>
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums drop-shadow-[0_0_8px_rgba(252,211,77,0.3)]">
            {stats.activeSocialThreats}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Active cases</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{t.statSuspiciousApps}</span>
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 tabular-nums drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]">
            {stats.activeAppThreats}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Store listings</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{t.statHighPriority}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 tabular-nums drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]">
            {stats.highPriorityCount}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Critical & High</p>
        </div>

        {/* Metric 5 */}
        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{t.statResolvedThreats}</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
            {stats.resolvedCount}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Takedown / Whitelist</p>
        </div>

        {/* Metric 6 */}
        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-6">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{t.statLastScan}</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-semibold text-slate-200 mt-1 truncate">
            {new Date(lastScanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-[11px] text-emerald-400 font-mono">Active Monitoring</p>
        </div>
      </div>

      {/* Analytics & Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Trends Chart */}
        <div className="p-5 bg-[#091122] border border-slate-800 rounded-xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>{t.chartThreatTrendsTitle}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Weekly telemetry of candidate look-alikes flagged across public platforms
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded">
              Last 6 Weeks
            </span>
          </div>

          {/* SVG Area / Bar Chart */}
          <div className="h-48 w-full pt-4">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Area */}
              <path
                d="M 20 110 Q 100 80, 180 95 T 340 50 T 480 35 L 480 140 L 20 140 Z"
                fill="url(#area-grad)"
              />

              {/* Line */}
              <path
                d="M 20 110 Q 100 80, 180 95 T 340 50 T 480 35"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { x: 20, y: 110, val: 2, label: 'Wk 1' },
                { x: 100, y: 80, val: 5, label: 'Wk 2' },
                { x: 180, y: 95, val: 4, label: 'Wk 3' },
                { x: 260, y: 65, val: 7, label: 'Wk 4' },
                { x: 340, y: 50, val: 9, label: 'Wk 5' },
                { x: 480, y: 35, val: 12, label: 'Current' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#06b6d4" stroke="#070d18" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    {pt.val}
                  </text>
                  <text x={pt.x} y="145" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Severity Breakdown & Threat Distribution */}
        <div className="p-5 bg-[#091122] border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{t.chartSeverityBreakdownTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active threat categorization by impact
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Critical */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-red-400 font-medium">Critical (85-100)</span>
                <span className="font-mono text-slate-300">
                  {stats.criticalTotal}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* High */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-amber-400 font-medium">High (70-84)</span>
                <span className="font-mono text-slate-300">
                  {stats.highTotal}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-yellow-300 font-medium">Medium (50-69)</span>
                <span className="font-mono text-slate-300">
                  {stats.mediumTotal}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* Low / False Positive */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-cyan-400 font-medium">Low / Legitimate Look-alikes</span>
                <span className="font-mono text-slate-300">
                  {stats.lowTotal}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] text-slate-400">
            Detection engine ignores exact matches to registered assets (@{brand.officialSocials[0]?.username}).
          </div>
        </div>
      </div>

      {/* Two-Column Lower Grid: Recent Detections + Monitored Sources Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Detections Table */}
        <div className="lg:col-span-2 p-5 bg-[#091122] border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {t.recentDetectionsTitle}
                </h3>
                {selectedIds.size > 0 && (
                  <span className="font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded text-[10px]">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Prioritized candidates requiring analyst review
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => {
                    const selectedList = recentDetections.filter((item) => selectedIds.has(item.id));
                    startMultipleInvestigations(selectedList, true);
                  }}
                  className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Investigate Selected ({selectedIds.size})
                </button>
              )}
              {recentDetections.length > 0 && (
                <button
                  onClick={() => {
                    startMultipleInvestigations(recentDetections, true);
                  }}
                  className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold rounded-lg transition-colors"
                >
                  Investigate All ({recentDetections.length})
                </button>
              )}
              <button
                onClick={() => onSelectTab('social-monitoring')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 ml-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                <tr>
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={recentDetections.length > 0 && recentDetections.every((item) => selectedIds.has(item.id))}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) {
                          recentDetections.forEach((item) => next.add(item.id));
                        } else {
                          recentDetections.forEach((item) => next.delete(item.id));
                        }
                        setSelectedIds(next);
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Candidate Asset</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentDetections.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedIds.has(item.id) ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(item.id);
                          else next.delete(item.id);
                          setSelectedIds(next);
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">
                        {'accountName' in item ? item.accountName : item.appName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {'username' in item ? `@${item.username}` : item.packageOrBundleId}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">
                      {item.platform}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-white">
                      {item.riskScore}
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {(() => {
                        const active = isCaseActive(item.id);
                        return (
                          <button
                            onClick={() => {
                              startInvestigation(item);
                              onOpenFinding(item);
                            }}
                            className={`px-2.5 py-1 text-xs rounded border transition-colors font-medium flex items-center gap-1.5 ml-auto ${
                              active
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm shadow-cyan-500/30'
                                : 'text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60'
                            }`}
                          >
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                            <span>{active ? 'Investigating' : 'Investigate'}</span>
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monitoring Source Availability / Status */}
        <div className="p-5 glass-panel rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              {t.chartSourcesHealthTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reconnaissance source connector availability
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 glass-card rounded-xl flex items-center justify-between option-fly stagger-1">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="font-medium text-slate-200">X (Twitter) Feed</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="p-3 glass-card rounded-xl flex items-center justify-between option-fly stagger-2">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="font-medium text-slate-200">Google Play Index</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="p-3 glass-card rounded-xl flex items-center justify-between option-fly stagger-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="font-medium text-slate-200">Instagram Graph Prober</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="p-3 glass-card rounded-xl flex items-center justify-between option-fly stagger-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="font-medium text-slate-200">Apple App Store Index</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="p-3 glass-card rounded-xl flex items-center justify-between option-fly stagger-5">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="font-medium text-slate-200">LinkedIn Company Search</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            Deterministic candidate synthesis active for hackathon demonstration.
          </div>
        </div>
      </div>
    </div>
  );
};
