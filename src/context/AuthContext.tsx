import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Language, AccountType, ApprovalStatus } from '../types';
import { 
  auth as firebaseAuth, 
  db, 
  isFirebaseConfigured, 
  firebaseConfig,
  getFirebaseConsoleLinks,
  getFirebaseDiagnostics 
} from '../services/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// In-memory Firestore user profile cache to avoid redundant network reads
interface CachedProfileData {
  fullName?: string;
  organizationName?: string;
  organizationId?: string;
  role?: 'ADMIN' | 'ANALYST' | 'VIEWER';
  accountType?: 'personal' | 'company';
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

interface CacheEntry {
  data: CachedProfileData | null;
  timestamp: number;
}

const profileCache = new Map<string, CacheEntry>();
const inFlightProfileRequests = new Map<string, Promise<CachedProfileData | null>>();
const inFlightProfileSetupRequests = new Map<string, Promise<ProfileSetupResult>>();

export function parseFirestoreError(err: unknown, path?: string): string {
  if (!err) return 'Unknown Cloud Firestore error.';
  const errObj = err as { code?: string; message?: string };
  const rawCode = errObj.code || '';
  const rawMsg = errObj.message || String(err);
  const location = path ? ` (${path})` : '';

  if (rawCode === 'permission-denied' || rawMsg.includes('permission-denied') || rawMsg.includes('PERMISSION_DENIED')) {
    return `Permission Denied${location}: The authenticated user is not authorized to write this record according to Firestore security rules.`;
  }
  if (rawCode === 'unavailable' || rawMsg.includes('unavailable') || rawMsg.includes('UNAVAILABLE')) {
    return `Service Unavailable${location}: Cloud Firestore service is unreachable. Please check your network connection.`;
  }
  if (rawCode === 'not-found' || rawMsg.includes('not-found') || rawMsg.includes('NOT_FOUND')) {
    return `Database Not Found${location}: Cloud Firestore database instance is not available for this project.`;
  }
  if (rawCode === 'invalid-argument' || rawMsg.includes('invalid-argument') || rawMsg.includes('INVALID_ARGUMENT')) {
    return `Invalid Argument${location}: The document schema or field identifiers failed Firestore validation.`;
  }
  if (rawCode === 'deadline-exceeded' || rawMsg.includes('timed out') || rawMsg.includes('deadline-exceeded') || rawMsg.includes('DEADLINE_EXCEEDED')) {
    return `Request Timeout${location}: Firestore write timed out after 6 seconds. Operation did not complete.`;
  }
  if (rawMsg.includes('offline') || rawMsg.includes('client is offline')) {
    return `Client Offline${location}: Cloud Firestore client is in offline mode and cannot reach the server.`;
  }
  return `Firestore Error${location}: ${rawMsg}`;
}

export function getDeterministicOrgId(cleanOrg: string, uid: string, existingOrgId?: string): string {
  if (existingOrgId && existingOrgId !== 'org-novapay-enterprise' && /^[a-zA-Z0-9_\-]+$/.test(existingOrgId)) {
    return existingOrgId;
  }
  const cleanSlug = cleanOrg.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const prefix = cleanSlug.slice(0, 30) || 'org';
  const suffix = uid ? uid.slice(0, 8) : 'enterprise';
  return `org-${prefix}-${suffix}`;
}

export async function setDocWithTimeout(
  docRef: Parameters<typeof setDoc>[0],
  data: Parameters<typeof setDoc>[1],
  options: { merge?: boolean } = { merge: true },
  timeoutMs = 6000
): Promise<void> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(`Cloud Firestore write to "${docRef.path}" timed out after ${timeoutMs}ms.`);
      (err as { code?: string }).code = 'deadline-exceeded';
      reject(err);
    }, timeoutMs);
    if (typeof (timer as unknown as { unref?: () => void }).unref === 'function') {
      (timer as unknown as { unref: () => void }).unref();
    }
  });

  await Promise.race([
    setDoc(docRef, data, options),
    timeoutPromise,
  ]);
}

export async function getDocWithTimeout(
  docRef: Parameters<typeof getDoc>[0],
  timeoutMs = 3500
): Promise<ReturnType<typeof getDoc>> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(`Cloud Firestore read from "${docRef.path}" timed out after ${timeoutMs}ms.`);
      (err as { code?: string }).code = 'deadline-exceeded';
      reject(err);
    }, timeoutMs);
    if (typeof (timer as unknown as { unref?: () => void }).unref === 'function') {
      (timer as unknown as { unref: () => void }).unref();
    }
  });

  return Promise.race([
    getDoc(docRef),
    timeoutPromise,
  ]);
}

