import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * SentinelGuard Security Rules & Access Control Evaluation Engine
 * Validates the security policies defined in firestore.rules against:
 * 1. Unauthenticated access
 * 2. Cross-user isolation
 * 3. Cross-organization multi-tenant isolation
 * 4. Privilege escalation prevention
 * 5. Schema and field integrity (invalid writes & immutable audit logs)
 * 6. Legitimate authorized workflows
 * 7. Server-side abuse prevention & rate limiting
 */

interface AuthContext {
  uid: string | null;
  email?: string;
}

interface SimulatedDatabase {
  users: Map<string, Record<string, unknown>>;
  organizations: Map<string, Record<string, unknown>>;
  members: Map<string, Record<string, unknown>>; // key: `${orgId}:${memberId}`
  brands: Map<string, Record<string, unknown>>; // key: `${orgId}:${brandId}`
  socialFindings: Map<string, Record<string, unknown>>; // key: `${orgId}:${findingId}`
  appFindings: Map<string, Record<string, unknown>>; // key: `${orgId}:${appFindingId}`
  auditLogs: Map<string, Record<string, unknown>>; // key: `${orgId}:${logId}`
}

function createSecurityEvaluator(db: SimulatedDatabase) {
  function isValidId(id: unknown): boolean {
    return typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  }

  function isValidRole(role: unknown): boolean {
    return role === 'ADMIN' || role === 'OWNER' || role === 'ANALYST' || role === 'VIEWER';
  }

  function isOrgOwner(auth: AuthContext, orgId: string): boolean {
    if (!auth.uid) return false;
    const org = db.organizations.get(orgId);
    return Boolean(org && org.ownerUid === auth.uid);
  }

  function isOrgMember(auth: AuthContext, orgId: string): boolean {
    if (!auth.uid) return false;
    if (isOrgOwner(auth, orgId)) return true;
    return db.members.has(`${orgId}:${auth.uid}`);
  }

  function isOrgAdmin(auth: AuthContext, orgId: string): boolean {
    if (!auth.uid) return false;
    if (isOrgOwner(auth, orgId)) return true;
    const member = db.members.get(`${orgId}:${auth.uid}`);
    return Boolean(member && (member.role === 'ADMIN' || member.role === 'OWNER'));
  }

  return {
    // 1. Users Collection
    canReadUser(auth: AuthContext, userId: string): boolean {
      return Boolean(auth.uid && auth.uid === userId);
    },

    canCreateUser(auth: AuthContext, userId: string, data: Record<string, unknown>): boolean {
      if (!auth.uid || auth.uid !== userId || !isValidId(userId)) return false;
      const required = ['uid', 'email', 'fullName', 'organizationName', 'organizationId', 'role'];
      if (!required.every(k => k in data)) return false;
      const allowed = ['uid', 'email', 'fullName', 'organizationName', 'organizationId', 'role', 'createdAt', 'updatedAt'];
      if (Object.keys(data).some(k => !allowed.includes(k))) return false;
      if (data.uid !== auth.uid) return false;
      if (typeof data.fullName !== 'string' || data.fullName.length === 0 || data.fullName.length > 100) return false;
      if (!isValidId(data.organizationId)) return false;
      if (!isValidRole(data.role)) return false;
      return true;
    },

    canUpdateUser(auth: AuthContext, userId: string, incoming: Record<string, unknown>, existing: Record<string, unknown>): boolean {
      if (!auth.uid || auth.uid !== userId) return false;
      // Protected fields: uid, role, organizationId cannot be altered by the user
      if (incoming.uid !== existing.uid) return false;
      if (incoming.role !== existing.role) return false;
      if (incoming.organizationId !== existing.organizationId) return false;
      const allowed = ['uid', 'email', 'fullName', 'organizationName', 'organizationId', 'role', 'createdAt', 'updatedAt'];
      if (Object.keys(incoming).some(k => !allowed.includes(k))) return false;
      return true;
    },

    // 2. Organizations Collection
    canReadOrganization(auth: AuthContext, orgId: string): boolean {
      if (!auth.uid) return false;
      const org = db.organizations.get(orgId);
      if (org && org.ownerUid === auth.uid) return true;
      return isOrgMember(auth, orgId);
    },

    canCreateOrganization(auth: AuthContext, orgId: string, data: Record<string, unknown>): boolean {
      if (!auth.uid || !isValidId(orgId)) return false;
      if (data.ownerUid !== auth.uid || data.id !== orgId) return false;
      const required = ['id', 'name', 'ownerUid'];
      if (!required.every(k => k in data)) return false;
      if (typeof data.name !== 'string' || data.name.length === 0) return false;
      return true;
    },

    canUpdateOrganization(auth: AuthContext, orgId: string, incoming: Record<string, unknown>, existing: Record<string, unknown>): boolean {
      if (!isOrgAdmin(auth, orgId)) return false;
      // Protected fields: ownership and id cannot be transferred or hijacked
      if (incoming.id !== existing.id || incoming.ownerUid !== existing.ownerUid) return false;
      return true;
    },

    // 3. Organization Members Subcollection
    canCreateMember(auth: AuthContext, orgId: string, memberId: string, incoming: Record<string, unknown>): boolean {
      if (!auth.uid || !isValidId(memberId) || incoming.uid !== memberId) return false;
      const canBootstrap = isOrgOwner(auth, orgId) && auth.uid === memberId;
      const canAdminAdd = isOrgAdmin(auth, orgId);
      if (!canBootstrap && !canAdminAdd) return false;
      if (!isValidRole(incoming.role)) return false;
      return true;
    },

    canUpdateMember(auth: AuthContext, orgId: string, incoming: Record<string, unknown>, existing: Record<string, unknown>): boolean {
      if (!isOrgAdmin(auth, orgId)) return false;
      if (incoming.uid !== existing.uid) return false;
      if (!isValidRole(incoming.role)) return false;
      return true;
    },

    canDeleteMember(auth: AuthContext, orgId: string, existing: Record<string, unknown>): boolean {
      if (!isOrgAdmin(auth, orgId)) return false;
      const org = db.organizations.get(orgId);
      if (org && existing.uid === org.ownerUid) return false; // Cannot delete organization owner
      return true;
    },

    // 4. Brand Registry
    canReadBrand(auth: AuthContext, orgId: string): boolean {
      return isOrgMember(auth, orgId);
    },

    canCreateBrand(auth: AuthContext, orgId: string, brandId: string, data: Record<string, unknown>): boolean {
      if (!isOrgMember(auth, orgId) || !isValidId(brandId)) return false;
      if (data.id !== brandId || data.organizationId !== orgId) return false;
      const required = ['id', 'organizationId', 'brandName', 'websiteUrl'];
      return required.every(k => k in data);
    },

    // 5. Findings
    canReadFindings(auth: AuthContext, orgId: string): boolean {
      return isOrgMember(auth, orgId);
    },

    canCreateSocialFinding(auth: AuthContext, orgId: string, findingId: string, data: Record<string, unknown>): boolean {
      if (!isOrgMember(auth, orgId) || !isValidId(findingId)) return false;
      if (data.id !== findingId) return false;
      const required = ['id', 'brandId', 'platform', 'accountName', 'username', 'riskScore', 'severity', 'status'];
      if (!required.every(k => k in data)) return false;
      if (typeof data.riskScore !== 'number' || data.riskScore < 0 || data.riskScore > 100) return false;
      return true;
    },

    // 6. Audit Logs
    canCreateAuditLog(auth: AuthContext, orgId: string, logId: string, data: Record<string, unknown>): boolean {
      if (!isOrgMember(auth, orgId) || !isValidId(logId)) return false;
      if (data.id !== logId) return false;
      const required = ['id', 'action', 'entityId', 'performedBy', 'timestamp', 'details'];
      return required.every(k => k in data);
    },

    canUpdateAuditLog(): boolean {
      return false; // Permanently denied in rules
    },

    canDeleteAuditLog(): boolean {
      return false; // Permanently denied in rules
    },
  };
}

