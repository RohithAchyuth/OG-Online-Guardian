import React, { useState, Suspense, lazy } from 'react';
import { BrandProvider, useBrand } from '../context/BrandContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/RouterContext';
import { CyberBackground } from '../components/CyberBackground';
import { Sidebar, DashboardTab } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardTabSkeleton } from '../components/DashboardSkeleton';
import { SocialFinding, AppFinding } from '../types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Code-split tab views & modals
const DashboardOverview = lazy(() => import('./DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const BrandProfileView = lazy(() => import('./BrandProfileView').then(m => ({ default: m.BrandProfileView })));
const SocialMonitoringView = lazy(() => import('./SocialMonitoringView').then(m => ({ default: m.SocialMonitoringView })));
const AppMonitoringView = lazy(() => import('./AppMonitoringView').then(m => ({ default: m.AppMonitoringView })));
const InvestigationsListView = lazy(() => import('./InvestigationsListView').then(m => ({ default: m.InvestigationsListView })));
const ReportsView = lazy(() => import('./ReportsView').then(m => ({ default: m.ReportsView })));
const NotificationsView = lazy(() => import('./NotificationsView').then(m => ({ default: m.NotificationsView })));
const SettingsView = lazy(() => import('./SettingsView').then(m => ({ default: m.SettingsView })));

const InvestigationModal = lazy(() => import('./InvestigationModal').then(m => ({ default: m.InvestigationModal })));
const ProfileSetupModal = lazy(() => import('../components/ProfileSetupModal').then(m => ({ default: m.ProfileSetupModal })));
const FirebaseModal = lazy(() => import('../components/FirebaseModal').then(m => ({ default: m.FirebaseModal })));
import { useInvestigation } from '../context/InvestigationContext';

const DashboardInner: React.FC = () => {
  const { 
    user, 
    signOut, 
    profileSyncStatus, 
    profileSyncError, 
    retryProfileSetup 
  } = useAuth();
  
  const { notifications } = useBrand();
  const { navigate } = useRouter();

  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [retryingProfile, setRetryingProfile] = useState(false);

  // Modals & Investigation Engine
  const { activeCase, isModalOpen, startInvestigation, closeModal } = useInvestigation();
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeInvestigation, setActiveInvestigation] = useState<SocialFinding | AppFinding | null>(null);

  // Auto-open profile setup modal once if profile record is pending initialization
  const hasAutoPromptedRef = React.useRef(false);
  React.useEffect(() => {
    if (profileSyncStatus === 'pending' && user && !user.isDemoUser && !hasAutoPromptedRef.current) {
      hasAutoPromptedRef.current = true;
      setIsProfileModalOpen(true);
    }
  }, [profileSyncStatus, user]);

  // Unread notification count for sidebar from brand context
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRetryProfile = async () => {
    if (retryingProfile) return;
    setRetryingProfile(true);
    try {
      await retryProfileSetup();
    } finally {
      setRetryingProfile(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      <CyberBackground />

      {/* Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSignOut={async () => {
          console.log('[SentinelGuard Navigation] User triggered sign-out from sidebar');
          await signOut();
          navigate('/login', { replace: true });
        }}
        unreadNotificationCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DashboardHeader
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        />

        {/* Non-fatal Firestore profile sync notification banner */}
        {profileSyncStatus !== 'synced' && user && !user.isDemoUser && (
          <div className="mx-6 md:mx-8 mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {profileSyncStatus === 'pending'
                  ? 'Cloud Firestore user profile record pending initialization.'
                  : `Firestore profile sync deferred (${profileSyncError || 'permission check'}). Session remains active.`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/60 font-semibold rounded text-xs transition-colors shrink-0"
              >
                Set Up Profile
              </button>
              <button
                onClick={handleRetryProfile}
                disabled={retryingProfile}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${retryingProfile ? 'animate-spin' : ''}`} />
                <span>{retryingProfile ? 'Syncing...' : 'Retry Profile Sync'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab View Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <Suspense fallback={<DashboardTabSkeleton />}>
            {currentTab === 'overview' && (
              <DashboardOverview
                onSelectTab={setCurrentTab}
                onOpenFinding={(f) => {
                  setActiveInvestigation(f);
                  startInvestigation(f);
                }}
              />
            )}

            {currentTab === 'brand-profile' && (
              <BrandProfileView />
            )}

            {currentTab === 'social-monitoring' && (
              <SocialMonitoringView
                onOpenFinding={(f) => {
                  setActiveInvestigation(f);
                  startInvestigation(f);
                }}
              />
            )}

            {currentTab === 'app-monitoring' && (
              <AppMonitoringView
                onOpenFinding={(f) => {
                  setActiveInvestigation(f);
                  startInvestigation(f);
                }}
              />
            )}

            {currentTab === 'investigations' && (
              <InvestigationsListView
                onOpenFinding={(f) => {
                  setActiveInvestigation(f);
                  startInvestigation(f);
                }}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView />
            )}

            {currentTab === 'notifications' && (
              <NotificationsView
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Global Investigation Case Modal */}
      {((isModalOpen && activeCase) || activeInvestigation) && (
        <Suspense fallback={null}>
          <InvestigationModal
            finding={activeCase?.finding || activeInvestigation}
            onClose={() => {
              closeModal();
              setActiveInvestigation(null);
            }}
          />
        </Suspense>
      )}

      {/* Cloud Firestore Profile Setup Modal */}
      {isProfileModalOpen && (
        <Suspense fallback={null}>
          <ProfileSetupModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Global Firebase Setup & Architecture Modal */}
      {isFirebaseModalOpen && (
        <Suspense fallback={null}>
          <FirebaseModal
            isOpen={isFirebaseModalOpen}
            onClose={() => setIsFirebaseModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export const DashboardShell: React.FC = () => {
  return (
    <BrandProvider>
      <DashboardInner />
    </BrandProvider>
  );
};
