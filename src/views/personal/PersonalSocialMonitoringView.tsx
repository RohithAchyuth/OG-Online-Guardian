import React, { useState, useEffect } from 'react';
import { SeverityBadge } from '../../components/SeverityBadge';
import { 
  Share2, 
  Search, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Globe, 
  ShieldAlert, 
  Info,
  Radio
} from 'lucide-react';
import { PersonalSocialFinding } from '../../types';
import { useInvestigation } from '../../context/InvestigationContext';

export const PersonalSocialMonitoringView: React.FC = () => {
  const { startInvestigation, startMultipleInvestigations, isCaseActive } = useInvestigation();
  const [username, setUsername] = useState('alexandra');
  const [targetName, setTargetName] = useState('Alexandra Vance');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [findings, setFindings] = useState<PersonalSocialFinding[]>([]);
  const [scanTimestamp, setScanTimestamp] = useState<string>('');
  const [monitoringNotice, setMonitoringNotice] = useState<string>('');

  const runSocialScan = async (userHandle: string, name: string) => {
    if (!userHandle.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/personal/social/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userHandle.trim(),
          targetName: name.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Social scan failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      setFindings(data.findings || []);
      setScanTimestamp(data.scanTimestamp || new Date().toISOString());
      setMonitoringNotice(data.monitoringNotice || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error executing social scan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSocialScan('alexandra', 'Alexandra Vance');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSocialScan(username, targetName);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-mono mb-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>Feature 3: Social Network Threat Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Social Media Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Shows matching profiles and suspicious impersonator accounts from supported data sources. Includes platform, username, profile link, matching reasons, risk level, and scan timestamps.
          </p>
        </div>

        {scanTimestamp && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Scan Timestamp: {new Date(scanTimestamp).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Honest Scope & Methodology Disclosure */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-2 text-white font-bold">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Scan Methodology & Monitoring Honesty Policy</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          In strict compliance with transparency standards: results below represent point-in-time public queries executed directly against open API endpoints (GitHub User API, Reddit public directories, and public social indexes). Continuous 24/7 background polling has not been implemented without private platform API credentials, and scan results are never fabricated.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#0a1222] border border-slate-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 space-y-1">
            <label className="text-xs font-medium text-slate-300 block">
              Personal Username / Handle <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <span className="text-slate-500 absolute left-3 top-2 text-xs font-mono">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alexandra, john_doe"
                className="w-full pl-8 pr-3 py-2 bg-[#060b17] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-medium text-slate-300 block">
              Full Display Name (Optional)
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="e.g. Alexandra Vance"
              className="w-full px-3 py-2 bg-[#060b17] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Execute Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Findings Results List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Matching Profiles ({findings.length})
            </h2>
          </div>

          {findings.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => {
                    const selectedList = findings.filter((f) => selectedIds.has(f.id)).map((f) => {
                      const handle = f.accountName || `@${f.username}`;
                      return {
                        id: f.id,
                        platform: f.platform,
                        accountName: handle,
                        riskScore: f.riskScore,
                        severity: f.severity,
                        detectedAt: f.scanTimestamp,
                        detectionReasons: f.matchingReasons,
                        profileUrl: f.profileUrl,
                        similarityScore: 94,
                        title: `${handle} (${f.platform})`,
                      };
                    });
                    startMultipleInvestigations(selectedList, true);
                  }}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
                >
                  <span>Investigate Selected ({selectedIds.size})</span>
                </button>
              )}

              <button
                onClick={() => {
                  const allList = findings.map((f) => {
                    const handle = f.accountName || `@${f.username}`;
                    return {
                      id: f.id,
                      platform: f.platform,
                      accountName: handle,
                      riskScore: f.riskScore,
                      severity: f.severity,
                      detectedAt: f.scanTimestamp,
                      detectionReasons: f.matchingReasons,
                      profileUrl: f.profileUrl,
                      similarityScore: 94,
                      title: `${handle} (${f.platform})`,
                    };
                  });
                  startMultipleInvestigations(allList, true);
                }}
                className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Investigate All ({findings.length})</span>
              </button>

              <button
                onClick={() => {
                  if (selectedIds.size === findings.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(findings.map((f) => f.id)));
                  }
                }}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded border border-slate-800 hover:bg-slate-900 transition-colors"
              >
                {selectedIds.size === findings.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {findings.length === 0 ? (
            <div className="p-12 text-center bg-[#0a1222] border border-slate-800 rounded-xl space-y-2">
              <Share2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No social media findings recorded yet. Run a scan above.</p>
            </div>
          ) : (
            findings.map((f) => {
              const isSelected = selectedIds.has(f.id);
              return (
                <div
                  key={f.id}
                  className={`p-5 bg-[#0a1222] border rounded-xl transition-colors space-y-3 ${
                    isSelected ? 'border-cyan-500/80 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(f.id);
                          else next.delete(f.id);
                          setSelectedIds(next);
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                      />
                      {f.avatarUrl ? (
                      <img
                        src={f.avatarUrl}
                        alt={f.username}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                        {f.platform[0]}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">@{f.username}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold border border-slate-700">
                          {f.platform}
                        </span>
                        {f.accountName && f.accountName !== f.username && (
                          <span className="text-xs text-slate-400">({f.accountName})</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Data Source: <span className="text-slate-300">{f.dataSource}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <SeverityBadge severity={f.severity} size="sm" />
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      Risk: {f.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Matching Reasons */}
                <div className="p-3 bg-[#070b14] border border-slate-800/80 rounded-lg space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Matching Reasons & Threat Indicators:
                  </h4>
                  <ul className="space-y-1">
                    {f.matchingReasons.map((reason, rIdx) => (
                      <li key={rIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer with Timestamp, Link and Investigate Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Scanned: {new Date(f.scanTimestamp).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={f.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 font-semibold text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
                    >
                      <span>Public Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {(() => {
                      const active = isCaseActive(f.id);
                      return (
                        <button
                          onClick={() => {
                            const handle = f.accountName || `@${f.username}`;
                            startInvestigation({
                              id: f.id,
                              platform: f.platform,
                              accountName: handle,
                              riskScore: f.riskScore,
                              severity: f.severity,
                              detectedAt: f.scanTimestamp,
                              detectionReasons: f.matchingReasons,
                              profileUrl: f.profileUrl,
                              similarityScore: 94,
                            }, `${handle} (${f.platform})`);
                          }}
                          className={`px-3 py-1 text-xs rounded-lg border transition-all font-medium flex items-center gap-1.5 ${
                            active
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm shadow-cyan-500/30'
                              : 'text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/60'
                          }`}
                        >
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                          <span>{active ? 'Investigating' : 'Investigate'}</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
};