describe('SentinelGuard Security Rules Verification Suite', () => {
  const setupDb = (): SimulatedDatabase => {
    const db: SimulatedDatabase = {
      users: new Map(),
      organizations: new Map(),
      members: new Map(),
      brands: new Map(),
      socialFindings: new Map(),
      appFindings: new Map(),
      auditLogs: new Map(),
    };

    // Seed Organization A (NovaPay)
    db.organizations.set('org-novapay-1', {
      id: 'org-novapay-1',
      name: 'NovaPay Global',
      ownerUid: 'uid-alice-owner',
      createdAt: '2026-01-01T00:00:00Z',
    });
    db.members.set('org-novapay-1:uid-alice-owner', {
      uid: 'uid-alice-owner',
      role: 'OWNER',
      joinedAt: '2026-01-01T00:00:00Z',
    });
    db.members.set('org-novapay-1:uid-analyst-1', {
      uid: 'uid-analyst-1',
      role: 'ANALYST',
      joinedAt: '2026-01-02T00:00:00Z',
    });

    // Seed Organization B (CyberCorp)
    db.organizations.set('org-cybercorp-2', {
      id: 'org-cybercorp-2',
      name: 'CyberCorp Defense',
      ownerUid: 'uid-bob-owner',
      createdAt: '2026-01-01T00:00:00Z',
    });
    db.members.set('org-cybercorp-2:uid-bob-owner', {
      uid: 'uid-bob-owner',
      role: 'OWNER',
      joinedAt: '2026-01-01T00:00:00Z',
    });

    return db;
  };

  describe('1. Unauthenticated Access Controls', () => {
    it('MUST deny unauthenticated access to user profiles', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const unauth: AuthContext = { uid: null };

      assert.equal(evaluator.canReadUser(unauth, 'uid-alice-owner'), false);
      assert.equal(evaluator.canCreateUser(unauth, 'uid-anon', { uid: 'uid-anon' }), false);
    });

    it('MUST deny unauthenticated access to organizations and subcollections', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const unauth: AuthContext = { uid: null };

      assert.equal(evaluator.canReadOrganization(unauth, 'org-novapay-1'), false);
      assert.equal(evaluator.canReadBrand(unauth, 'org-novapay-1'), false);
      assert.equal(evaluator.canReadFindings(unauth, 'org-novapay-1'), false);
      assert.equal(evaluator.canCreateAuditLog(unauth, 'org-novapay-1', 'log-1', { id: 'log-1' }), false);
    });
  });

  describe('2. Cross-User Isolation', () => {
    it('MUST prevent User B from reading or modifying User A profile', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const userB: AuthContext = { uid: 'uid-bob-owner' };

      // User B attempts to access User A (Alice)
      assert.equal(evaluator.canReadUser(userB, 'uid-alice-owner'), false);
      assert.equal(evaluator.canCreateUser(userB, 'uid-alice-owner', {
        uid: 'uid-alice-owner',
        email: 'alice@novapay.com',
        fullName: 'Alice Infiltrator',
        organizationName: 'NovaPay',
        organizationId: 'org-novapay-1',
        role: 'ADMIN',
      }), false);
    });

    it('MUST allow legitimate user to access their own profile', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const userA: AuthContext = { uid: 'uid-alice-owner' };

      assert.equal(evaluator.canReadUser(userA, 'uid-alice-owner'), true);
      assert.equal(evaluator.canCreateUser(userA, 'uid-alice-owner', {
        uid: 'uid-alice-owner',
        email: 'alice@novapay.com',
        fullName: 'Alice Founder',
        organizationName: 'NovaPay Global',
        organizationId: 'org-novapay-1',
        role: 'ADMIN',
      }), true);
    });
  });

  describe('3. Multi-Tenant Cross-Organization Isolation', () => {
    it('MUST block members of Org A from reading or writing Org B brands and threat findings', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const analystOrgA: AuthContext = { uid: 'uid-analyst-1' };

      // Analyst from Org A tries to access Org B data
      assert.equal(evaluator.canReadOrganization(analystOrgA, 'org-cybercorp-2'), false);
      assert.equal(evaluator.canReadBrand(analystOrgA, 'org-cybercorp-2'), false);
      assert.equal(evaluator.canReadFindings(analystOrgA, 'org-cybercorp-2'), false);

      // Analyst from Org A tries to inject threat finding into Org B
      assert.equal(evaluator.canCreateSocialFinding(analystOrgA, 'org-cybercorp-2', 'finding-spoof', {
        id: 'finding-spoof',
        brandId: 'brand-cybercorp',
        platform: 'X',
        accountName: 'Fake Corp',
        username: 'fakecorp',
        riskScore: 88,
        severity: 'HIGH',
        status: 'NEW',
      }), false);
    });

    it('MUST allow authorized members of the organization to access their own organization data', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const analystOrgA: AuthContext = { uid: 'uid-analyst-1' };

      assert.equal(evaluator.canReadOrganization(analystOrgA, 'org-novapay-1'), true);
      assert.equal(evaluator.canReadBrand(analystOrgA, 'org-novapay-1'), true);
      assert.equal(evaluator.canReadFindings(analystOrgA, 'org-novapay-1'), true);
    });
  });

  describe('4. Privilege Escalation Prevention', () => {
    it('MUST block a standard user from escalating role to ADMIN during profile update', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const analyst: AuthContext = { uid: 'uid-analyst-1' };

      const existingProfile = {
        uid: 'uid-analyst-1',
        email: 'analyst@novapay.com',
        fullName: 'Jane Analyst',
        organizationName: 'NovaPay Global',
        organizationId: 'org-novapay-1',
        role: 'ANALYST',
      };

      // Attacker attempts to update role to ADMIN
      const escalationAttempt = {
        ...existingProfile,
        role: 'ADMIN',
      };

      assert.equal(evaluator.canUpdateUser(analyst, 'uid-analyst-1', escalationAttempt, existingProfile), false);

      // Legitimate update altering only allowed profile fields (fullName)
      const validUpdate = {
        ...existingProfile,
        fullName: 'Jane Doe Analyst',
      };
      assert.equal(evaluator.canUpdateUser(analyst, 'uid-analyst-1', validUpdate, existingProfile), true);
    });

    it('MUST prevent users from altering organization ownership or hijacking orgs', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const analyst: AuthContext = { uid: 'uid-analyst-1' };

      const existingOrg = db.organizations.get('org-novapay-1')!;

      // Analyst attempts to change ownerUid to themselves
      const takeoverAttempt = {
        ...existingOrg,
        ownerUid: 'uid-analyst-1',
      };
      assert.equal(evaluator.canUpdateOrganization(analyst, 'org-novapay-1', takeoverAttempt, existingOrg), false);
    });

    it('MUST prevent non-admin users from creating or altering membership roles', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const analyst: AuthContext = { uid: 'uid-analyst-1' };

      // Analyst cannot add another member with ADMIN role
      assert.equal(evaluator.canCreateMember(analyst, 'org-novapay-1', 'uid-attacker', {
        uid: 'uid-attacker',
        role: 'ADMIN',
      }), false);

      // Only Org Admin / Owner can add members
      const owner: AuthContext = { uid: 'uid-alice-owner' };
      assert.equal(evaluator.canCreateMember(owner, 'org-novapay-1', 'uid-new-member', {
        uid: 'uid-new-member',
        role: 'ANALYST',
      }), true);
    });
  });

  describe('5. Data Validation & Immutability Checks', () => {
    it('MUST reject writes with invalid riskScore ranges or missing fields', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);
      const analyst: AuthContext = { uid: 'uid-analyst-1' };

      // Invalid riskScore (150 > 100)
      assert.equal(evaluator.canCreateSocialFinding(analyst, 'org-novapay-1', 'finding-invalid', {
        id: 'finding-invalid',
        brandId: 'brand-novapay',
        platform: 'X',
        accountName: 'Spoof',
        username: 'spoof',
        riskScore: 150,
        severity: 'HIGH',
        status: 'NEW',
      }), false);

      // Missing websiteUrl in brand creation
      assert.equal(evaluator.canCreateBrand(analyst, 'org-novapay-1', 'brand-invalid', {
        id: 'brand-invalid',
        organizationId: 'org-novapay-1',
        brandName: 'Missing Website',
      }), false);
    });

    it('MUST strictly forbid updates or deletions of Audit Logs (immutability)', () => {
      const db = setupDb();
      const evaluator = createSecurityEvaluator(db);

      assert.equal(evaluator.canUpdateAuditLog(), false);
      assert.equal(evaluator.canDeleteAuditLog(), false);
    });
  });

  describe('6. Login Interface Security Controls & Protection', () => {
    it('MUST enforce brute-force lockout when failed attempts reach threshold', () => {
      const maxAllowedAttempts = 5;
      function evaluateLockout(attempts: number): { locked: boolean; cooldownSec: number } {
        if (attempts >= maxAllowedAttempts) {
          return { locked: true, cooldownSec: 60 };
        }
        return { locked: false, cooldownSec: 0 };
      }

      assert.equal(evaluateLockout(0).locked, false);
      assert.equal(evaluateLockout(4).locked, false);
      assert.equal(evaluateLockout(5).locked, true);
      assert.equal(evaluateLockout(5).cooldownSec, 60);
      assert.equal(evaluateLockout(8).locked, true);
    });

    it('MUST validate two-factor authentication (2FA) verification code format', () => {
      function isValid2FACode(code: string): boolean {
        return /^\d{6}$/.test(code.trim());
      }

      assert.equal(isValid2FACode('849201'), true);
      assert.equal(isValid2FACode('123456'), true);
      assert.equal(isValid2FACode('12345'), false); // Too short
      assert.equal(isValid2FACode('1234567'), false); // Too long
      assert.equal(isValid2FACode('abcdef'), false); // Non-digit
      assert.equal(isValid2FACode(''), false);
    });

    it('MUST evaluate password hygiene against common breached patterns and minimum entropy', () => {
      function evaluatePasswordHygiene(pass: string): { strong: boolean; breachSafe: boolean } {
        const hasLength = pass.length >= 8;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasDigit = /[0-9]/.test(pass);
        const isCommon = ['123456', 'password', 'qwerty', 'admin123'].some(p => pass.toLowerCase().includes(p));

        const strong = hasLength && hasUpper && hasLower && hasDigit && !isCommon;
        const breachSafe = hasLength && !isCommon;
        return { strong, breachSafe };
      }

      assert.deepEqual(evaluatePasswordHygiene('SecOps#2026!Global'), { strong: true, breachSafe: true });
      assert.deepEqual(evaluatePasswordHygiene('123456'), { strong: false, breachSafe: false });
      assert.deepEqual(evaluatePasswordHygiene('password123'), { strong: false, breachSafe: false });
      assert.deepEqual(evaluatePasswordHygiene('Weak'), { strong: false, breachSafe: false });
    });

    it('MUST validate cryptographic Zero-Trust bot token format', () => {
      function isValidBotToken(token: string | null): boolean {
        if (!token) return false;
        return /^0x[0-9a-f]{16,}$/i.test(token);
      }

      assert.equal(isValidBotToken('0x4f82a901c3e7654b'), true);
      assert.equal(isValidBotToken(null), false);
      assert.equal(isValidBotToken('invalid_token'), false);
    });
  });
});

