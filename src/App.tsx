import React, { useEffect, Suspense, lazy } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './router/RouterContext';
import { CyberBackground } from './components/CyberBackground';
import { DashboardTabSkeleton, AuthViewSkeleton, LandingSkeleton } from './components/DashboardSkeleton';
import { InvestigationProvider } from './context/InvestigationContext';
import { BrandProvider } from './context/BrandContext';
import { ActiveInvestigationsDock } from './components/ActiveInvestigationsDock';

// Code-split top-level routes
const LandingPage = lazy(() => import('./views/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthView = lazy(() => import('./views/AuthView').then(m => ({ default: m.AuthView })));
const OnboardingWizard = lazy(() => import('./views/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const DashboardShell = lazy(() => import('./views/DashboardShell').then(m => ({ default: m.DashboardShell })));
const PersonalDashboardShell = lazy(() => import('./views/personal/PersonalDashboardShell').then(m => ({ default: m.PersonalDashboardShell })));
const AccessPendingView = lazy(() => import('./views/AccessPendingView').then(m => ({ default: m.AccessPendingView })));
const FirebaseModal = lazy(() => import('./components/FirebaseModal').then(m => ({ default: m.FirebaseModal })));

const MainAppContent: React.FC = () => {
  const { 
    user, 
    loading, 
    signInAsJudge,
  } = useAuth();
  
  const { path, navigate } = useRouter();
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = React.useState(false);

  // Automatic Role-Based Dashboard Route Guards & Navigation
  useEffect(() => {
    // CRITICAL: Do NOT redirect while the initial Firebase authentication state is resolving!
    if (loading) return;

    const isPersonalRoute = path === '/personal' || path.startsWith('/personal/');
    const isCompanyRoute = path === '/dashboard' || path === '/onboarding';
    const isProtected = isPersonalRoute || isCompanyRoute || path === '/access-pending' || path === '/account-setup';

    if (!user) {
      // Signed-out visitors accessing protected routes are redirected to /login
      if (isProtected) {
        console.log(`[SentinelGuard Guard Diagnostic] Unauthorized attempt to access "${path}". Redirecting to /login`);
        navigate('/login', { replace: true });
      }
    } else {
      // Determine user's authorized destination: personal login routes straight to /personal
      let authorizedDashboard = '/personal';
      if (user.accountType === 'company') {
        authorizedDashboard = user.approvalStatus === 'approved' ? '/dashboard' : '/access-pending';
      } else {
        authorizedDashboard = '/personal';
      }

      // 1. Authenticated users landing on /login, /register, or /account-setup are automatically routed directly to their dashboard
      if (path === '/login' || path === '/register' || path === '/account-setup') {
        console.log(`[SentinelGuard Guard Diagnostic] Authenticated session detected on "${path}". Automatic role-based routing directly to: "${authorizedDashboard}"`);
        navigate(authorizedDashboard, { replace: true });
        return;
      }

      // 2. Personal User Protection: Direct routing to personal dashboard without any intermediate setup screens
      if (user.accountType === 'personal' || !user.accountType) {
        if (isCompanyRoute || path === '/access-pending' || path === '/account-setup') {
          console.log(`[SentinelGuard Guard Diagnostic] Direct personal access to /personal`);
          navigate('/personal', { replace: true });
        }
        return;
      }

      // 4. Company User Protection:
      if (user.accountType === 'company') {
        // Pending approval: Withhold dashboard access until approved
        if (user.approvalStatus !== 'approved') {
          if (path !== '/access-pending') {
            console.warn(`[SentinelGuard Guard Diagnostic] Unapproved company membership denied access to "${path}". Routing to /access-pending`);
            navigate('/access-pending', { replace: true });
          }
          return;
        }

        // Approved company user accessing personal dashboard: Route to enterprise dashboard
        if (isPersonalRoute) {
          console.warn(`[SentinelGuard Guard Diagnostic] Company account routed to enterprise command center from "${path}"`);
          navigate('/dashboard', { replace: true });
          return;
        }
      }
    }
  }, [loading, user, path, navigate]);

  // Non-blocking loading optimization:
  // If user is accessing protected routes without cached user while Firebase verifies session, show lightweight skeleton
  if (loading && !user && (path === '/dashboard' || path === '/onboarding' || path.startsWith('/personal'))) {
    return (
      <div className="relative min-h-screen bg-[#070b14] flex flex-col justify-center items-center text-slate-100 p-6">
        <CyberBackground />
        <div className="relative z-10 w-full max-w-4xl space-y-6">
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-cyan-300">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="uppercase tracking-wider">Restoring secure Online Guardian session...</span>
          </div>
          <DashboardTabSkeleton />
        </div>
      </div>
    );
  }

  // Signed Out Experience
  if (!user) {
    // /login and /register routes
    if (path === '/login' || path === '/register') {
      return (
        <div className="relative min-h-screen bg-[#070b14]">
          <CyberBackground />
          <Suspense fallback={<AuthViewSkeleton />}>
            <AuthView
              initialMode={path === '/register' ? 'register' : 'signin'}
              onBackToHome={() => navigate('/')}
              onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
              onSuccess={() => {
                console.log('[SentinelGuard Auth] Navigation completed from AuthView');
              }}
            />
          </Suspense>
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
    }

    // Default Public Landing Page (path === '/' or unmapped public path)
    return (
      <div className="relative min-h-screen bg-[#070b14]">
        <CyberBackground />
        <Suspense fallback={<LandingSkeleton />}>
          <LandingPage
            onOpenAuth={(mode) => {
              console.log(`[SentinelGuard Navigation] Landing page opening auth in mode: "${mode}"`);
              navigate(mode === 'register' ? '/register' : '/login');
            }}
            onExploreDemo={() => {
              console.log('[SentinelGuard Auth] Quick demo access selected from landing page');
              signInAsJudge();
              navigate('/dashboard');
            }}
            onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          />
        </Suspense>
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
  }


  // Authenticated State 2: Company Membership Access Pending Approval
  if (user.accountType === 'company' && user.approvalStatus !== 'approved') {
    return (
      <Suspense fallback={<DashboardTabSkeleton />}>
        <AccessPendingView />
      </Suspense>
    );
  }

  // Authenticated State: Personal User Dashboard (Direct route after personal login)
  if (user.accountType === 'personal' || !user.accountType || path === '/personal' || path.startsWith('/personal/') || path === '/account-setup') {
    return (
      <Suspense fallback={<DashboardTabSkeleton />}>
        <PersonalDashboardShell />
      </Suspense>
    );
  }

  // Authenticated State 4: Approved Company Onboarding Wizard
  if (path === '/onboarding') {
    return (
      <div className="relative min-h-screen bg-[#070b14]">
        <CyberBackground />
        <Suspense fallback={<DashboardTabSkeleton />}>
          <OnboardingWizard
            onComplete={() => navigate('/dashboard')}
            onSkip={() => navigate('/dashboard')}
          />
        </Suspense>
      </div>
    );
  }

  // Authenticated State 5: Approved Company Dashboard (Preserved Complete Enterprise System)
  return (
    <Suspense fallback={<DashboardTabSkeleton />}>
      <DashboardShell />
    </Suspense>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider>
          <BrandProvider>
            <InvestigationProvider>
              <MainAppContent />
              <ActiveInvestigationsDock />
            </InvestigationProvider>
          </BrandProvider>
        </RouterProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
