import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { AppFinding, AppPlatform, Severity, InvestigationStatus } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useInvestigation } from '../context/InvestigationContext';
import { 
  Smartphone, 
  Search, 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  ExternalLink,
  ShieldAlert,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AppMonitoringViewProps {
  onOpenFinding: (finding: AppFinding) => void;
}

export const AppMonitoringView: React.FC<AppMonitoringViewProps> = ({ onOpenFinding }) => {
  const { t } = useLanguage();
  const { isCaseActive, startInvestigation, startMultipleInvestigations } = useInvestigation();
  const { 
    appFindings, 
    scanApps, 
    isScanningApps, 
    lastScanTimestamp, 
    addCustomAppCandidate 
  } = useBrand();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Manual Candidate App Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPublisher, setNewAppPublisher] = useState('');
  const [newAppPackageId, setNewAppPackageId] = useState('');
  const [newAppPlatform, setNewAppPlatform] = useState<AppPlatform>('ANDROID');

  const filteredFindings = useMemo(() => {
    return appFindings.filter((finding) => {
      if (platformFilter !== 'ALL' && finding.platform !== platformFilter) return false;
      if (severityFilter !== 'ALL' && finding.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && finding.status !== statusFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchName = finding.appName.toLowerCase().includes(q);
        const matchPkg = finding.packageOrBundleId.toLowerCase().includes(q);
        const matchPub = finding.publisherName.toLowerCase().includes(q);
        if (!matchName && !matchPkg && !matchPub) return false;
      }
      return true;
    });
  }, [appFindings, platformFilter, severityFilter, statusFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredFindings.length / pageSize));
  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFindings.slice(start, start + pageSize);
  }, [filteredFindings, currentPage, pageSize]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppPackageId.trim()) return;

    const created = addCustomAppCandidate(
      newAppName.trim(),
      newAppPublisher.trim() || 'Unknown Developer Studio',
      newAppPackageId.trim(),
      newAppPlatform
    );

    setIsAddModalOpen(false);
    setNewAppName('');
    setNewAppPublisher('');
    setNewAppPackageId('');
    onOpenFinding(created);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <span>{t.navAppMonitoring}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detect rogue Android and iOS applications masquerading under brand trademarks or bundle identifiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.appAddCandidateBtn}</span>
          </button>

          <button
            onClick={() => scanApps()}
            disabled={isScanningApps}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningApps ? 'animate-spin' : ''}`} />
            <span>{isScanningApps ? t.appScanningProgress : t.appScanNowBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#091122] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.appSearchPlaceholder}
            className="w-full pl-9 pr-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* OS Platform */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2.5 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">{t.appFilterOS}</option>
            <option value="ANDROID">Google Play (Android)</option>
            <option value="IOS">Apple App Store (iOS)</option>
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
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
            className="px-2.5 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
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
      <div className="p-5 bg-[#091122] border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Tracking {filteredFindings.length} suspicious application store packages</span>
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
                <th className="py-3 px-3">{t.appColAppName}</th>
                <th className="py-3 px-3">{t.appColPlatform}</th>
                <th className="py-3 px-3">{t.appColPackageId}</th>
                <th className="py-3 px-3">{t.appColPublisher}</th>
                <th className="py-3 px-3">{t.appColRiskScore}</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">{t.appColStatus}</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No application packages match the specified filter criteria.
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
                        {finding.appName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {finding.similarityScore}% brand title match
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">
                      {finding.platform}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-rose-300">
                      {finding.packageOrBundleId}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div className="font-medium">{finding.publisherName}</div>
                      {finding.publisherMismatch && (
                        <span className="text-[10px] text-amber-400 block font-mono">
                          Unauthorized Dev
                        </span>
                      )}
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

      {/* Manual App Submission Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c1424] border border-cyan-900/60 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Test Custom Mobile Application Candidate</h3>
            <p className="text-xs text-slate-400">
              Submit any mobile app title and package identifier (e.g. <code>com.novapay.freecash</code>) to evaluate risk scoring against official brand apps.
            </p>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Store Platform</label>
                  <select
                    value={newAppPlatform}
                    onChange={(e) => setNewAppPlatform(e.target.value as AppPlatform)}
                    className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                  >
                    <option value="ANDROID">Google Play (Android)</option>
                    <option value="IOS">Apple App Store (iOS)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Application Title</label>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="NovaPay Fast Wallet"
                    className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Package ID / Bundle Identifier</label>
                <input
                  type="text"
                  required
                  value={newAppPackageId}
                  onChange={(e) => setNewAppPackageId(e.target.value)}
                  placeholder="com.novapay.rewards.app"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Publisher / Developer Entity</label>
                <input
                  type="text"
                  value={newAppPublisher}
                  onChange={(e) => setNewAppPublisher(e.target.value)}
                  placeholder="ShadowTech Mobile LLC"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                />
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
                  Evaluate App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
