import React, { useState, useEffect } from 'react';
import { SeverityBadge } from '../../components/SeverityBadge';
import { 
  Smartphone, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw,
  Info,
  Layers,
  Star,
  Tag
} from 'lucide-react';
import { PersonalAppCandidate } from '../../types';
import { useInvestigation } from '../../context/InvestigationContext';
import { novaPayLogoImg } from '../../assets/images';

export const PersonalAppMonitoringView: React.FC = () => {
  const { startInvestigation, startMultipleInvestigations, isCaseActive } = useInvestigation();
  const [query, setQuery] = useState('Authenticator');
  const [developer, setDeveloper] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apps, setApps] = useState<PersonalAppCandidate[]>([]);
  const [selectedApp, setSelectedApp] = useState<PersonalAppCandidate | null>(null);
  const [filter, setFilter] = useState<'all' | 'copies' | 'authentic'>('all');
  const [meta, setMeta] = useState<{ total: number; copies: number; dataSource: string; scannedAt: string } | null>(null);

  const fetchApps = async (searchQuery: string, searchDev: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        ...(searchDev.trim() ? { developer: searchDev.trim() } : {}),
      });

      const res = await fetch(`/api/personal/apps/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch app store listings (HTTP ${res.status})`);
      }

      const data = await res.json();
      setApps(data.apps || []);
      setMeta({
        total: data.totalFound || 0,
        copies: data.potentialCopiesCount || 0,
        dataSource: data.dataSource || 'Apple App Store Live Search API',
        scannedAt: data.scannedAt || new Date().toISOString(),
      });
      if (data.apps && data.apps.length > 0) {
        setSelectedApp(data.apps[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error querying App Store');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps('Authenticator', '');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApps(query, developer);
  };

  const filteredApps = apps.filter((app) => {
    if (filter === 'copies') return app.isPotentialCopy;
    if (filter === 'authentic') return !app.isPotentialCopy;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Feature 1: App Store Threat Defense</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            App Store Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search live mobile stores for your apps and developer entities. Identify copycats, title spoofers, and unauthorized developer mismatches with algorithmic explanations.
          </p>
        </div>

        {meta && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500">Source:</span> <span className="text-cyan-400">{meta.dataSource}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500">Flagged Copies:</span> <span className="text-red-400 font-bold">{meta.copies}</span>
            </div>
          </div>
        )}
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="p-4 bg-[#0a1222] border border-slate-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 space-y-1">
            <label className="text-xs font-medium text-slate-300 block">
              App Name / Brand Title <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Authenticator, CyberWallet, Vance..."
                className="w-full pl-9 pr-3 py-2 bg-[#060b17] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-medium text-slate-300 block">
              Authorized Developer Entity (Optional)
            </label>
            <input
              type="text"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              placeholder="e.g. Google LLC, Acme Studios..."
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
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Scan Store</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real Data Provenance Note */}
        <p className="text-[11px] text-slate-400 font-mono">
          Live Real Integration: Queries Apple App Store via iTunes Search API in real-time.
        </p>
      </form>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Matching Apps ({apps.length})
          </button>
          <button
            onClick={() => setFilter('copies')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              filter === 'copies' ? 'bg-red-950/80 text-red-300 font-bold border border-red-800/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>Potential Copies ({apps.filter(a => a.isPotentialCopy).length})</span>
          </button>
          <button
            onClick={() => setFilter('authentic')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              filter === 'authentic' ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Authentic ({apps.filter(a => !a.isPotentialCopy).length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {apps.filter(a => a.isPotentialCopy).length > 0 && (
            <button
              onClick={() => {
                const copies = apps.filter(a => a.isPotentialCopy).map(app => ({
                  id: app.id,
                  appName: app.appName,
                  publisherName: app.developerName,
                  packageOrBundleId: app.bundleId,
                  riskScore: app.copyRiskScore,
                  severity: app.copyRiskScore >= 70 ? 'CRITICAL' : 'HIGH',
                  detectedAt: new Date().toISOString(),
                  detectionReasons: app.detectionReasons,
                  storeUrl: app.storeUrl,
                  similarityScore: app.copyRiskScore,
                  title: `${app.appName} (${app.bundleId})`,
                }));
                startMultipleInvestigations(copies, true);
              }}
              className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Investigate All Flagged Copies ({apps.filter(a => a.isPotentialCopy).length})</span>
            </button>
          )}

          <span className="text-[11px] font-mono text-slate-500">
            Showing {filteredApps.length} entries
          </span>
        </div>
      </div>

      {/* Two Column Layout: List on Left, Detail Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Apps List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredApps.length === 0 ? (
            <div className="p-12 text-center bg-[#0a1222] border border-slate-800 rounded-xl space-y-3">
              <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No applications found matching the current filter.</p>
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'bg-[#0e1930] border-cyan-500/80 ring-1 ring-cyan-500/50 shadow-md'
                      : app.isPotentialCopy
                      ? 'bg-[#0a1222] border-red-900/40 hover:border-red-700/60'
                      : 'bg-[#0a1222] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Icon */}
                  <img
                    src={app.iconUrl || novaPayLogoImg}
                    alt={app.appName}
                    width={48}
                    height={48}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-900 border border-slate-800"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-white truncate">{app.appName}</h3>
                      {app.isPotentialCopy ? (
                        <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-red-300 font-mono text-[10px] font-bold shrink-0 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span>Flagged Copy ({app.copyRiskScore}%)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-mono text-[10px] font-bold shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Authentic</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      Developer: <span className="text-slate-200 font-medium">{app.developerName}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono text-slate-500">
                      <div className="flex items-center gap-2">
                        <span>{app.bundleId}</span>
                        {app.rating !== undefined && (
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {app.rating.toFixed(1)}
                          </span>
                        )}
                        <span>{app.price}</span>
                      </div>

                      {app.isPotentialCopy && (() => {
                        const active = isCaseActive(app.id);
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startInvestigation({
                                id: app.id,
                                appName: app.appName,
                                publisherName: app.developerName,
                                packageOrBundleId: app.bundleId,
                                riskScore: app.copyRiskScore,
                                severity: app.copyRiskScore >= 70 ? 'CRITICAL' : 'HIGH',
                                detectedAt: new Date().toISOString(),
                                detectionReasons: app.detectionReasons,
                                storeUrl: app.storeUrl,
                                similarityScore: app.copyRiskScore,
                              }, `${app.appName} (${app.bundleId})`);
                            }}
                            className={`px-2 py-0.5 text-[11px] rounded border transition-all font-sans font-medium flex items-center gap-1 ${
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

        {/* Selected App Detail & Explanations Panel */}
        <div className="lg:col-span-5">
          {selectedApp ? (
            <div className="p-6 bg-[#0a1222] border border-slate-800 rounded-xl space-y-5 sticky top-6">
              <div className="flex items-start gap-4">
                <img
                  src={selectedApp.iconUrl || novaPayLogoImg}
                  alt={selectedApp.appName}
                  width={64}
                  height={64}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-slate-900 border border-slate-800 shadow"
                />
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {selectedApp.appName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    By <span className="text-slate-200 font-medium">{selectedApp.developerName}</span>
                  </p>
                  <div className="pt-1">
                    {selectedApp.isPotentialCopy ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-950/80 border border-red-700 text-red-300 text-xs font-mono font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Potential Copy Detected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Legitimate Application</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Copy Risk & Explanation Breakdown */}
              <div className="p-4 bg-[#070b14] border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Algorithmic Risk Assessment</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    Score: {selectedApp.copyRiskScore}/100
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedApp.copyRiskScore >= 70
                        ? 'bg-red-500'
                        : selectedApp.copyRiskScore >= 40
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${selectedApp.copyRiskScore}%` }}
                  />
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                    Analysis Explanation
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedApp.explanation}
                  </p>
                </div>

                {selectedApp.detectionReasons.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Specific Detection Reasons
                    </h4>
                    <ul className="space-y-1">
                      {selectedApp.detectionReasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Technical Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-mono text-[11px]">Bundle ID:</span>
                  <span className="font-mono text-slate-200 text-[11px]">{selectedApp.bundleId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-mono text-[11px]">Category:</span>
                  <span className="text-slate-200">{selectedApp.primaryGenreName || 'General'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-mono text-[11px]">Pricing:</span>
                  <span className="text-slate-200">{selectedApp.price}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-mono text-[11px]">Data Source:</span>
                  <span className="text-cyan-400 font-mono text-[11px]">Apple App Store Live</span>
                </div>
              </div>

              {/* Investigation Trigger & Store Actions */}
              <div className="space-y-2 pt-2">
                {(() => {
                  const active = isCaseActive(selectedApp.id);
                  return (
                    <button
                      onClick={() => {
                        startInvestigation({
                          id: selectedApp.id,
                          appName: selectedApp.appName,
                          publisherName: selectedApp.developerName,
                          packageOrBundleId: selectedApp.bundleId,
                          riskScore: selectedApp.copyRiskScore,
                          severity: selectedApp.copyRiskScore >= 70 ? 'CRITICAL' : 'HIGH',
                          detectedAt: new Date().toISOString(),
                          detectionReasons: selectedApp.detectionReasons,
                          storeUrl: selectedApp.storeUrl,
                          similarityScore: selectedApp.copyRiskScore,
                        }, `${selectedApp.appName} (${selectedApp.bundleId})`);
                      }}
                      className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border shadow-md ${
                        active
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/30'
                          : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-700/60 text-cyan-300'
                      }`}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{active ? 'Investigating Case' : 'Investigate Unauthorized App'}</span>
                    </button>
                  );
                })()}

                {selectedApp.storeUrl && (
                  <a
                    href={selectedApp.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <span>View Official Listing on App Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0a1222] border border-slate-800 rounded-xl text-xs text-slate-400">
              Select an application on the left to review its risk breakdown and algorithmic explanation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