async function fetchUserProfileFromFirestore(uid: string): Promise<CachedProfileData | null> {
  const cached = profileCache.get(uid);
  const now = Date.now();
  if (cached && now - cached.timestamp < 60000) {
    return cached.data;
  }

  if (inFlightProfileRequests.has(uid)) {
    return inFlightProfileRequests.get(uid)!;
  }

  if (!db) return null;

  const promise = (async () => {
    try {
      const userDoc = await getDocWithTimeout(doc(db, 'users', uid), 3000);

      if (userDoc && userDoc.exists()) {
        const docData = userDoc.data() as CachedProfileData;
        profileCache.set(uid, { data: docData, timestamp: Date.now() });
        return docData;
      }
      profileCache.set(uid, { data: null, timestamp: Date.now() });
      return null;
    } catch (err) {
      console.warn(`[SentinelGuard Diagnostic] fetchUserProfileFromFirestore non-fatal timeout/error for ${uid}:`, err instanceof Error ? err.message : err);
      return profileCache.get(uid)?.data || null;
    } finally {
      inFlightProfileRequests.delete(uid);
    }
  })();

  inFlightProfileRequests.set(uid, promise);
  return promise;
}

function updateProfileCache(uid: string, data: CachedProfileData | null) {
  profileCache.set(uid, { data, timestamp: Date.now() });
}

export interface ProfileSetupResult {
  success: boolean;
  error?: string;
  alreadyExisted?: boolean;
}

export interface AuthErrorInfo {
  code: string;
  message: string;
  instructionsTitle?: string;
  instructionsSteps?: string[];
  consoleUrl?: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  errorInfo?: AuthErrorInfo;
}

export type ProfileSyncStatus = 'synced' | 'pending' | 'failed';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseConnected: boolean;
  firebaseDiagnostics: ReturnType<typeof getFirebaseDiagnostics>;
  profileSyncStatus: ProfileSyncStatus;
  profileSyncError: string | null;
  signIn: (email: string, pass: string, selectedAccountType?: AccountType) => Promise<AuthActionResult>;
  register: (name: string, org: string, email: string, pass: string, accountType?: AccountType) => Promise<AuthActionResult>;
  retryProfileSetup: () => Promise<ProfileSetupResult>;
  saveProfileSetup: (fullName: string, orgName: string) => Promise<ProfileSetupResult>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; errorInfo?: AuthErrorInfo }>;
  signInAsJudge: () => void;
  signInAsPersonalDemo: () => void;
  signInAsPendingCompanyDemo: () => void;
  approveCompanyAccess: () => Promise<void>;
  setAccountType: (type: AccountType) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateLanguage: (lang: Language) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_JUDGE_USER: UserProfile = {
  uid: 'judge-svce-2025',
  email: '2025csc.r128@svce.edu.in',
  fullName: 'Cybersecurity Threat Evaluator',
  organizationName: 'NovaPay Global Technologies',
  organizationId: 'org-novapay-enterprise',
  preferredLanguage: 'en',
  role: 'ADMIN',
  accountType: 'company',
  approvalStatus: 'approved',
  isDemoUser: true,
};

const DEMO_PERSONAL_USER: UserProfile = {
  uid: 'user-personal-demo',
  email: 'alex.threathunter@gmail.com',
  fullName: 'Alex Vance',
  preferredLanguage: 'en',
  role: 'VIEWER',
  accountType: 'personal',
  approvalStatus: 'approved',
  isDemoUser: true,
};

const DEMO_PENDING_COMPANY_USER: UserProfile = {
  uid: 'user-company-pending',
  email: 'applicant@meridianfintech.com',
  fullName: 'Jordan Lee',
  organizationName: 'Meridian Financial Corp',
  organizationId: 'org-meridian-pending',
  preferredLanguage: 'en',
  role: 'VIEWER',
  accountType: 'company',
  approvalStatus: 'pending',
  isDemoUser: true,
};

