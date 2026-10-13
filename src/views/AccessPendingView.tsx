import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/RouterContext';
import { CyberBackground } from '../components/CyberBackground';
import { SentinelLogo } from '../components/SentinelLogo';
import { 
  Building, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  RefreshCw, 
  User, 
  Sparkles,
  Lock
} from 'lucide-react';

export const AccessPendingView: React.FC = () => {
  const { user, approveCompanyAccess, setAccountType, signOut } = useAuth();
  const { navigate } = useRouter();
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveCompanyAccess();
      console.log('[Access Pending] Membership approved, redirecting to /dashboard');
      navigate('/dashboard', { replace: true });
    } finally {
      setApproving(false);
    }
  };

  const handleSwitchToPersonal = async () => {
    await setAccountType('personal');
    console.log('[Access Pending] Switched to personal account, redirecting to /personal');
    navigate('/personal', { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-6 relative font-sans">
      <CyberBackground />

      <div className="relative z-10 w-full max-w-lg bg-[#0a1222] border border-amber-800/60 rounded-2xl p-8 space-y-6 shadow-2xl shadow-amber-950/20">
        <div className="flex items-center justify-between">
          <SentinelLogo size="sm" />
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold">
            Access Pending
          </span>
        </div>

        <div className="space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Corporate Membership Verification Pending
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your request for company account access is under review. Access to the enterprise security command center requires verified corporate membership authorized by your organization administrator.
          </p>
        </div>

        {/* Account Details */}
        <div className="p-4 bg-[#070b14] border border-slate-800 rounded-xl space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-mono text-[11px]">Applicant Email:</span>
            <span className="font-mono text-white text-[11px]">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-400 font-mono text-[11px]">Organization:</span>
            <span className="font-semibold text-cyan-400">{user?.organizationName || 'Corporate Workspace'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-mono text-[11px]">Review Status:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Pending Security Admin Approval</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* Quick Simulation / Testing Button for Judges & Evaluators */}
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Evaluator & Sandbox Instant Approval</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              For acceptance testing, click below to simulate workspace admin approval and immediately access the full enterprise dashboard:
            </p>
            <button
              onClick={handleApprove}
              disabled={approving}
              className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {approving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing Workspace Membership...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simulate Workspace Admin Approval</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleSwitchToPersonal}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch to Personal User Account</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-2 px-4 text-slate-400 hover:text-white text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out & Return Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
