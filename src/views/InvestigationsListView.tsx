import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { SocialFinding, AppFinding, InvestigationStatus, Severity } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useInvestigation } from '../context/InvestigationContext';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface InvestigationsListViewProps {
  onOpenFinding: (finding: SocialFinding | AppFinding) => void;
}

export const InvestigationsListView: React.FC<InvestigationsListViewProps> = ({ onOpenFinding }) => {
  const { t } = useLanguage();
  const { isCaseActive, startInvestigation, startMultipleInvestigations } = useInvestigation();
  const { socialFindings, appFindings, brand } = useBrand();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SOCIAL' | 'APP'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const allCases = useMemo(() => [
    ...socialFindings.map(s => ({ ...s, caseCategory: 'SOCIAL' as const, name: s.accountName, idStr: `@${s.username}` })),
    ...appFindings.map(a => ({ ...a, caseCategory: 'APP' as const, name: a.appName, idStr: a.packageOrBundleId })),
  ], [socialFindings, appFindings]);

  const filteredCases = useMemo(() => {
    return allCases.filter((item) => {
      if (categoryFilter !== 'ALL' && item.caseCategory !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.idStr.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allCases, categoryFilter, statusFilter, severityFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  const openCases = useMemo(() => allCases.filter(c => c.status === 'NEW' || c.status === 'UNDER_REVIEW').length, [allCases]);
  const confirmedCount = useMemo(() => allCases.filter(c => c.status === 'CONFIRMED_SUSPICIOUS').length, [allCases]);
  const falsePositives = useMemo(() => allCases.filter(c => c.status === 'FALSE_POSITIVE').length, [allCases]);
  const fpRate = allCases.length > 0 ? Math.round((falsePositives / allCases.length) * 100) : 0;

  return (
    <div className="space-y-6 layer-1">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-cyan-400" />
          <span>{t.navThreatInvestigations}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Active threat docket for review, evidence gathering, false positive whitelisting, and remediation workflows.
        </p>
      </div>

      {/* Case Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 layer-2">
        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Open Cases</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">{openCases}</div>
          <p className="text-[11px] text-slate-400">Requires review</p>
        </div>

        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Confirmed Malicious</span>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{confirmedCount}</div>
          <p className="text-[11px] text-slate-400">Takedown queue</p>
        </div>

        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-3">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">False Positives</span>
          <div className="text-2xl font-bold font-mono text-slate-300 tabular-nums">{falsePositives}</div>
          <p className="text-[11px] text-slate-400">Filtered benign</p>
        </div>

        <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Resolution Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {allCases.length > 0 ? Math.round(((allCases.length - openCases) / allCases.length) * 100) : 100}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">{fpRate}% FP Suppressed</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 glass-panel rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs layer-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active cases by suspect name, handle, or package..."
            className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | 'SOCIAL' | 'APP')}
            className="px-3 py-2 glass-select rounded-xl text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Threat Domains</option>
            <option value="SOCIAL">Social Media Only</option>
            <option value="APP">Mobile Apps Only</option>
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 glass-select rounded-xl text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
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
            <option value="ALL">All Statuses</option>
            <option value="NEW">{t.statusNew}</option>
            <option value="UNDER_REVIEW">{t.statusUnderReview}</option>
            <option value="CONFIRMED_SUSPICIOUS">{t.statusConfirmedSuspicious}</option>
            <option value="FALSE_POSITIVE">{t.statusFalsePositive}</option>
            <option value="RESOLVED">{t.statusResolved}</option>
          </select>
        </div>
      </div>

      {/* Case Dossier Table */}
      <div className="p-5 glass-panel rounded-2xl space-y-4 layer-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>{filteredCases.length} Investigation Cases Listed</span>
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
                  const selectedList = filteredCases.filter((c) => selectedIds.has(c.id));
                  startMultipleInvestigations(selectedList, true);
                }}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
              >
                <span>Investigate Selected ({selectedIds.size})</span>
              </button>
            )}

            {filteredCases.length > 0 && (
              <button
                onClick={() => {
                  startMultipleInvestigations(filteredCases, true);
                }}
                className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Investigate All ({filteredCases.length})</span>
              </button>
            )}

            <span>Target Brand: {brand.brandName}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={paginatedCases.length > 0 && paginatedCases.every((c) => selectedIds.has(c.id))}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) {
                        paginatedCases.forEach((c) => next.add(c.id));
                      } else {
                        paginatedCases.forEach((c) => next.delete(c.id));
                      }
                      setSelectedIds(next);
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Candidate Threat</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No investigation cases match the active filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c) => (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedIds.has(c.id) ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(c.id);
                          else next.delete(c.id);
                          setSelectedIds(next);
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-400">
                      CASE-{c.id.substring(0, 11)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{c.idStr}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {c.platform}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {c.caseCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-white">
                      {c.riskScore}/100
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={c.severity} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {(() => {
                        const active = isCaseActive(c.id);
                        return (
                          <button
                            onClick={() => {
                              startInvestigation(c as unknown as SocialFinding | AppFinding);
                              onOpenFinding(c as unknown as SocialFinding | AppFinding);
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
        {filteredCases.length > pageSize && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/70 text-xs text-slate-400">
            <div>
              Showing {Math.min(filteredCases.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredCases.length, currentPage * pageSize)} of {filteredCases.length}
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
    </div>
  );
};
