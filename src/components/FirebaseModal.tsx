import React, { useState } from 'react';
import { getFirebaseStatus, getFirebaseConsoleLinks } from '../services/firebaseConfig';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  ShieldCheck, 
  Database, 
  Copy, 
  Check, 
  X, 
  Server, 
  ExternalLink, 
  Lock, 
  Globe, 
  AlertCircle 
} from 'lucide-react';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const status = getFirebaseStatus();
  const links = getFirebaseConsoleLinks();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSnippet = `# Online Guardian Firebase Environment Configuration
VITE_FIREBASE_API_KEY=${status.hasApiKey ? 'configured' : 'your_api_key_here'}
VITE_FIREBASE_AUTH_DOMAIN=${status.authDomain || 'your_project_id.firebaseapp.com'}
VITE_FIREBASE_PROJECT_ID=${status.projectId || 'your_project_id'}
VITE_FIREBASE_STORAGE_BUCKET=${status.storageBucket || 'your_project_id.firebasestorage.app'}
VITE_FIREBASE_MESSAGING_SENDER_ID=${status.messagingSenderId || 'your_sender_id'}
VITE_FIREBASE_APP_ID=${status.appId || 'your_app_id'}`;

  const copyConfig = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-[#0c1424] border border-cyan-900/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090f1d]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 id="fb-modal-title" className="text-base font-semibold text-white">
                {t.firebaseSetupTitle}
              </h2>
              <p className="text-xs text-slate-400">
                Firebase Authentication & Security Rules Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            status.isConfigured 
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' 
              : 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {status.isConfigured ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Server className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">
                  {status.isConfigured ? t.firebaseStatusConnected : t.firebaseStatusDemo}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {status.isConfigured 
                    ? `Configured Project: ${status.projectId}. Authentication and ABAC security rules initialized.`
                    : 'All threat detection engines and brand profile managers are operating in local test mode with pre-seeded enterprise telemetry for brand "NovaPay".'}
                </p>
              </div>
            </div>
          </div>

          {/* Authentication & Console Setup Checklist */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Firebase Authentication Setup Checklist</span>
              </span>
              <a 
                href={links.authOverview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To resolve <code className="text-cyan-300">auth/configuration-not-found</code>, ensure these steps are completed in your Firebase Console for project <strong className="text-white">{status.projectId}</strong>:
            </p>

            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">1.</span>
                <span>Open Firebase Console Authentication &gt; click <strong>"Get started"</strong> if not already activated.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">2.</span>
                <span>Go to <strong>Sign-in method</strong> tab &gt; click <strong>Email/Password</strong> &gt; toggle <strong>Enable</strong> to ON &gt; Save.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">3.</span>
                <span>Go to <strong>Settings</strong> &gt; <strong>Authorized domains</strong> &gt; confirm that <strong>{status.currentHostname}</strong> is present.</span>
              </li>
            </ul>
          </div>

          {/* Environment Variable Setup Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Active Environment Variables (.env)
              </span>
              <button
                onClick={copyConfig}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Variables'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/60 border border-slate-800 rounded-lg text-xs font-mono text-cyan-200/90 overflow-x-auto">
              {envSnippet}
            </pre>
          </div>

          {/* Firestore ABAC Rules Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Firestore Collections Protected by Rules</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                <span className="font-mono text-cyan-300 font-medium">/users/{'{userId}'}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Isolated user credentials & roles</p>
              </div>
              <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                <span className="font-mono text-cyan-300 font-medium">/organizations/{'{orgId}'}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Tenant boundary & members ABAC</p>
              </div>
              <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                <span className="font-mono text-cyan-300 font-medium">.../socialFindings</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Social impersonation detections</p>
              </div>
              <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                <span className="font-mono text-cyan-300 font-medium">.../appFindings</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Mobile look-alike detections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-[#090f1d]">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Host: {status.currentHostname}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
