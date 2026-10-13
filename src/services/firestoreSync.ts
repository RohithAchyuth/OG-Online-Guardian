import { db, auth } from './firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { BrandProfile, SocialFinding, AppFinding, AuditLogEntry } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[SentinelGuard Firestore Error]', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const inFlightWrites = new Map<string, Promise<void>>();
const WRITE_TIMEOUT_MS = 6000;

async function writeWithDeduplication(path: string, writeFn: () => Promise<void>): Promise<void> {
  const existing = inFlightWrites.get(path);
  if (existing) {
    try {
      await existing;
    } catch {
      // allow retry
    }
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(`Cloud Firestore write to "${path}" timed out after ${WRITE_TIMEOUT_MS}ms.`);
      (err as { code?: string }).code = 'deadline-exceeded';
      reject(err);
    }, WRITE_TIMEOUT_MS);
    if (typeof timer.unref === 'function') timer.unref();
  });

  const promise = Promise.race([writeFn(), timeoutPromise]).finally(() => {
    if (inFlightWrites.get(path) === promise) {
      inFlightWrites.delete(path);
    }
  });

  inFlightWrites.set(path, promise);
  return promise;
}

export async function syncBrandToFirestore(orgId: string, brand: BrandProfile): Promise<void> {
  if (!db) return;
  const path = `organizations/${orgId}/brands/${brand.id}`;
  try {
    await writeWithDeduplication(path, () => setDoc(doc(db!, 'organizations', orgId, 'brands', brand.id), brand, { merge: true }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncSocialFindingToFirestore(orgId: string, finding: SocialFinding): Promise<void> {
  if (!db) return;
  const path = `organizations/${orgId}/socialFindings/${finding.id}`;
  try {
    await writeWithDeduplication(path, () => setDoc(doc(db!, 'organizations', orgId, 'socialFindings', finding.id), finding, { merge: true }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncAppFindingToFirestore(orgId: string, finding: AppFinding): Promise<void> {
  if (!db) return;
  const path = `organizations/${orgId}/appFindings/${finding.id}`;
  try {
    await writeWithDeduplication(path, () => setDoc(doc(db!, 'organizations', orgId, 'appFindings', finding.id), finding, { merge: true }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncAuditLogToFirestore(orgId: string, log: AuditLogEntry): Promise<void> {
  if (!db) return;
  const path = `organizations/${orgId}/auditLogs/${log.id}`;
  try {
    await writeWithDeduplication(path, () => setDoc(doc(db!, 'organizations', orgId, 'auditLogs', log.id), log));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