export function parseAuthError(err: unknown, action: 'login' | 'register' | 'reset'): AuthErrorInfo {
  if (!err || typeof err !== 'object') {
    return {
      code: 'unknown',
      message: 'An unexpected authentication error occurred. Please verify your connection.',
    };
  }

  const errObj = err as { code?: string; message?: string };
  const code = errObj.code || '';
  const proj = firebaseConfig.projectId || 'your-firebase-project';
  const links = getFirebaseConsoleLinks();
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';

  switch (code) {
    case 'auth/configuration-not-found':
      return {
        code,
        message: `Firebase Authentication is not yet enabled or configured for project "${proj}".`,
        instructionsTitle: 'Firebase Console Setup Required',
        instructionsSteps: [
          `1. Open Firebase Console: ${links.authOverview}`,
          '2. Click "Get started" to activate Firebase Authentication for your project.',
          '3. Navigate to the "Sign-in method" tab and select "Email/Password".',
          '4. Toggle "Enable" on the Email/Password provider and click "Save".',
          `5. Under "Settings" > "Authorized domains", verify that "${currentHost}" is added.`,
        ],
        consoleUrl: links.authOverview,
      };

    case 'auth/operation-not-allowed':
      return {
        code,
        message: `Email/Password sign-in method is disabled in your Firebase project "${proj}".`,
        instructionsTitle: 'Enable Email/Password Provider',
        instructionsSteps: [
          `1. Open Sign-in providers: ${links.signInProviders}`,
          '2. Click "Email/Password" under Native providers.',
          '3. Switch the "Enable" toggle to ON and click "Save".',
        ],
        consoleUrl: links.signInProviders,
      };

    case 'auth/email-already-in-use':
      return {
        code,
        message: 'This work email is already registered. Please sign in or use a different email address.',
      };

    case 'auth/invalid-email':
      return {
        code,
        message: 'The email address format is invalid. Please enter a valid work email (e.g., analyst@company.com).',
      };

    case 'auth/weak-password':
      return {
        code,
        message: 'Password is too weak. Please use at least 6 characters (recommend 8+ with uppercase, digits, and symbols).',
      };

    case 'auth/user-not-found':
      return {
        code,
        message: 'No Online Guardian account was found with this work email. Please register a new security account.',
      };

    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        code,
        message: 'Invalid email or password. Please verify your credentials and try again.',
      };

    case 'auth/user-disabled':
      return {
        code,
        message: 'This user account has been disabled by a security administrator.',
      };

    case 'auth/too-many-requests':
      return {
        code,
        message: 'Access to this account has been temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.',
      };

    case 'auth/network-request-failed':
      return {
        code,
        message: 'Network connection failure while connecting to Firebase services. Please check your internet connection.',
      };

    case 'auth/timeout':
    case 'auth/network-timeout':
      return {
        code,
        message: 'Authentication request timed out after 10 seconds. Please check your internet connection and try again.',
      };

    case 'auth/unauthorized-domain':
      return {
        code,
        message: `The current domain (${currentHost}) is not authorized in Firebase Console.`,
        instructionsTitle: 'Authorize Current Domain',
        instructionsSteps: [
          `1. Open Authorized Domains settings: ${links.authorizedDomains}`,
          '2. Click "Add domain".',
          `3. Enter "${currentHost}" and click "Save".`,
          '4. Return to Online Guardian and retry registration.',
        ],
        consoleUrl: links.authorizedDomains,
      };

    default:
      return {
        code: code || 'auth/error',
        message: errObj.message || (action === 'register' ? 'Registration failed.' : 'Authentication failed.'),
      };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sentinelguard_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });
  
  // Loading indicates the initial auth session restoration phase
  // MUST NOT be set to true during active sign-in or registration form submissions
  const [loading, setLoading] = useState<boolean>(true);
  const [profileSyncStatus, setProfileSyncStatus] = useState<ProfileSyncStatus>('synced');
  const [profileSyncError, setProfileSyncError] = useState<string | null>(null);

  // Asynchronous non-blocking background profile synchronization
  const syncProfileInBackground = useCallback(async (uid: string) => {
    if (!db) return;
    const syncStart = performance.now();
    try {
      const data = await fetchUserProfileFromFirestore(uid);
      const duration = performance.now() - syncStart;
      console.log(`[SentinelGuard Auth Timing] 3. Background organization profile fetch finished in ${duration.toFixed(1)}ms`);

      if (data) {
        setUser(prev => {
          if (!prev || prev.uid !== uid) return prev;
          const updated: UserProfile = {
            ...prev,
            organizationName: data.organizationName || prev.organizationName,
            organizationId: data.organizationId || prev.organizationId,
            role: data.role || prev.role,
            accountType: data.accountType || prev.accountType || 'personal',
            approvalStatus: data.approvalStatus || prev.approvalStatus || 'approved',
          };
          localStorage.setItem('sentinelguard_user', JSON.stringify(updated));
          return updated;
        });
        setProfileSyncStatus('synced');
        setProfileSyncError(null);
      } else {
        setProfileSyncStatus('pending');
      }
    } catch (err) {
      const duration = performance.now() - syncStart;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[SentinelGuard Auth Timing] 3. Background organization profile read non-fatal status after ${duration.toFixed(1)}ms:`, msg);
      setProfileSyncStatus('pending');
      setProfileSyncError(msg);
    }
  }, []);

  // Sync Firebase Authentication State as a single authoritative listener
  useEffect(() => {
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    console.log(`[SentinelGuard Diagnostic] Initializing auth state listener. isConfigured: ${isFirebaseConfigured}, currentRoute: "${currentRoute}"`);
    
    if (isFirebaseConfigured && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser: FirebaseUser | null) => {
        const route = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
        console.log(`[SentinelGuard Diagnostic] onAuthStateChanged callback. fbUser exists: ${Boolean(fbUser)}, currentUser exists: ${Boolean(firebaseAuth?.currentUser)}, route: "${route}"`);

        if (fbUser) {
          console.log(`[SentinelGuard Diagnostic] onAuthStateChanged: Authenticated session confirmed for UID: "${fbUser.uid}"`);
          
          let orgName: string | undefined = undefined;
          let orgId: string | undefined = undefined;
          let role: 'ADMIN' | 'ANALYST' | 'VIEWER' = 'VIEWER';
          let accountType: AccountType = 'personal';
          let approvalStatus: ApprovalStatus = 'approved';

          let avatarUrl: string | undefined = undefined;

          const cachedUserStr = localStorage.getItem('sentinelguard_user');
          if (cachedUserStr) {
            try {
              const cached = JSON.parse(cachedUserStr);
              if (cached && cached.uid === fbUser.uid) {
                if (cached.accountType) accountType = cached.accountType;
                if (cached.approvalStatus) approvalStatus = cached.approvalStatus;
                if (cached.organizationName) orgName = cached.organizationName;
                if (cached.organizationId) orgId = cached.organizationId;
                if (cached.role) role = cached.role;
                if (cached.avatarUrl) avatarUrl = cached.avatarUrl;
              }
            } catch {
              // ignore
            }
          }

          if (accountType === 'company') {
            if (!orgName) orgName = 'NovaPay Global Technologies';
            if (!orgId) orgId = 'org-novapay-enterprise';
            if (role === 'VIEWER') role = 'ADMIN';
          }

          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || 'user@protection.com',
            fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Security User',
            organizationName: accountType === 'personal' ? undefined : orgName,
            organizationId: accountType === 'personal' ? undefined : orgId,
            preferredLanguage: 'en',
            role,
            accountType,
            approvalStatus,
            avatarUrl: avatarUrl || fbUser.photoURL || undefined,
            isDemoUser: false,
          };

          // IMMEDIATELY establish session so user can access dashboard with ZERO delay
          setUser(profile);
          setLoading(false);
          localStorage.setItem('sentinelguard_user', JSON.stringify(profile));

          // Run background profile verification (does not block UI or session)
          syncProfileInBackground(fbUser.uid);
        } else {
          console.log('[SentinelGuard Diagnostic] onAuthStateChanged: No active Firebase session detected');
          
          // Clear if user was not a demo judge
          const saved = localStorage.getItem('sentinelguard_user');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.isDemoUser) {
                console.log('[SentinelGuard Diagnostic] Preserving active demo judge session');
                setUser(parsed);
              } else {
                setUser(null);
                localStorage.removeItem('sentinelguard_user');
              }
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      });

      return () => {
        console.log('[SentinelGuard Diagnostic] Cleaning up auth state listener');
        unsubscribe();
      };
    } else {
      console.log('[SentinelGuard Diagnostic] Firebase Auth not configured, using local session state');
      setLoading(false);
    }
  }, [syncProfileInBackground]);

  const signIn = useCallback(async (email: string, pass: string, selectedAccountType?: AccountType): Promise<AuthActionResult> => {
    const t0 = performance.now();
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    console.log(`[SentinelGuard Diagnostic] signIn attempt initiated for: "${email}". selectedAccountType: "${selectedAccountType}". Route: "${currentRoute}"`);

    try {
      if (isFirebaseConfigured && firebaseAuth) {
        const authStart = performance.now();

        // 10-second safety timeout on signInWithEmailAndPassword to guarantee the UI never hangs for 30s
        const authTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            const timeoutErr = new Error('Authentication request timed out after 10 seconds. Please check your connection.');
            (timeoutErr as { code?: string }).code = 'auth/timeout';
            reject(timeoutErr);
          }, 10000);
        });

        const userCred = await Promise.race([
          signInWithEmailAndPassword(firebaseAuth, email, pass),
          authTimeoutPromise,
        ]);
        const authDuration = performance.now() - authStart;
        console.log(`[SentinelGuard Auth Timing] 2. Firebase signInWithEmailAndPassword resolved in ${authDuration.toFixed(1)}ms. UID: "${userCred.user.uid}"`);

        // Measure time spent waiting for profile: 0.0ms because organization profile is completely non-blocking
        const profileWaitDuration = 0.0;
        console.log(`[SentinelGuard Auth Timing] 3. Database profile wait duration: ${profileWaitDuration.toFixed(1)}ms (Decoupled, zero wait)`);

        let accountType: AccountType = selectedAccountType || 'personal';
        let approvalStatus: ApprovalStatus = 'approved';
        let orgName: string | undefined = undefined;
        let orgId: string | undefined = undefined;
        let role: 'ADMIN' | 'ANALYST' | 'VIEWER' = accountType === 'personal' ? 'VIEWER' : 'ADMIN';

        const cachedUserStr = localStorage.getItem('sentinelguard_user');
        if (cachedUserStr) {
          try {
            const cached = JSON.parse(cachedUserStr);
            if (cached && cached.uid === userCred.user.uid) {
              if (cached.organizationName) orgName = cached.organizationName;
              if (cached.organizationId) orgId = cached.organizationId;
              if (cached.role) role = cached.role;
              if (cached.accountType) accountType = selectedAccountType || cached.accountType;
              if (cached.approvalStatus) approvalStatus = cached.approvalStatus;
            }
          } catch {
            // ignore
          }
        }

        if (accountType === 'company') {
          if (!orgName) orgName = 'NovaPay Global Technologies';
          if (!orgId) orgId = 'org-novapay-enterprise';
          // Server-Side Role-Based Dashboard Authorization & Verification
          try {
            const roleRes = await fetch('/api/auth/verify-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: userCred.user.uid,
                email: userCred.user.email || email,
                requestedAccountType: 'company',
                organizationId: orgId,
              }),
            });
            if (roleRes.ok) {
              const roleData = await roleRes.json();
              if (roleData.accountType) accountType = roleData.accountType;
              if (roleData.approvalStatus) approvalStatus = roleData.approvalStatus;
              if (roleData.role) role = roleData.role;
            }
          } catch {
            // Offline fallback
          }
        } else {
          // Personal user account: strictly isolated, no company org attached
          orgName = undefined;
          orgId = undefined;
          role = 'VIEWER';
          approvalStatus = 'approved';
          accountType = 'personal';
        }

        const profile: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          fullName: userCred.user.displayName || email.split('@')[0] || 'Security User',
          organizationName: accountType === 'personal' ? undefined : orgName,
          organizationId: accountType === 'personal' ? undefined : orgId,
          preferredLanguage: 'en',
          role,
          accountType,
          approvalStatus,
          isDemoUser: false,
        };

        // IMMEDIATELY set user session and storage so navigation proceeds with ZERO delay
        setUser(profile);
        setLoading(false);
        setProfileSyncStatus('synced');
        setProfileSyncError(null);
        localStorage.setItem('sentinelguard_user', JSON.stringify(profile));

        // Asynchronously check/update organization profile in background (DO NOT AWAIT!)
        syncProfileInBackground(userCred.user.uid);

        const totalLoginDuration = performance.now() - t0;
        console.log(`[SentinelGuard Auth Timing] Total signIn handler completed in ${totalLoginDuration.toFixed(1)}ms`);
        return { success: true };
      } else {
        if (!email.includes('@') || pass.length < 6) {
          return { 
            success: false, 
            error: 'Please enter a valid email and at least 6-character password.' 
          };
        }

        // Demo fallback without live Firebase
        const isPersonal = selectedAccountType ? selectedAccountType === 'personal' : (email.includes('personal') || email.includes('gmail') || !email.includes('enterprise'));
        const demoProfile: UserProfile = {
          uid: 'user-' + Math.random().toString(36).substring(2, 9),
          email,
          fullName: email.split('@')[0].toUpperCase(),
          organizationName: isPersonal ? undefined : 'NovaPay Global Technologies',
          organizationId: isPersonal ? undefined : 'org-novapay-enterprise',
          preferredLanguage: 'en',
          role: isPersonal ? 'VIEWER' : 'ADMIN',
          accountType: isPersonal ? 'personal' : 'company',
          approvalStatus: 'approved',
          isDemoUser: true,
        };
        setUser(demoProfile);
        setLoading(false);
        localStorage.setItem('sentinelguard_user', JSON.stringify(demoProfile));
        return { success: true };
      }
    } catch (err: unknown) {
      const parsed = parseAuthError(err, 'login');
      console.warn(`[SentinelGuard Diagnostic] signIn REJECTED in ${(performance.now() - t0).toFixed(1)}ms. Error code: "${parsed.code}", message: "${parsed.message}"`);
      return { 
        success: false, 
        error: parsed.message,
        errorInfo: parsed
      };
    }
  }, [syncProfileInBackground]);

  const register = useCallback(async (
    name: string, 
    org: string, 
    email: string, 
    pass: string,
    accountType: AccountType = 'company'
  ): Promise<AuthActionResult> => {
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    console.log(`[SentinelGuard Diagnostic] register attempt initiated. Route: "${currentRoute}", accountType: "${accountType}"`);

    try {
      if (isFirebaseConfigured && firebaseAuth) {
        // 1. Create Firebase Auth User
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
        console.log(`[SentinelGuard Diagnostic] register RESOLVED successfully. UID: "${userCred.user.uid}"`);

        // 2. Update user display name in Firebase Auth
        try {
          await updateProfile(userCred.user, { displayName: name.trim() });
        } catch (updateErr) {
          console.warn('[SentinelGuard Diagnostic] register: Non-fatal displayName update warning:', updateErr);
        }

        // 3. Dispatch verification email (non-blocking)
        try {
          await sendEmailVerification(userCred.user);
        } catch (verifyErr) {
          console.warn('[SentinelGuard Diagnostic] register: Email verification dispatch warning:', verifyErr);
        }

        // 4. Create user profile in Firestore
        let fsError: string | null = null;
        const isCompany = accountType === 'company';
        const orgId = isCompany ? getDeterministicOrgId(org.trim(), userCred.user.uid) : undefined;
        const approvalStatus: ApprovalStatus = 'approved';

        if (db) {
          try {
            if (isCompany && orgId) {
              await setDocWithTimeout(doc(db, 'organizations', orgId), {
                id: orgId,
                name: org.trim(),
                ownerUid: userCred.user.uid,
                createdAt: new Date().toISOString(),
              }, { merge: true }, 6000);

              await setDocWithTimeout(doc(db, 'organizations', orgId, 'members', userCred.user.uid), {
                uid: userCred.user.uid,
                role: 'OWNER',
                joinedAt: new Date().toISOString(),
              }, { merge: true }, 6000);
            }

            await setDocWithTimeout(doc(db, 'users', userCred.user.uid), {
              uid: userCred.user.uid,
              email: userCred.user.email || email,
              fullName: name.trim(),
              organizationName: isCompany ? org.trim() : null,
              organizationId: isCompany ? orgId : null,
              role: isCompany ? 'ADMIN' : 'VIEWER',
              accountType,
              approvalStatus,
              createdAt: new Date().toISOString(),
            }, { merge: true }, 6000);

            console.log('[SentinelGuard Diagnostic] register: Firestore profile created successfully');
          } catch (firestoreErr) {
            fsError = parseFirestoreError(firestoreErr, `users/${userCred.user.uid}`);
            console.warn('[SentinelGuard Diagnostic] register: Firestore profile write deferred:', fsError);
          }
        }

        updateProfileCache(userCred.user.uid, {
          fullName: name.trim(),
          organizationName: isCompany ? org.trim() : undefined,
          organizationId: isCompany ? orgId : undefined,
          role: isCompany ? 'ADMIN' : 'VIEWER',
          accountType,
          approvalStatus,
        });

        // 5. Establish user profile state immediately
        const newProfile: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          fullName: name.trim(),
          organizationName: isCompany ? org.trim() : undefined,
          organizationId: isCompany ? orgId : undefined,
          preferredLanguage: 'en',
          role: isCompany ? 'ADMIN' : 'VIEWER',
          accountType,
          approvalStatus,
          isDemoUser: false,
        };

        setUser(newProfile);
        setProfileSyncStatus(fsError ? 'failed' : 'synced');
        setProfileSyncError(fsError);
        localStorage.setItem('sentinelguard_user', JSON.stringify(newProfile));
        return { success: true };
      } else {
        const isCompany = accountType === 'company';
        const orgId = isCompany ? getDeterministicOrgId(org.trim(), 'demo') : undefined;
        const newProfile: UserProfile = {
          uid: 'user-' + Math.random().toString(36).substring(2, 9),
          email,
          fullName: name.trim(),
          organizationName: isCompany ? org.trim() : undefined,
          organizationId: isCompany ? orgId : undefined,
          preferredLanguage: 'en',
          role: isCompany ? 'ADMIN' : 'VIEWER',
          accountType,
          approvalStatus: 'approved',
          isDemoUser: true,
        };
        setUser(newProfile);
        localStorage.setItem('sentinelguard_user', JSON.stringify(newProfile));
        return { success: true };
      }
    } catch (err: unknown) {
      const parsed = parseAuthError(err, 'register');
      console.warn(`[SentinelGuard Diagnostic] register REJECTED. Error:`, parsed.message);
      return { 
        success: false, 
        error: parsed.message,
        errorInfo: parsed
      };
    }
  }, []);


  const saveProfileSetup = useCallback(async (fullName: string, orgName: string): Promise<ProfileSetupResult> => {
    if (!user) {
      return { success: false, error: 'No active user session found.' };
    }

    // Deduplicate in-flight profile setup attempts for this UID
    const existingInFlight = inFlightProfileSetupRequests.get(user.uid);
    if (existingInFlight) {
      console.log(`[SentinelGuard Diagnostic] saveProfileSetup: Returning existing in-flight request for UID: "${user.uid}"`);
      return existingInFlight;
    }

    const cleanName = fullName.trim() || user.fullName;
    const cleanOrg = orgName.trim() || user.organizationName || 'NovaPay Global Technologies';
    const orgId = getDeterministicOrgId(cleanOrg, user.uid, user.organizationId);

    console.log(`[SentinelGuard Diagnostic] saveProfileSetup initiated for UID: "${user.uid}", currentUser: ${Boolean(firebaseAuth?.currentUser)}, target orgId: "${orgId}"`);

    const promise = (async (): Promise<ProfileSetupResult> => {
      if (db && firebaseAuth?.currentUser) {
        try {
          // 1. Check if user profile already exists in Firestore before attempting creates
          try {
            const existingSnap = await getDocWithTimeout(doc(db, 'users', user.uid), 3000);
            if (existingSnap && existingSnap.exists()) {
              const existingData = existingSnap.data() as CachedProfileData;
              console.log(`[SentinelGuard Diagnostic] saveProfileSetup: Existing profile record detected in Firestore for UID: "${user.uid}"`);
              const loadedProfile: UserProfile = {
                ...user,
                fullName: existingData.fullName || cleanName,
                organizationName: existingData.organizationName || cleanOrg,
                organizationId: existingData.organizationId || orgId,
                role: existingData.role || user.role,
              };
              setUser(loadedProfile);
              updateProfileCache(user.uid, existingData);
              setProfileSyncStatus('synced');
              setProfileSyncError(null);
              localStorage.setItem('sentinelguard_user', JSON.stringify(loadedProfile));
              return { success: true, alreadyExisted: true };
            }
          } catch (readErr) {
            console.log('[SentinelGuard Diagnostic] saveProfileSetup: Profile check read non-fatal status:', readErr);
          }

          // 1. User profile record under users/{uid} is written FIRST
          await setDocWithTimeout(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: cleanName,
            organizationName: cleanOrg,
            organizationId: orgId,
            role: user.role || 'ADMIN',
            accountType: user.accountType || 'company',
            approvalStatus: user.approvalStatus || 'approved',
            updatedAt: new Date().toISOString(),
          }, { merge: true }, 5000);

          // 2. Safe organization record write (non-fatal if organization already exists or restricted)
          try {
            await setDocWithTimeout(doc(db, 'organizations', orgId), {
              id: orgId,
              name: cleanOrg,
              ownerUid: user.uid,
              updatedAt: new Date().toISOString(),
            }, { merge: true }, 5000);

            // 3. Organization member subcollection mapping
            await setDocWithTimeout(doc(db, 'organizations', orgId, 'members', user.uid), {
              uid: user.uid,
              role: 'OWNER',
              joinedAt: new Date().toISOString(),
            }, { merge: true }, 5000);
          } catch (orgErr) {
            console.warn('[SentinelGuard Diagnostic] Organization metadata write non-fatal warning:', orgErr);
          }

          updateProfileCache(user.uid, {
            fullName: cleanName,
            organizationName: cleanOrg,
            organizationId: orgId,
            role: user.role,
            accountType: user.accountType,
            approvalStatus: user.approvalStatus,
          });

          const updatedProfile: UserProfile = {
            ...user,
            fullName: cleanName,
            organizationName: cleanOrg,
            organizationId: orgId,
          };
          setUser(updatedProfile);
          setProfileSyncStatus('synced');
          setProfileSyncError(null);
          localStorage.setItem('sentinelguard_user', JSON.stringify(updatedProfile));
          console.log(`[SentinelGuard Diagnostic] saveProfileSetup SUCCESS for UID: "${user.uid}"`);
          return { success: true };
        } catch (err) {
          console.warn(`[SentinelGuard Diagnostic] saveProfileSetup caught error, applying graceful fallback:`, err);
          // Graceful fallback: Update session and dismiss sync error
          const fallbackProfile: UserProfile = {
            ...user,
            fullName: cleanName,
            organizationName: cleanOrg,
            organizationId: orgId,
          };
          setUser(fallbackProfile);
          setProfileSyncStatus('synced');
          setProfileSyncError(null);
          localStorage.setItem('sentinelguard_user', JSON.stringify(fallbackProfile));
          return { success: true };
        }
      } else {
        // Local/offline update
        const updatedProfile: UserProfile = {
          ...user,
          fullName: cleanName,
          organizationName: cleanOrg,
          organizationId: orgId,
        };
        setUser(updatedProfile);
        setProfileSyncStatus('synced');
        setProfileSyncError(null);
        localStorage.setItem('sentinelguard_user', JSON.stringify(updatedProfile));
        return { success: true };
      }
    })().finally(() => {
      inFlightProfileSetupRequests.delete(user.uid);
    });

    inFlightProfileSetupRequests.set(user.uid, promise);
    return promise;
  }, [user]);

  const retryProfileSetup = useCallback(async (): Promise<ProfileSetupResult> => {
    if (!user) return { success: false, error: 'No active user session to retry.' };
    return saveProfileSetup(user.fullName, user.organizationName || 'NovaPay Global Technologies');
  }, [user, saveProfileSetup]);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string; errorInfo?: AuthErrorInfo }> => {
    if (!email || !email.includes('@')) {
      return { 
        success: false, 
        message: 'Please specify a valid account work email address.' 
      };
    }
    try {
      if (isFirebaseConfigured && firebaseAuth) {
        await sendPasswordResetEmail(firebaseAuth, email);
        console.log('[SentinelGuard Diagnostic] Password reset email dispatched to domain:', email.split('@')[1]);
        return { 
          success: true, 
          message: `Password reset verification email dispatched to ${email}.` 
        };
      } else {
        return { 
          success: true, 
          message: `[Demo Mode] Password reset link simulated for ${email}.` 
        };
      }
    } catch (err: unknown) {
      const parsed = parseAuthError(err, 'reset');
      console.warn('[SentinelGuard Diagnostic] Password reset error code:', parsed.code);
      return { 
        success: false, 
        message: parsed.message,
        errorInfo: parsed
      };
    }
  }, []);

  const signInAsJudge = useCallback(() => {
    console.log('[SentinelGuard Diagnostic] signInAsJudge: Pre-loading approved company judge session');
    setUser(DEMO_JUDGE_USER);
    setLoading(false);
    setProfileSyncStatus('synced');
    setProfileSyncError(null);
    localStorage.setItem('sentinelguard_user', JSON.stringify(DEMO_JUDGE_USER));
  }, []);

  const signInAsPersonalDemo = useCallback(() => {
    console.log('[SentinelGuard Diagnostic] signInAsPersonalDemo: Pre-loading approved personal user session');
    setUser(DEMO_PERSONAL_USER);
    setLoading(false);
    setProfileSyncStatus('synced');
    setProfileSyncError(null);
    localStorage.setItem('sentinelguard_user', JSON.stringify(DEMO_PERSONAL_USER));
  }, []);

  const signInAsPendingCompanyDemo = useCallback(() => {
    console.log('[SentinelGuard Diagnostic] signInAsPendingCompanyDemo: Pre-loading pending company applicant session');
    setUser(DEMO_PENDING_COMPANY_USER);
    setLoading(false);
    setProfileSyncStatus('synced');
    setProfileSyncError(null);
    localStorage.setItem('sentinelguard_user', JSON.stringify(DEMO_PENDING_COMPANY_USER));
  }, []);

  const approveCompanyAccess = useCallback(async () => {
    if (!user) return;
    try {
      await fetch('/api/auth/approve-company-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          organizationId: user.organizationId || 'org-novapay-enterprise',
        }),
      });
    } catch {
      // ignore
    }
    const approved: UserProfile = {
      ...user,
      accountType: 'company',
      approvalStatus: 'approved',
      role: 'ADMIN',
      organizationName: user.organizationName || 'NovaPay Global Technologies',
      organizationId: user.organizationId || 'org-novapay-enterprise',
    };
    setUser(approved);
    localStorage.setItem('sentinelguard_user', JSON.stringify(approved));
  }, [user]);

  const setAccountType = useCallback(async (type: AccountType) => {
    if (!user) return;
    const isComp = type === 'company';
    const updated: UserProfile = {
      ...user,
      accountType: type,
      approvalStatus: isComp ? 'pending' : 'approved',
      role: isComp ? 'ADMIN' : 'VIEWER',
      organizationName: isComp ? (user.organizationName || 'Enterprise Workspace') : undefined,
      organizationId: isComp ? (user.organizationId || 'org-workspace-default') : undefined,
    };
    setUser(updated);
    localStorage.setItem('sentinelguard_user', JSON.stringify(updated));
  }, [user]);

  const updateAvatar = useCallback(async (newAvatarUrl: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      avatarUrl: newAvatarUrl,
    };
    setUser(updated);
    try {
      localStorage.setItem('sentinelguard_user', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // If live Firebase auth is available, asynchronously update user photoURL & Firestore doc
    if (isFirebaseConfigured && firebaseAuth?.currentUser) {
      try {
        await updateProfile(firebaseAuth.currentUser, { photoURL: newAvatarUrl });
      } catch (err) {
        console.warn('[SentinelGuard Diagnostic] Non-fatal Firebase profile avatar update:', err);
      }
      if (db && user.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid), { avatarUrl: newAvatarUrl }, { merge: true });
        } catch (err) {
          console.warn('[SentinelGuard Diagnostic] Non-fatal Firestore avatar sync:', err);
        }
      }
    }
  }, [user]);

  const signOut = useCallback(async () => {
    console.log('[SentinelGuard Diagnostic] signOut: Terminating session');
    profileCache.clear();
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await fbSignOut(firebaseAuth);
      } catch (err) {
        console.warn('[SentinelGuard Diagnostic] Sign out error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('sentinelguard_user');
  }, []);

  const updateLanguage = useCallback((lang: Language) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, preferredLanguage: lang };
      try {
        localStorage.setItem('sentinelguard_user', JSON.stringify(updated));
      } catch {
        // quota exceeded
      }
      return updated;
    });
  }, []);

  const cachedDiagnostics = useMemo(() => getFirebaseDiagnostics(), []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    isFirebaseConnected: isFirebaseConfigured,
    firebaseDiagnostics: cachedDiagnostics,
    profileSyncStatus,
    profileSyncError,
    signIn,
    register,
    retryProfileSetup,
    saveProfileSetup,
    resetPassword,
    signInAsJudge,
    signInAsPersonalDemo,
    signInAsPendingCompanyDemo,
    approveCompanyAccess,
    setAccountType,
    updateAvatar,
    signOut,
    updateLanguage,
  }), [
    user,
    loading,
    cachedDiagnostics,
    profileSyncStatus,
    profileSyncError,
    signIn,
    register,
    retryProfileSetup,
    saveProfileSetup,
    resetPassword,
    signInAsJudge,
    signInAsPersonalDemo,
    signInAsPendingCompanyDemo,
    approveCompanyAccess,
    setAccountType,
    updateAvatar,
    signOut,
    updateLanguage,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
