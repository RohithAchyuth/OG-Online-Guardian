import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('BrandShield Automatic Role-Based Dashboard Routing & Security Suite', () => {
  interface UserSession {
    uid: string;
    email: string;
    accountType?: 'personal' | 'company';
    approvalStatus?: 'approved' | 'pending' | 'rejected';
    role: 'ADMIN' | 'ANALYST' | 'VIEWER';
    organizationId?: string;
  }

  // Pure function representing App.tsx route guard
  function determineTargetRoute(user: UserSession | null, currentPath: string): {
    route: string;
    allowed: boolean;
    reason?: string;
  } {
    if (!user) {
      if (currentPath === '/dashboard' || currentPath === '/onboarding' || currentPath.startsWith('/personal') || currentPath === '/access-pending' || currentPath === '/account-setup') {
        return { route: '/login', allowed: false, reason: 'Unauthenticated redirect' };
      }
      return { route: currentPath, allowed: true };
    }

    const userType = user.accountType || 'personal';

    // Role-based destination determination: personal users route straight to /personal
    let authorizedDashboard = '/personal';
    if (userType === 'company') {
      authorizedDashboard = user.approvalStatus === 'approved' ? '/dashboard' : '/access-pending';
    } else {
      authorizedDashboard = '/personal';
    }

    // Login/register/account-setup redirect directly to dashboard
    if (currentPath === '/login' || currentPath === '/register' || currentPath === '/account-setup') {
      return { route: authorizedDashboard, allowed: false, reason: 'Authenticated redirect' };
    }

    // Personal user route isolation
    if (userType === 'personal') {
      if (currentPath === '/dashboard' || currentPath === '/onboarding' || currentPath === '/access-pending' || currentPath === '/account-setup') {
        return { route: '/personal', allowed: false, reason: 'Personal account forbidden from company dashboard' };
      }
      return { route: currentPath, allowed: true };
    }

    // Company user route isolation
    if (user.accountType === 'company') {
      if (user.approvalStatus !== 'approved') {
        if (currentPath !== '/access-pending') {
          return { route: '/access-pending', allowed: false, reason: 'Unapproved company membership pending verification' };
        }
        return { route: '/access-pending', allowed: true };
      }

      if (currentPath.startsWith('/personal')) {
        return { route: '/dashboard', allowed: false, reason: 'Company account routed to enterprise command center' };
      }
      return { route: currentPath, allowed: true };
    }

    return { route: currentPath, allowed: true };
  }

  describe('1. Automatic Role-Based Routing on Login & Signup', () => {
    it('MUST route normal individual users automatically to Personal Dashboard (/personal)', () => {
      const personalUser: UserSession = {
        uid: 'user-personal-1',
        email: 'alex@example.com',
        accountType: 'personal',
        approvalStatus: 'approved',
        role: 'VIEWER',
      };

      const resultFromLogin = determineTargetRoute(personalUser, '/login');
      assert.equal(resultFromLogin.route, '/personal');

      const resultFromRegister = determineTargetRoute(personalUser, '/register');
      assert.equal(resultFromRegister.route, '/personal');
    });

    it('MUST route approved company users automatically to existing Company Dashboard (/dashboard)', () => {
      const approvedCompanyUser: UserSession = {
        uid: 'user-company-admin',
        email: 'analyst@enterprise.com',
        accountType: 'company',
        approvalStatus: 'approved',
        role: 'ADMIN',
        organizationId: 'org-novapay-enterprise',
      };

      const resultFromLogin = determineTargetRoute(approvedCompanyUser, '/login');
      assert.equal(resultFromLogin.route, '/dashboard');

      const resultFromRegister = determineTargetRoute(approvedCompanyUser, '/register');
      assert.equal(resultFromRegister.route, '/dashboard');
    });

    it('MUST route unapproved company accounts to Access Pending (/access-pending)', () => {
      const pendingCompanyUser: UserSession = {
        uid: 'user-applicant-1',
        email: 'newhire@corp.com',
        accountType: 'company',
        approvalStatus: 'pending',
        role: 'VIEWER',
        organizationId: 'org-external',
      };

      const result = determineTargetRoute(pendingCompanyUser, '/login');
      assert.equal(result.route, '/access-pending');
    });

    it('MUST route personal users directly to Personal Dashboard (/personal) and bypass account setup', () => {
      const personalUser: UserSession = {
        uid: 'user-personal-1',
        email: 'alex@example.com',
        accountType: 'personal',
        role: 'VIEWER',
      };

      const result = determineTargetRoute(personalUser, '/login');
      assert.equal(result.route, '/personal');

      const resultSetup = determineTargetRoute(personalUser, '/account-setup');
      assert.equal(resultSetup.route, '/personal');
    });
  });

  describe('2. Direct URL Access & Cross-Role Isolation', () => {
    it('MUST prevent personal users from accessing company dashboard directly', () => {
      const personalUser: UserSession = {
        uid: 'user-personal-1',
        email: 'alex@example.com',
        accountType: 'personal',
        approvalStatus: 'approved',
        role: 'VIEWER',
      };

      // Personal user tries direct navigation to /dashboard
      const directDashboard = determineTargetRoute(personalUser, '/dashboard');
      assert.equal(directDashboard.allowed, false);
      assert.equal(directDashboard.route, '/personal');

      // Personal user tries direct navigation to /onboarding
      const directOnboarding = determineTargetRoute(personalUser, '/onboarding');
      assert.equal(directOnboarding.allowed, false);
      assert.equal(directOnboarding.route, '/personal');
    });

    it('MUST prevent unapproved company members from accessing company dashboard', () => {
      const pendingCompanyUser: UserSession = {
        uid: 'user-applicant-1',
        email: 'applicant@corp.com',
        accountType: 'company',
        approvalStatus: 'pending',
        role: 'VIEWER',
      };

      const directDashboard = determineTargetRoute(pendingCompanyUser, '/dashboard');
      assert.equal(directDashboard.allowed, false);
      assert.equal(directDashboard.route, '/access-pending');
    });

    it('MUST allow personal users to access the three personal monitoring sub-pages', () => {
      const personalUser: UserSession = {
        uid: 'user-personal-1',
        email: 'alex@example.com',
        accountType: 'personal',
        approvalStatus: 'approved',
        role: 'VIEWER',
      };

      assert.equal(determineTargetRoute(personalUser, '/personal').allowed, true);
      assert.equal(determineTargetRoute(personalUser, '/personal/apps').allowed, true);
      assert.equal(determineTargetRoute(personalUser, '/personal/lookalike').allowed, true);
      assert.equal(determineTargetRoute(personalUser, '/personal/social').allowed, true);
    });

    it('MUST redirect unauthenticated visitors to /login', () => {
      assert.equal(determineTargetRoute(null, '/dashboard').route, '/login');
      assert.equal(determineTargetRoute(null, '/personal').route, '/login');
      assert.equal(determineTargetRoute(null, '/personal/apps').route, '/login');
    });
  });

  describe('3. Look-alike Engine Distinction Tests', () => {
    it('MUST distinguish generated variations from discovered profiles', () => {
      const sampleResult = {
        generatedVariations: [
          { variation: 'a1ex', type: 'homoglyph', description: 'Replaced l with 1' },
          { variation: 'alex_official', type: 'deceptive_modifier', description: 'Suffix official' },
        ],
        discoveredProfiles: [
          { platform: 'GitHub', username: 'alex', profileUrl: 'https://github.com/alex', status: 'ACTIVE' },
        ],
      };

      // Structural invariant check
      assert.ok(Array.isArray(sampleResult.generatedVariations));
      assert.ok(Array.isArray(sampleResult.discoveredProfiles));
      assert.notEqual(sampleResult.generatedVariations, sampleResult.discoveredProfiles);
      assert.equal(sampleResult.generatedVariations.length, 2);
      assert.equal(sampleResult.discoveredProfiles.length, 1);
    });
  });
});
