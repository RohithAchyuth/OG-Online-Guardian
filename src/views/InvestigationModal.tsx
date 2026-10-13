import React, { useState } from 'react';
import { SocialFinding, AppFinding, InvestigationStatus } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  History,
  Send,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';

interface InvestigationModalProps {
  finding: SocialFinding | AppFinding | null;
  onClose: () => void;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({ finding, onClose }) => {
  const { t } = useLanguage();
  const { 
    brand, 
    updateSocialStatus, 
    updateAppStatus, 
    addSocialNote, 
    addAppNote, 
    auditLogs 
  } = useBrand();

  const { 
    activeCase, 
    activeCases, 
    setActiveCaseId, 
    startInvestigation, 
    stopInvestigation, 
    stopAllInvestigations 
  } = useInvestigation();

  // If a finding was opened directly and isn't yet in activeCases, register it
  React.useEffect(() => {
    if (finding) {
      const findingIdStr = String(finding.id);
      const exists = activeCases.some((c) => c.caseId === findingIdStr);
      if (!exists) {
        startInvestigation(finding, undefined, false);
      }
    }
  }, [finding, activeCases, startInvestigation]);

  const [newNote, setNewNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<InvestigationStatus | null>(null);
  const [applyToAll, setApplyToAll] = useState(false);

  // The active finding displayed in the modal: prefer activeCase.finding, fallback to finding prop
  const currentFinding = activeCase?.finding || finding;

  if (!currentFinding) return null;

  const isSocial = 'platform' in currentFinding && typeof (currentFinding as SocialFinding).accountName === 'string';
  const socialFinding = isSocial ? (currentFinding as SocialFinding) : null;
  const appFinding = !isSocial ? (currentFinding as AppFinding) : null;

  const candidateName = (isSocial ? socialFinding?.accountName : appFinding?.appName) || (currentFinding as any).title || (currentFinding as any).target || 'Suspected Threat Entity';
  const identifier = (isSocial ? `@${socialFinding?.username}` : appFinding?.packageOrBundleId) || (currentFinding as any).target || `@threat-${String(currentFinding.id).substring(0, 8)}`;
  const riskScore = currentFinding.riskScore ?? 85;
  const severity = currentFinding.severity || 'HIGH';
  const detectedDate = currentFinding.detectedAt ? new Date(currentFinding.detectedAt) : new Date();
  const detectionReasons = (currentFinding.detectionReasons && currentFinding.detectionReasons.length > 0)
    ? currentFinding.detectionReasons
    : [{ name: 'Impersonation Indicator', description: (currentFinding as any).detail || 'High-probability unauthorized digital asset mimicry identified.', score: 85 }];
  const similarityScore = currentFinding.similarityScore ?? 88;

  // Audit history for this entity
  const relevantLogs = auditLogs.filter(l => l.entityId === currentFinding.id);

  const handleStatusChange = (status: InvestigationStatus) => {
    if (applyToAll && activeCases.length > 1) {
      // Bulk update across all active investigations
      activeCases.forEach((c) => {
        const item = c.finding;
        const isSocialItem = 'platform' in item && typeof (item as SocialFinding).accountName === 'string';
        if (isSocialItem) {
          updateSocialStatus(item.id, status, `Analyst batch changed status to ${status} across ${activeCases.length} profiles`);
        } else {
          updateAppStatus(item.id, status, `Analyst batch changed status to ${status} across ${activeCases.length} profiles`);
        }
      });
    } else {
      if (isSocial) {
        updateSocialStatus(currentFinding.id, status, `Analyst changed status to ${status}`);
      } else {
        updateAppStatus(currentFinding.id, status, `Analyst changed status to ${status}`);
      }
    }
    setConfirmStatus(null);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    if (isSocial) {
      addSocialNote(currentFinding.id, newNote.trim());
    } else {
      addAppNote(currentFinding.id, newNote.trim());
    }
    setNewNote('');
  };

  const handleCopyEvidence = () => {
    const report = `SENTINELGUARD THREAT INVESTIGATION DOSSIER
===========================================
Case ID: ${currentFinding.id}
Date Detected: ${detectedDate.toUTCString()}
Associated Brand: ${brand.brandName} (${brand.websiteUrl})
Type: ${isSocial ? 'Social Media Impersonation' : 'Mobile Application Hijacking'}

Candidate Name: ${candidateName}
Identifier: ${identifier}
Platform / Store: ${currentFinding.platform || 'Public Digital Asset'}
Risk Score: ${riskScore}/100 [${severity}]
Current Status: ${currentFinding.status || 'UNDER_INVESTIGATION'}

DETECTION FACTORS & EVIDENCE:
-----------------------------
${detectionReasons.map((r: any) => `• ${r.name}: ${r.description} (Score: ${r.score})`).join('\n')}

EVIDENCE SUMMARY:
${currentFinding.evidenceSummary || 'Reconnaissance analysis in progress.'}

ANALYST NOTES:
${currentFinding.analystNotes || 'None recorded.'}

Official Brand Asset for Comparison:
${isSocial ? `Official handle: @${brand.officialSocials[0]?.username}` : `Official package ID: ${brand.officialApps[0]?.packageOrBundleId}`}
===========================================`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-4xl glass-modal rounded-2xl shadow-2xl flex flex-col my-8 max-h-[92vh] overflow-hidden layer-1 border border-cyan-500/30"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shadow-sm shadow-red-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="case-title" className="text-base font-bold text-white">
                  {t.caseInvestigationTitle}: {candidateName}
                </h2>
                <SeverityBadge severity={severity} />
                {activeCases.length > 1 && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-[10px] font-mono font-semibold">
                    <Layers className="w-3 h-3" />
                    <span>{activeCases.length} In Docket</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                CASE-{currentFinding.id} · Discovered {detectedDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Profile Active Investigation Docket (When multiple profiles are investigated) */}
        {activeCases.length > 1 && (
          <div className="bg-[#050c18] border-b border-cyan-950/90 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin flex-1 min-w-0">
              <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold shrink-0 flex items-center gap-1.5 mr-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Active Docket ({activeCases.length}):
              </span>
              {activeCases.map((c) => {
                const isSelected = activeCase?.caseId === c.caseId;
                return (
                  <button
                    key={c.caseId}
                    onClick={() => setActiveCaseId(c.caseId)}
                    className={`group px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm shadow-cyan-500/30'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{c.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-slate-950 text-cyan-300' : 'bg-slate-950/80 text-cyan-400'
                    }`}>
                      {c.riskScore}%
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        stopInvestigation(c.caseId);
                      }}
                      className={`p-0.5 rounded transition-colors ${
                        isSelected ? 'text-slate-800 hover:text-red-700' : 'text-slate-500 hover:text-red-400'
                      }`}
                      title="Remove from investigation queue"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                stopAllInvestigations();
                onClose();
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-red-300 shrink-0 px-2 py-1 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            >
              Clear All ({activeCases.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300">

          {/* Top Bar: Risk Meter & Status Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Gauge */}
            <div className="p-4 bg-[#0d172b] border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400">Evaluated Risk Score</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                    {riskScore}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 100</span>
                </div>
                <div className="mt-1">
                  <SeverityBadge severity={severity} />
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                <div 
                  className={`w-full h-full rounded-full border-4 ${
                    riskScore >= 70 ? 'border-red-500' : 'border-amber-400'
                  } border-t-transparent`}
                />
                <span className="absolute text-xs font-mono font-bold text-white">
                  {riskScore}%
                </span>
              </div>
            </div>

            {/* Current Status & Source Link */}
            <div className="p-4 bg-[#0d172b] border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400">Investigation Status</span>
                <div className="mt-1">
                  <StatusBadge status={currentFinding.status} />
                </div>
              </div>
              <a
                href={isSocial ? socialFinding?.profileUrl : appFinding?.storeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <span>Inspect Source Channel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Evidence Quick Copy */}
            <div className="p-4 bg-[#0d172b] border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400">Legal Dossier</span>
                <p className="text-xs text-slate-400 mt-1">
                  RFC-ready markdown summary for platform takedown requests.
                </p>
              </div>
              <button
                onClick={handleCopyEvidence}
                className="mt-3 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.actionEvidenceCopied : t.actionCopyEvidence}</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side: Official vs Candidate Asset Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{t.caseOfficialAssetComparison}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Official Asset */}
              <div className="p-4 bg-[#09152b] border border-cyan-900/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-semibold border-b border-cyan-950 pb-2">
                  <span>Registered Official Asset</span>
                  <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-200">VERIFIED</span>
                </div>
                <div>
                  <span className="text-slate-400">Brand: </span>
                  <span className="text-white font-medium">{brand.brandName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Entity: </span>
                  <span className="text-white font-mono">
                    {isSocial ? `@${brand.officialSocials[0]?.username}` : brand.officialApps[0]?.packageOrBundleId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Publisher / Owner: </span>
                  <span className="text-white">
                    {isSocial ? `${brand.brandName} Corporate` : brand.officialApps[0]?.publisherName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Domain: </span>
                  <span className="text-cyan-400 font-mono">{brand.websiteUrl}</span>
                </div>
              </div>

              {/* Suspected Candidate Asset */}
              <div className="p-4 bg-[#140f1a] border border-rose-900/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-rose-300 font-semibold border-b border-rose-950 pb-2">
                  <span>Suspected Impersonator</span>
                  <span className="text-[10px] bg-rose-950 px-2 py-0.5 rounded text-rose-300 font-mono">
                    {riskScore}% RISK
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Target Name: </span>
                  <span className="text-white font-medium">
                    {candidateName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Handle / Package: </span>
                  <span className="text-rose-300 font-mono">
                    {identifier}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Publisher: </span>
                  <span className="text-amber-300">
                    {isSocial ? 'Third-Party Unverified Profile' : appFinding?.publisherName || 'Unauthorized Publisher'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Lexical Similarity: </span>
                  <span className="text-white font-mono tabular-nums">{similarityScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detection Factors Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.caseDetectionFactors}
            </h3>
            <div className="space-y-2">
              {detectionReasons.map((reason: any, idx: number) => (
                <div 
                  key={idx}
                  className="p-3 bg-[#0d172b] border border-slate-800 rounded-lg flex items-start justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-200">{reason.name}</span>
                    <p className="text-slate-400 leading-relaxed">{reason.description}</p>
                  </div>
                  <span className="font-mono text-cyan-300 ml-4 tabular-nums shrink-0">
                    Factor: {reason.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Dossier */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.caseEvidenceSummary}
            </h3>
            <div className="p-3 bg-black/40 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 leading-relaxed">
              {currentFinding.evidenceSummary}
            </div>
          </div>

          {/* Recommended Remediation Steps */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.caseRecommendedSteps}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#0a1426] border border-slate-800 rounded-lg">
                <span className="font-semibold text-cyan-300">1. Platform Abuse Report</span>
                <p className="text-slate-400 mt-1">Submit trademark infringement ticket referencing official registration.</p>
              </div>
              <div className="p-3 bg-[#0a1426] border border-slate-800 rounded-lg">
                <span className="font-semibold text-cyan-300">2. Customer Warning Bulletin</span>
                <p className="text-slate-400 mt-1">Broadcast official verification notice advising customers not to engage.</p>
              </div>
            </div>
          </div>

          {/* Analyst Notes Editor */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.caseAnalystNotes}
            </h3>
            {currentFinding.analystNotes && (
              <div className="p-3 bg-[#0c162b] border border-slate-800 rounded-lg text-xs text-slate-300 whitespace-pre-wrap font-sans">
                {currentFinding.analystNotes}
              </div>
            )}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Append new investigation observation or ticket number..."
                className="flex-1 px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.actionAddNoteBtn}</span>
              </button>
            </form>
          </div>

          {/* Audit History Trail */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.caseAuditTrail}</span>
            </h3>
            <div className="p-3 bg-[#081020] border border-slate-800 rounded-lg text-xs space-y-2">
              {relevantLogs.length === 0 ? (
                <span className="text-slate-500">Initial detection logged by threat engine.</span>
              ) : (
                relevantLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <span className="text-slate-300 font-medium">{log.details}</span>
                      <p className="text-[11px] text-slate-500">By {log.performedBy}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions with Confirmation */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-[#060c18]">
          {/* Status Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {activeCases.length > 1 && (
              <label className="flex items-center gap-1.5 mr-2 text-xs font-mono text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/60 px-2.5 py-1.5 rounded-lg border border-cyan-800/80 cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="rounded border-cyan-700 bg-slate-900 text-cyan-500 focus:ring-0 accent-cyan-400"
                />
                <span>Apply status to all {activeCases.length} profiles</span>
              </label>
            )}

            <button
              onClick={() => setConfirmStatus('UNDER_REVIEW')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentFinding.status === 'UNDER_REVIEW' 
                  ? 'bg-amber-950/60 border-amber-600 text-amber-200' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-700'
              }`}
            >
              {t.actionMarkUnderReview}
            </button>

            <button
              onClick={() => setConfirmStatus('CONFIRMED_SUSPICIOUS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentFinding.status === 'CONFIRMED_SUSPICIOUS' 
                  ? 'bg-rose-950/60 border-rose-600 text-rose-200' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-rose-700'
              }`}
            >
              {t.actionConfirmSuspicious}
            </button>

            <button
              onClick={() => setConfirmStatus('FALSE_POSITIVE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentFinding.status === 'FALSE_POSITIVE' 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              {t.actionMarkFalsePositive}
            </button>

            <button
              onClick={() => setConfirmStatus('RESOLVED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentFinding.status === 'RESOLVED' 
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-700'
              }`}
            >
              {t.actionResolveCase}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>

        {/* Status Confirmation Dialog Overlay */}
        {confirmStatus && (
          <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md p-5 bg-[#0e172a] border border-cyan-800/80 rounded-xl shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Confirm Case Status Update</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {applyToAll && activeCases.length > 1 ? (
                  <>Transition status of <strong className="text-cyan-300">all {activeCases.length} active profiles</strong> to <span className="text-cyan-300 font-semibold">{confirmStatus}</span>? This bulk action will be timestamped in the security audit trail.</>
                ) : (
                  <>{t.confirmActionPrompt} Transition status of <strong>{candidateName}</strong> to <span className="text-cyan-300 font-semibold">{confirmStatus}</span>? This action will be timestamped in the security audit trail.</>
                )}
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmStatus(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={() => handleStatusChange(confirmStatus)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                >
                  {t.confirmBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
