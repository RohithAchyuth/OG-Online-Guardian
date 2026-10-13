import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  User, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose }) => {
  const { user, profileSyncStatus, profileSyncError, saveProfileSetup } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [organizationName, setOrganizationName] = useState(user?.organizationName || 'NovaPay Global Technologies');
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync inputs with latest authenticated user profile
  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setOrganizationName(user.organizationName || 'NovaPay Global Technologies');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleDismiss = () => {
    // Gracefully dismiss modal and ensure user session continues active
    onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await saveProfileSetup(fullName, organizationName);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.alreadyExisted 
            ? 'Cloud Firestore profile record verified and loaded successfully.'
            : 'Cloud Firestore profile record and organization established successfully.'
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || profileSyncError || 'Failed to sync profile. Session remains active.'
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while saving profile.';
      setFeedback({
        type: 'error',
        message: msg
      });
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-modal layer-1 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Subtle glass glow top bar */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                <span>Cloud Firestore Profile Setup</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                  SECURE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure your persistent organization & profile records
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 backdrop-blur-md transition-all ${
            profileSyncStatus === 'synced'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : profileSyncStatus === 'failed'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
          }`}>
            {profileSyncStatus === 'synced' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-semibold block">
                {profileSyncStatus === 'synced'
                  ? 'Profile Synced to Firestore'
                  : 'Authenticated Session Verified'}
              </span>
              <p className="text-[11px] opacity-90 leading-relaxed font-mono">
                UID: {user.uid} | Role: {user.role || 'ADMIN'} | Access authorized.
              </p>
            </div>
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 backdrop-blur-md ${
              feedback.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/50 border-red-500/40 text-red-200'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="option-fly stagger-1">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  placeholder="Security Analyst Name"
                />
              </div>
            </div>

            <div className="option-fly stagger-2">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Organization / Brand Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  placeholder="NovaPay Global Technologies"
                />
              </div>
            </div>

            <div className="p-3.5 glass-panel-subtle rounded-xl text-[11px] text-slate-400 space-y-1 font-mono option-fly stagger-3">
              <div className="flex justify-between">
                <span>Database Path:</span>
                <span className="text-cyan-300 font-semibold">/users/{user.uid}</span>
              </div>
              <div className="flex justify-between">
                <span>Organization Path:</span>
                <span className="text-cyan-300 font-semibold">/organizations/{user.organizationId || 'org-novapay-enterprise'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 option-fly stagger-4">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={submitting}
                className="px-4 py-2.5 glass-button rounded-xl text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                Dismiss / Keep Active
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 glass-button-primary rounded-xl text-xs text-slate-950 font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${submitting ? 'animate-spin' : ''}`} />
                <span>
                  {submitting 
                    ? 'Saving Profile...' 
                    : 'Save Profile & Continue'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
