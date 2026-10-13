import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { SocialFinding, SocialPlatform, Severity, InvestigationStatus } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useInvestigation } from '../context/InvestigationContext';
import { 
  Share2, 
  Search, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Filter, 
  AlertCircle,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SocialMonitoringViewProps {
  onOpenFinding: (finding: SocialFinding) => void;
}

export const SocialMonitoringView: React.FC<SocialMonitoringViewProps> = ({ onOpenFinding }) => {
  const { t } = useLanguage();
  const { isCaseActive, startInvestigation, startMultipleInvestigations } = useInvestigation();
  const { 
    socialFindings, 
    scanSocials, 
    isScanningSocial, 
    lastScanTimestamp, 
    addCustomSocialCandidate 
  } = useBrand();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Manual Ingestion Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateHandle, setNewCandidateHandle] = useState('');
  const [newCandidatePlatform, setNewCandidatePlatform] = useState<SocialPlatform>('X');

  const filteredFindings = useMemo(() => {
    return socialFindings.filter((finding) => {
      if (platformFilter !== 'ALL' && finding.platform !== platformFilter) return false;
      if (severityFilter !== 'ALL' && finding.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && finding.status !== statusFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchName = finding.accountName.toLowerCase().includes(q);
        const matchUser = finding.username.toLowerCase().includes(q);
        const matchInd = finding.suspiciousIndicators.some(i => i.toLowerCase().includes(q));
        if (!matchName && !matchUser && !matchInd) return false;
      }
      return true;
    });
  }, [socialFindings, platformFilter, severityFilter, statusFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredFindings.length / pageSize));
  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFindings.slice(start, start + pageSize);
  }, [filteredFindings, currentPage, pageSize]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateName.trim() || !newCandidateHandle.trim()) return;

    const created = addCustomSocialCandidate(
      newCandidateName.trim(),
      newCandidateHandle.trim().replace(/^@/, ''),
      newCandidatePlatform
    );

    setIsAddModalOpen(false);
    setNewCandidateName('');
    setNewCandidateHandle('');
    onOpenFinding(created);
  };

  return (
    <div className="space-y-6 layer-1">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>{t.navSocialMonitoring}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconnaissance across social platforms for impersonating profiles, deceptive support handles, and brand phishers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 glass-button rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.socialAddCandidateBtn}</span>
          </button>

          <button
            onClick={() => scanSocials()}
            disabled={isScanningSocial}
            className="flex items-center gap-2 px-4 py-2 glass-button-primary disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/25"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningSocial ? 'animate-spin' : ''}`} />
            <span>{isScanningSocial ? t.socialScanningProgress : t.socialScanNowBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 glass-panel rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs layer-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.socialSearchPlaceholder}
            className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 glass-select rounded-xl text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t.socialFilterPlatform}</option>
            <option value="X">X (Twitter)</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="TIKTOK">TikTok</option>
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 glass-select rounded-xl text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t.socialFilterSeverity}</option>
            <option value="CRITICAL">{t.severityCritical}</option>
            <option value="HIGH">{t.severityHigh}</option>
            <option value="MEDIUM">{t.severityMedium}</option>
            <option value="LOW">{t.severityLow}</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 glass-select rounded-xl text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t.socialFilterStatus}</option>
            <option value="NEW">{t.statusNew}</option>
            <option value="UNDER_REVIEW">{t.statusUnderReview}</option>
            <option value="CONFIRMED_SUSPICIOUS">{t.statusConfirmedSuspicious}</option>
            <option value="FALSE_POSITIVE">{t.statusFalsePositive}</option>
            <option value="RESOLVED">{t.statusResolved}</option>
          </select>
        </div>
      </div>

      {/* Detections Data Grid */}
      <div className="p-5 glass-panel rounded-2xl space-y-4 layer-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Displaying {filteredFindings.length} detected candidate profiles</span>
            {selectedIds.size > 0 && (
              <span className="font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={() => {
                  const selectedList = filteredFindings.filter((f) => selectedIds.has(f.id));
                  startMultipleInvestigations(selectedList, true);
                }}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
              >
                <span>Investigate Selected ({selectedIds.size})</span>
              </button>
            )}

            {filteredFindings.length > 0 && (
              <button
                onClick={() => {
                  startMultipleInvestigations(filteredFindings, true);
                }}
                className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Investigate All ({filteredFindings.length})</span>
              </button>
            )}

            <span className="font-mono text-slate-500 hidden md:inline">Last Scan: {new Date(lastScanTimestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={paginatedFindings.length > 0 && paginatedFindings.every((f) => selectedIds.has(f.id))}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) {
                        paginatedFindings.forEach((f) => next.add(f.id));
                      } else {
                        paginatedFindings.forEach((f) => next.delete(f.id));
                      }
                      setSelectedIds(next);
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">{t.socialCandidateName}</th>
                <th className="py-3 px-3">{t.socialPlatformCol}</th>
                <th className="py-3 px-3">{t.socialSimilarityCol}</th>
                <th className="py-3 px-3">{t.socialRiskScoreCol}</th>
                <th className="py-3 px-3">{t.socialSeverityCol}</th>
                <th className="py-3 px-3">{t.socialStatusCol}</th>
                <th className="py-3 px-3">Suspicious Red Flags</th>
                <th className="py-3 px-3 text-right">{t.socialActionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No candidates match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedFindings.map((finding) => (
                  <tr 
                    key={finding.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedIds.has(finding.id) ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(finding.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(finding.id);
                          else next.delete(finding.id);
                          setSelectedIds(next);
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">
                        {finding.accountName}
                      </div>
                      <div className="font-mono text-[11px] text-cyan-400">
                        @{finding.username}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {finding.platform}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-200">
                      {finding.similarityScore}%
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-white">
                      {finding.riskScore}/100
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={finding.severity} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={finding.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                      {finding.suspiciousIndicators.join(' · ')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {(() => {
                        const active = isCaseActive(finding.id);
                        return (
                          <button
                            onClick={() => {
                              startInvestigation(finding);
                              onOpenFinding(finding);
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-medium flex items-center gap-1.5 ml-auto ${
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {filteredFindings.length > pageSize && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/70 text-xs text-slate-400">
            <div>
              Showing {Math.min(filteredFindings.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredFindings.length, currentPage * pageSize)} of {filteredFindings.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Candidate Submission Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c1424] border border-cyan-900/60 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Test Custom Social Candidate</h3>
            <p className="text-xs text-slate-400">
              Submit any custom social account handle (e.g. <code>NovaPay_Offers</code> or <code>N0vaPaySupport</code>) to test our real-time scoring algorithm.
            </p>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Account Name</label>
                <input
                  type="text"
                  required
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  placeholder="NovaPay Official Help"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Social Handle</label>
                <input
                  type="text"
                  required
                  value={newCandidateHandle}
                  onChange={(e) => setNewCandidateHandle(e.target.value)}
                  placeholder="NovaPay_RealHelp"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Platform</label>
                <select
                  value={newCandidatePlatform}
                  onChange={(e) => setNewCandidatePlatform(e.target.value as SocialPlatform)}
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                >
                  <option value="X">X (Twitter)</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="TIKTOK">TikTok</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg"
                >
                  Evaluate Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
