import React, { useState, useEffect } from 'react';
import { SeverityBadge } from '../../components/SeverityBadge';
import { 
  UserCheck, 
  Search, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw,
  Globe,
  Hash,
  Link as LinkIcon,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { LookalikeVariation, DiscoveredProfile } from '../../types';
import { useInvestigation } from '../../context/InvestigationContext';

export const PersonalLookalikeView: React.FC = () => {
  const [input, setInput] = useState('alexandra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'both' | 'discovered' | 'variations'>('both');
  
  const { startInvestigation, startMultipleInvestigations, isCaseActive } = useInvestigation();
  
  const [variations, setVariations] = useState<LookalikeVariation[]>([]);
  const [discoveredProfiles, setDiscoveredProfiles] = useState<DiscoveredProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [scanTimestamp, setScanTimestamp] = useState<string>('');

  const analyzeLookalikes = async (searchTarget: string) => {
    if (!searchTarget.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/personal/lookalike/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: searchTarget.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Look-alike scan failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      setVariations(data.generatedVariations || []);
      setDiscoveredProfiles(data.discoveredProfiles || []);
      setScanTimestamp(data.scannedAt || new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing look-alikes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeLookalikes('alexandra');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeLookalikes(input);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-sky-950/70 border border-sky-800/60 text-sky-300 text-xs font-mono mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Feature 2: Name & Identity Homoglyph Defense</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Look-alike Name Detection
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accepts personal names, handles, or profile URLs. Detects permutations with character substitutions, dots, and numbers, clearly separating generated suggestions from live discovered profiles.
          </p>
        </div>

        {scanTimestamp && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan Time: {new Date(scanTimestamp).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#0a1222] border border-slate-800 rounded-xl space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 block">
            Target Name, Handle, or Profile URL <span className="text-cyan-400">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. alexandra, @john_doe, or https://x.com/alexandra"
                className="w-full pl-9 pr-3 py-2 bg-[#060b17] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Platforms...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze Variations & Probes</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-mono">
          Accepts plain names, social handles (with/without @), or full HTTP profile URLs.
        </p>
      </form>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Critical Separation Notice Banner */}
      <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-xl text-xs text-sky-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">
            Algorithmic Suggestions vs. Discovered Public Profiles
          </p>
          <p className="text-[11px] text-sky-300/90 leading-relaxed">
            Per strict security guidelines, generated look-alike permutations are purely calculated mathematical suggestions. In contrast, discovered profiles represent live public account registrations verified through real platform probes.
          </p>
        </div>
      </div>

      {/* View Filter Switch */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('both')}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === 'both'
              ? 'bg-slate-800 border-slate-700 text-white font-bold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          View All ({discoveredProfiles.length} Discovered, {variations.length} Variations)
        </button>
        <button
          onClick={() => setActiveTab('discovered')}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
            activeTab === 'discovered'
              ? 'bg-red-950/70 border-red-800 text-red-200 font-bold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Discovered Live Profiles ({discoveredProfiles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('variations')}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
            activeTab === 'variations'
              ? 'bg-cyan-950/70 border-cyan-800 text-cyan-200 font-bold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Generated Suggestions ({variations.length})</span>
        </button>
      </div>

      {/* SECTION 1: DISCOVERED ACTUAL PROFILES */}
      {(activeTab === 'both' || activeTab === 'discovered') && (
        <div className="p-6 bg-[#0a1222] border border-red-950/60 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Discovered Profiles (Live Platform Probes)
              </h2>
              <span className="text-[11px] font-mono text-red-400 font-semibold bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60 ml-1">
                {discoveredProfiles.length} located
              </span>
            </div>

            {discoveredProfiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedProfiles.size > 0 && (
                  <button
                    onClick={() => {
                      const selectedList = discoveredProfiles.filter((p) =>
                        selectedProfiles.has(`${p.platform}-${p.username}`)
                      ).map((p) => ({
                        id: `${p.platform}-${p.username}`,
                        platform: p.platform,
                        accountName: `@${p.username}`,
                        riskScore: p.severity === 'CRITICAL' ? 95 : p.severity === 'HIGH' ? 88 : 70,
                        severity: p.severity,
                        detectedAt: p.scannedAt,
                        detectionReasons: p.reasons,
                        profileUrl: p.profileUrl,
                        similarityScore: 92,
                        title: `@${p.username} (${p.platform})`,
                      }));
                      startMultipleInvestigations(selectedList, true);
                    }}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
                  >
                    <span>Investigate Selected ({selectedProfiles.size})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const allList = discoveredProfiles.map((p) => ({
                      id: `${p.platform}-${p.username}`,
                      platform: p.platform,
                      accountName: `@${p.username}`,
                      riskScore: p.severity === 'CRITICAL' ? 95 : p.severity === 'HIGH' ? 88 : 70,
                      severity: p.severity,
                      detectedAt: p.scannedAt,
                      detectionReasons: p.reasons,
                      profileUrl: p.profileUrl,
                      similarityScore: 92,
                      title: `@${p.username} (${p.platform})`,
                    }));
                    startMultipleInvestigations(allList, true);
                  }}
                  className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Investigate All ({discoveredProfiles.length})</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedProfiles.size === discoveredProfiles.length) {
                      setSelectedProfiles(new Set());
                    } else {
                      setSelectedProfiles(new Set(discoveredProfiles.map((p) => `${p.platform}-${p.username}`)));
                    }
                  }}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded border border-slate-800 hover:bg-slate-900 transition-colors"
                >
                  {selectedProfiles.size === discoveredProfiles.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            These accounts have been discovered on active public platforms using safe live network probes. They represent actual potential impersonation threats or registered usernames matching your identity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveredProfiles.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-[#070b14] border border-slate-800 rounded-lg text-xs text-slate-400">
                No active matching accounts discovered across probed public platform directories.
              </div>
            ) : (
              discoveredProfiles.map((p, idx) => {
                const profileId = `${p.platform}-${p.username}`;
                const isSelected = selectedProfiles.has(profileId);
                return (
                  <div
                    key={idx}
                    className={`p-4 bg-[#070b14] border rounded-xl transition-colors space-y-3 ${
                      isSelected ? 'border-cyan-500/80 bg-cyan-950/20' : 'border-slate-800/90 hover:border-red-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selectedProfiles);
                            if (e.target.checked) next.add(profileId);
                            else next.delete(profileId);
                            setSelectedProfiles(next);
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                        />
                        {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
                          {p.username[0]?.toUpperCase() || '@'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">@{p.username}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {p.platform}
                          </span>
                        </div>
                        <p className="text-[11px] text-red-400 font-medium">{p.matchedPattern}</p>
                      </div>
                    </div>

                    <SeverityBadge severity={p.severity} size="sm" />
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    {p.reasons.map((r, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      Probed: {new Date(p.scannedAt).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={p.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 font-semibold text-[11px] px-2 py-1 rounded hover:bg-white/5 transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {(() => {
                        const profileId = `${p.platform}-${p.username}`;
                        const active = isCaseActive(profileId);
                        return (
                          <button
                            onClick={() => {
                              startInvestigation({
                                id: profileId,
                                platform: p.platform,
                                accountName: `@${p.username}`,
                                riskScore: p.severity === 'CRITICAL' ? 95 : p.severity === 'HIGH' ? 88 : 70,
                                severity: p.severity,
                                detectedAt: p.scannedAt,
                                detectionReasons: p.reasons,
                                profileUrl: p.profileUrl,
                                similarityScore: 92,
                              }, `@${p.username} (${p.platform})`);
                            }}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-all font-medium flex items-center gap-1.5 ${
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
      )}

      {/* SECTION 2: GENERATED ALGORITHMIC VARIATIONS */}
      {(activeTab === 'both' || activeTab === 'variations') && (
        <div className="p-6 bg-[#0a1222] border border-cyan-950/60 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Algorithmic Look-alike Variations (Generated Suggestions)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900/60">
              {variations.length} calculated variations
            </span>
          </div>

          <p className="text-xs text-slate-400">
            These are calculated look-alike candidates generated by the typosquatting engine using homoglyphic substitutions (e.g. 0 for o, 1 for l), separator insertions (dots, underscores), numbers, and deceptive modifiers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {variations.length === 0 ? (
              <div className="col-span-3 p-8 text-center bg-[#070b14] border border-slate-800 rounded-lg text-xs text-slate-400">
                No variations generated. Please enter a valid name or handle above.
              </div>
            ) : (
              variations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#070b14] border border-slate-800 rounded-lg hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white truncate max-w-[150px]">
                      {v.variation}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                        v.riskLevel === 'HIGH'
                          ? 'bg-red-950 text-red-300 border border-red-800/50'
                          : v.riskLevel === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {v.riskLevel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {v.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="capitalize">{v.type.replace('_', ' ')}</span>
                    <button
                      onClick={() => analyzeLookalikes(v.variation)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Probe Variant →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
