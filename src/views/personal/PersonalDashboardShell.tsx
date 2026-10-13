import React, { Suspense, lazy } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useInvestigation } from '../../context/InvestigationContext';
import { CyberBackground } from '../../components/CyberBackground';
import { SentinelLogo } from '../../components/SentinelLogo';
import { 
  Smartphone, 
  UserCheck, 
  Share2, 
  LayoutDashboard, 
  LogOut, 
  User, 
  ShieldCheck, 
  ExternalLink,
  Camera
} from 'lucide-react';
import { PersonalOverviewView } from './PersonalOverviewView';
import { PersonalAppMonitoringView } from './PersonalAppMonitoringView';
import { PersonalLookalikeView } from './PersonalLookalikeView';
import { PersonalSocialMonitoringView } from './PersonalSocialMonitoringView';
import { AvatarSelectionModal } from '../../components/AvatarSelectionModal';
import { avatarImg } from '../../assets/images';

const InvestigationModal = lazy(() => import('../InvestigationModal').then(m => ({ default: m.InvestigationModal })));

export const PersonalDashboardShell: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, signOut } = useAuth();
  const { activeCase, isModalOpen, closeModal } = useInvestigation();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);

  const handleSignOut = async () => {
    console.log('[Personal Dashboard] User triggered sign-out');
    await signOut();
    navigate('/login', { replace: true });
  };

  // Determine active view from URL path
  let currentSection = 'overview';
  if (path === '/personal/apps') currentSection = 'apps';
  else if (path === '/personal/lookalike') currentSection = 'lookalike';
  else if (path === '/personal/social') currentSection = 'social';

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <CyberBackground />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800 bg-[#091122]/90 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Personal Mode Badge */}
          <div className="flex items-center gap-3">
            <SentinelLogo size="sm" />
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-[11px] font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Personal User Suite</span>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs transition-colors group cursor-pointer"
              title="Click to change profile photo"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700/60 overflow-hidden flex items-center justify-center text-cyan-400 font-bold text-xs relative shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={avatarImg}
                    alt={user?.fullName || 'User'}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-cyan-300">
                  <Camera className="w-3 h-3" />
                </div>
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="flex items-center gap-1">
                  <span className="block font-bold text-white text-xs">{user?.fullName || 'Personal User'}</span>
                  <span className="text-[9px] font-mono text-cyan-400/80 group-hover:text-cyan-300">(Change)</span>
                </div>
                <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{user?.email}</span>
              </div>
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation for the 3 main features + Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none text-xs">
          <button
            onClick={() => navigate('/personal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              currentSection === 'overview'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => navigate('/personal/apps')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              currentSection === 'apps'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. App Store Monitoring</span>
          </button>

          <button
            onClick={() => navigate('/personal/lookalike')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              currentSection === 'lookalike'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Look-alike Name Detection</span>
          </button>

          <button
            onClick={() => navigate('/personal/social')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              currentSection === 'social'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>3. Social Media Monitoring</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentSection === 'overview' && <PersonalOverviewView />}
        {currentSection === 'apps' && <PersonalAppMonitoringView />}
        {currentSection === 'lookalike' && <PersonalLookalikeView />}
        {currentSection === 'social' && <PersonalSocialMonitoringView />}
      </main>

      {/* Global Investigation Case Modal */}
      {isModalOpen && activeCase && (
        <Suspense fallback={null}>
          <InvestigationModal
            finding={activeCase.finding}
            onClose={closeModal}
          />
        </Suspense>
      )}

      {/* Profile Photo Selection Modal */}
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
