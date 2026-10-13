import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck,
  Building,
  Calendar
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { t } = useLanguage();
  const { brand, socialFindings, appFindings, exportCsvReport, lastScanTimestamp } = useBrand();

  const [dateRange, setDateRange] = useState('ALL');
  const [showPrintView, setShowPrintView] = useState(false);

  const { totalDetections, criticalCount, highCount, resolvedCount, fpCount } = useMemo(() => {
    let crit = 0;
    let high = 0;
    let resolved = 0;
    let fp = 0;

    for (let i = 0; i < socialFindings.length; i++) {
      const s = socialFindings[i];
      if (s.severity === 'CRITICAL') crit++;
      else if (s.severity === 'HIGH') high++;
      if (s.status === 'RESOLVED' || s.status === 'FALSE_POSITIVE') resolved++;
      if (s.status === 'FALSE_POSITIVE') fp++;
    }

    for (let i = 0; i < appFindings.length; i++) {
      const a = appFindings[i];
      if (a.severity === 'CRITICAL') crit++;
      else if (a.severity === 'HIGH') high++;
      if (a.status === 'RESOLVED' || a.status === 'FALSE_POSITIVE') resolved++;
      if (a.status === 'FALSE_POSITIVE') fp++;
    }

    return {
      totalDetections: socialFindings.length + appFindings.length,
      criticalCount: crit,
      highCount: high,
      resolvedCount: resolved,
      fpCount: fp,
    };
  }, [socialFindings, appFindings]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 layer-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>{t.reportsTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export compliance audit reports, detection telemetry, and legal remediation evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPrintView(!showPrintView)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white glass-button rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showPrintView ? 'Exit Executive View' : t.reportsPrintBtn}</span>
          </button>

          <button
            onClick={exportCsvReport}
            className="flex items-center gap-2 px-4 py-2 glass-button-primary text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/25"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.reportsExportCsvBtn}</span>
          </button>
        </div>
      </div>

      {showPrintView ? (
        /* Printable Executive Summary Paper View */
        <div className="p-8 bg-[#0b1322] border border-cyan-800/40 rounded-xl space-y-6 text-slate-200 shadow-2xl print:bg-white print:text-black">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                SENTINELGUARD THREAT INTELLIGENCE DOSSIER
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Executive Brand Risk Assessment: {brand.brandName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation Window: Q3/Q4 2026 · Generated {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">DEMO DATASET</span>
              <span className="text-xs font-semibold text-emerald-400">STATUS: AUDITED</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-[#070d18] border border-slate-800 rounded-lg text-center font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Total Monitored Assets</span>
              <span className="text-lg font-bold text-white">{brand.officialSocials.length + brand.officialApps.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Threats Discovered</span>
              <span className="text-lg font-bold text-amber-300">{totalDetections}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Critical & High Risks</span>
              <span className="text-lg font-bold text-red-400">{criticalCount + highCount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Mitigated / Whitelisted</span>
              <span className="text-lg font-bold text-emerald-400">{resolvedCount}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <h3 className="text-sm font-bold text-white">Summary of Impersonation Vector</h3>
            <p>
              Reconnaissance conducted across major social platforms (X, Instagram, LinkedIn, Facebook, TikTok) and mobile app repositories (Google Play, Apple App Store) identified <strong>{totalDetections} candidate look-alike entities</strong> targeting registered brand <em>{brand.brandName}</em>.
            </p>
            <p>
              Of these, <strong>{criticalCount} critical-severity targets</strong> utilized deceptive credential harvesting modifiers (e.g. <code>NovaPay_HelpDesk</code>) or visual homoglyph typosquatting (e.g. <code>N0vaPayPromo</code>). Additionally, rogue application package <code>com.novapay.rewards.cash</code> was identified on third-party mobile repositories published by unauthorized entity <em>Apex Tech LLC</em>.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Online Guardian Zero-Trust Risk Protection Engine</span>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Dashboard Reports View */
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 layer-2">
            <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Detections</span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">{totalDetections}</div>
              <p className="text-[11px] text-slate-500 font-mono">
                {socialFindings.length} Social · {appFindings.length} Mobile
              </p>
            </div>

            <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">High & Critical Exposure</span>
              <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">{criticalCount + highCount}</div>
              <p className="text-[11px] text-slate-500 font-mono">Requiring takedown action</p>
            </div>

            <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Resolution Rate</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {totalDetections > 0 ? Math.round((resolvedCount / totalDetections) * 100) : 100}%
              </div>
              <p className="text-[11px] text-slate-500 font-mono">{resolvedCount} cases closed</p>
            </div>

            <div className="p-4.5 glass-card rounded-2xl space-y-1 option-fly stagger-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">False-Positive Tuning</span>
              <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">{fpCount}</div>
              <p className="text-[11px] text-slate-500 font-mono">Suppressed benign entities</p>
            </div>
          </div>

          {/* Detailed Report Table & Breakdown */}
          <div className="p-5.5 glass-card rounded-2xl space-y-4 layer-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Consolidated Threat Dataset</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time threat log ready for CSV export
                </p>
              </div>

              <button
                onClick={exportCsvReport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-cyan-300 glass-button rounded-xl transition-all font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Suspect Asset / Title</th>
                    <th className="py-2.5 px-3">Handle / Package ID</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Detected Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {socialFindings.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-cyan-400">Social</td>
                      <td className="py-2.5 px-3 text-white font-sans font-semibold">{s.accountName}</td>
                      <td className="py-2.5 px-3 text-slate-300">@{s.username}</td>
                      <td className="py-2.5 px-3">{s.platform}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-300">{s.riskScore}/100</td>
                      <td className="py-2.5 px-3">{s.status}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(s.detectedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {appFindings.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-sky-400">Mobile App</td>
                      <td className="py-2.5 px-3 text-white font-sans font-semibold">{a.appName}</td>
                      <td className="py-2.5 px-3 text-rose-300">{a.packageOrBundleId}</td>
                      <td className="py-2.5 px-3">{a.platform}</td>
                      <td className="py-2.5 px-3 font-bold text-red-400">{a.riskScore}/100</td>
                      <td className="py-2.5 px-3">{a.status}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(a.detectedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
