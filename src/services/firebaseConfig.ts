import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseDiagnostics {
  isConfigured: boolean;
  projectId: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  hasApiKey: boolean;
  missingKeys: string[];
  currentHostname: string;
}

// Clean leading/trailing quotes and whitespace from environment variables
const sanitizeEnv = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

const envSource = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {}) as Record<string, string | undefined>;

// Explicit static reads ensure Vite's compiler properly replaces import.meta.env variables in client builds
// while optional chaining gracefully falls back to process.env during Node.js execution / SSR
export const firebaseConfig = {
  apiKey: sanitizeEnv(import.meta?.env?.VITE_FIREBASE_API_KEY ?? envSource.VITE_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN ?? envSource.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(import.meta?.env?.VITE_FIREBASE_PROJECT_ID ?? envSource.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET ?? envSource.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ?? envSource.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(import.meta?.env?.VITE_FIREBASE_APP_ID ?? envSource.VITE_FIREBASE_APP_ID),
};

const requiredKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

export const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
export const isFirebaseConfigured = missingKeys.length === 0;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    // Ensure Firebase App is initialized as a strict singleton
    const existingApps = getApps();
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
    // Ensure Auth and Firestore instances are singletons tied to this app instance
    auth = getAuth(app);
    if (typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence).catch((persistErr) => {
        console.warn('[SentinelGuard] Could not set browserLocalPersistence:', persistErr);
      });
    }
    db = getFirestore(app);
    console.info(`[SentinelGuard] Initialized Firebase singleton for project: ${firebaseConfig.projectId}`);
  } catch (err) {
    console.warn('[SentinelGuard] Firebase initialization error:', err);
  }
} else {
  console.info('[SentinelGuard] Incomplete Firebase configuration. Missing environment variables:', missingKeys);
}

export function getFirebaseDiagnostics(): FirebaseDiagnostics {
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return {
    isConfigured: isFirebaseConfigured,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    hasApiKey: Boolean(firebaseConfig.apiKey),
    missingKeys: missingKeys.map((k) => `VITE_FIREBASE_${k.toUpperCase()}`),
    currentHostname,
  };
}

// Alias for backwards compatibility across existing components
export const getFirebaseStatus = getFirebaseDiagnostics;

export function getFirebaseConsoleLinks() {
  const proj = firebaseConfig.projectId || 'your-project';
  return {
    authOverview: `https://console.firebase.google.com/project/${proj}/authentication`,
    signInProviders: `https://console.firebase.google.com/project/${proj}/authentication/providers`,
    authorizedDomains: `https://console.firebase.google.com/project/${proj}/authentication/settings`,
    firestoreRules: `https://console.firebase.google.com/project/${proj}/firestore/rules`,
  };
}

export { app, auth, db };
