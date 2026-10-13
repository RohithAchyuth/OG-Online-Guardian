import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BrandProfile, 
  SocialFinding, 
  AppFinding, 
  OfficialSocialAsset, 
  OfficialAppAsset, 
  AuditLogEntry, 
  AppNotification,
  InvestigationStatus,
  SocialPlatform,
  AppPlatform,
  ScanResult
} from '../types';
import { analyzeSocialCandidate, analyzeAppCandidate } from '../engine/lookalikeEngine';
import { useAuth } from './AuthContext';
import { 
  syncBrandToFirestore, 
  syncSocialFindingToFirestore, 
  syncAppFindingToFirestore, 
  syncAuditLogToFirestore 
} from '../services/firestoreSync';
import { novaPayLogoImg } from '../assets/images';

interface BrandContextType {
  brand: BrandProfile;
  socialFindings: SocialFinding[];
  appFindings: AppFinding[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  lastScanTimestamp: string;
  isScanningSocial: boolean;
  isScanningApps: boolean;
  sensitivityThreshold: number;
  setSensitivityThreshold: (threshold: number) => void;
  updateBrandProfile: (updated: Partial<BrandProfile>) => void;
  addOfficialSocial: (asset: Omit<OfficialSocialAsset, 'id' | 'createdAt'>) => void;
  removeOfficialSocial: (id: string) => void;
  addOfficialApp: (asset: Omit<OfficialAppAsset, 'id' | 'createdAt'>) => void;
  removeOfficialApp: (id: string) => void;
  scanSocials: () => Promise<ScanResult>;
  scanApps: () => Promise<ScanResult>;
  updateSocialStatus: (id: string, newStatus: InvestigationStatus, note?: string) => void;
  updateAppStatus: (id: string, newStatus: InvestigationStatus, note?: string) => void;
  addSocialNote: (id: string, note: string) => void;
  addAppNote: (id: string, note: string) => void;
  addCustomSocialCandidate: (name: string, username: string, platform: SocialPlatform) => SocialFinding;
  addCustomAppCandidate: (appName: string, publisher: string, packageId: string, platform: AppPlatform) => AppFinding;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  exportCsvReport: () => void;
  resetToDemoDefaults: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const DEFAULT_BRAND: BrandProfile = {
  id: 'brand-novapay-101',
  organizationId: 'org-novapay-enterprise',
  brandName: 'NovaPay',
  websiteUrl: 'https://novapay.global',
  industry: 'Fintech & Digital Payments',
  country: 'United States',
  description: 'NovaPay provides enterprise-grade mobile wallet, global remittance, and payment gateway infrastructure.',
  logoUrl: novaPayLogoImg,
  approvedAliases: ['Nova Pay', 'NovaPay Global', 'NovaPay Inc.'],
  approvedKeywords: ['payments', 'digital wallet', 'remittance', 'fintech', 'checkout', 'pay'],
  officialSocials: [
    {
      id: 'soc-off-1',
      platform: 'X',
      username: 'NovaPay',
      profileUrl: 'https://x.com/NovaPay',
      verifiedBadge: true,
      notes: 'Primary global corporate communication handle',
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'soc-off-2',
      platform: 'INSTAGRAM',
      username: 'NovaPay',
      profileUrl: 'https://instagram.com/NovaPay',
      verifiedBadge: true,
      notes: 'Brand marketing and product releases',
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'soc-off-3',
      platform: 'LINKEDIN',
      username: 'NovaPay',
      profileUrl: 'https://linkedin.com/company/novapay',
      verifiedBadge: true,
      notes: 'Official enterprise careers and company updates',
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'soc-off-4',
      platform: 'FACEBOOK',
      username: 'NovaPayGlobal',
      profileUrl: 'https://facebook.com/NovaPayGlobal',
      verifiedBadge: true,
      notes: 'Customer support verified presence',
      createdAt: '2026-01-10T10:00:00Z',
    },
  ],
  officialApps: [
    {
      id: 'app-off-1',
      platform: 'ANDROID',
      appName: 'NovaPay',
      packageOrBundleId: 'com.example.novapay.demo',
      publisherName: 'NovaPay Technologies',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.example.novapay.demo',
      verified: true,
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'app-off-2',
      platform: 'IOS',
      appName: 'NovaPay - Mobile Wallet',
      packageOrBundleId: 'com.example.novapay.demo',
      publisherName: 'NovaPay Technologies',
      storeUrl: 'https://apps.apple.com/app/novapay/id159483920',
      verified: true,
      createdAt: '2026-01-15T09:00:00Z',
    },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-10-12T01:24:00Z',
};

const SEED_SOCIAL_FINDINGS: SocialFinding[] = [
  {
    id: 'soc-threat-1',
    brandId: 'brand-novapay-101',
    platform: 'X',
    accountName: 'NovaPay Support Helpdesk',
    username: 'NovaPay_HelpDesk',
    profileUrl: 'https://x.com/NovaPay_HelpDesk',
    riskScore: 88,
    severity: 'CRITICAL',
    status: 'NEW',
    detectedAt: '2026-10-11T14:32:00Z',
    similarityScore: 85,
    suspiciousIndicators: ['Deceptive support modifier attached', 'Unverified account asking for transaction IDs', 'Name similarity 85%'],
    detectionReasons: [
      { name: 'Deceptive Impersonation Keywords', score: 95, description: 'Contains high-risk targeting keywords: support, helpdesk.', weight: 0.35 },
      { name: 'High Name Similarity', score: 85, description: '85% similarity to registered brand name NovaPay.', weight: 0.35 },
      { name: 'Unverified Entity', score: 75, description: 'Lacks official platform verification badge.', weight: 0.30 },
    ],
    analystNotes: 'Flagged for urgent credential harvesting assessment. Candidate bio directs users to a third-party ticket form.',
    evidenceSummary: 'Suspected customer support impersonator soliciting transaction logs via unauthorized direct messages.',
    isSimulated: true,
  },
  {
    id: 'soc-threat-2',
    brandId: 'brand-novapay-101',
    platform: 'INSTAGRAM',
    accountName: 'N0vaPay Official Rewards',
    username: 'N0vaPayPromo',
    profileUrl: 'https://instagram.com/N0vaPayPromo',
    riskScore: 92,
    severity: 'CRITICAL',
    status: 'UNDER_REVIEW',
    detectedAt: '2026-10-10T19:15:00Z',
    similarityScore: 88,
    suspiciousIndicators: ['Homoglyph (0 substituted for o)', 'Phishing giveaway promotion', 'Unofficial bio link to external domain'],
    detectionReasons: [
      { name: 'Character Homoglyph / Typosquatting', score: 95, description: 'Intentional visual substitution: "0" in place of "o" (N0vaPay).', weight: 0.40 },
      { name: 'Deceptive Promo Keywords', score: 90, description: 'Promotes fraudulent $500 voucher rewards giveaway.', weight: 0.35 },
      { name: 'Name Similarity', score: 88, description: '88% phonetic and string similarity to NovaPay.', weight: 0.25 },
    ],
    analystNotes: 'Legal counsel notified. DM scam active on Instagram Stories targeting new cardholders.',
    evidenceSummary: 'Homoglyph phishing profile promoting fake rewards giveaways.',
    isSimulated: true,
  },
  {
    id: 'soc-threat-3',
    brandId: 'brand-novapay-101',
    platform: 'FACEBOOK',
    accountName: 'Nova Pay Cash Offers',
    username: 'NovaPayBonus',
    profileUrl: 'https://facebook.com/NovaPayBonus',
    riskScore: 76,
    severity: 'HIGH',
    status: 'CONFIRMED_SUSPICIOUS',
    detectedAt: '2026-10-09T11:40:00Z',
    similarityScore: 80,
    suspiciousIndicators: ['Separated token spelling (Nova Pay)', 'Offer modifier attached', 'Logo copycat detected'],
    detectionReasons: [
      { name: 'Brand Name Token Match', score: 80, description: 'Token separation mimics legitimate brand alias.', weight: 0.35 },
      { name: 'High-Risk Modifier', score: 85, description: 'Targeting words: bonus, offers.', weight: 0.35 },
      { name: 'Logo Visual Resemblance', score: 70, description: 'Profile graphic incorporates NovaPay shield motif.', weight: 0.30 },
    ],
    analystNotes: 'Takedown package prepared. Facebook business page created 3 days ago.',
    evidenceSummary: 'Unauthorized Facebook business page mimicking NovaPay brand styling for click fraud.',
    isSimulated: true,
  },
  {
    id: 'soc-threat-4',
    brandId: 'brand-novapay-101',
    platform: 'TIKTOK',
    accountName: 'NovaPay Official Team',
    username: 'NovaPayRealTeam',
    profileUrl: 'https://tiktok.com/@NovaPayRealTeam',
    riskScore: 68,
    severity: 'MEDIUM',
    status: 'NEW',
    detectedAt: '2026-10-08T08:22:00Z',
    similarityScore: 75,
    suspiciousIndicators: ['Added "Official" and "Real" modifiers', 'Unverified account'],
    detectionReasons: [
      { name: 'Authority Claim Modifier', score: 75, description: 'Appends "RealTeam" and "Official" without corporate authorization.', weight: 0.50 },
      { name: 'Name Similarity', score: 75, description: '75% similarity to registered brand.', weight: 0.50 },
    ],
    analystNotes: 'Awaiting video content analysis.',
    evidenceSummary: 'Unofficial TikTok handle presenting itself as the official engineering team.',
    isSimulated: true,
  },
  {
    id: 'soc-threat-5',
    brandId: 'brand-novapay-101',
    platform: 'LINKEDIN',
    accountName: 'Nova Payment Systems Inc.',
    username: 'NovaPaymentCorp',
    profileUrl: 'https://linkedin.com/company/NovaPaymentCorp',
    riskScore: 28,
    severity: 'LOW',
    status: 'FALSE_POSITIVE',
    detectedAt: '2026-10-05T16:00:00Z',
    similarityScore: 55,
    suspiciousIndicators: ['Partial lexical overlap with payment terms'],
    detectionReasons: [
      { name: 'Legitimate Independent Entity', score: 25, description: 'Independent corporate entity registered in 2014 in Delaware. Legitimate business with separate branding.', weight: 1.0 },
    ],
    analystNotes: 'Reviewed by security team: Verified separate corporate trademark. Marked as false positive to suppress future alerts.',
    evidenceSummary: 'Harmless commercial entity with distinct brand identity and valid business registration.',
    isSimulated: true,
  },
];

const SEED_APP_FINDINGS: AppFinding[] = [
  {
    id: 'app-threat-1',
    brandId: 'brand-novapay-101',
    platform: 'ANDROID',
    appName: 'NovaPay Rewards Wallet',
    publisherName: 'Apex Tech LLC',
    packageOrBundleId: 'com.novapay.rewards.cash',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.novapay.rewards.cash',
    riskScore: 89,
    severity: 'CRITICAL',
    status: 'CONFIRMED_SUSPICIOUS',
    detectedAt: '2026-10-11T16:10:00Z',
    similarityScore: 86,
    publisherMismatch: true,
    suspiciousIndicators: [
      'Publisher mismatch (Apex Tech LLC vs NovaPay Technologies)',
      'Brand stem hijacked in package ID (com.novapay.rewards.cash)',
      'High-risk wallet claim without regulatory license',
    ],
    detectionReasons: [
      { name: 'Publisher Identity Mismatch', score: 95, description: 'Published by unauthorized developer "Apex Tech LLC".', weight: 0.40 },
      { name: 'Package Identifier Hijacking', score: 90, description: 'Package stem com.novapay indicates brand spoofing.', weight: 0.35 },
      { name: 'Title Similarity', score: 86, description: '86% lexical similarity to NovaPay.', weight: 0.25 },
    ],
    analystNotes: 'Google Play abuse report filed with Trademark Registration Certificate #8849201.',
    evidenceSummary: 'Unauthorized Android app masquerading as official rewards wallet from unrecognized third-party publisher.',
    isSimulated: true,
  },
  {
    id: 'app-threat-2',
    brandId: 'brand-novapay-101',
    platform: 'ANDROID',
    appName: 'NovaPay Helper & Guide',
    publisherName: 'DevStudio 9',
    packageOrBundleId: 'com.quickhelp.novapay',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.quickhelp.novapay',
    riskScore: 74,
    severity: 'HIGH',
    status: 'NEW',
    detectedAt: '2026-10-10T12:00:00Z',
    similarityScore: 78,
    publisherMismatch: true,
    suspiciousIndicators: [
      'Publisher DevStudio 9 unauthorized',
      'Requests aggressive SMS and Contacts read permissions',
      'Uses official logo asset as icon thumbnail',
    ],
    detectionReasons: [
      { name: 'Suspicious Helper Utility', score: 85, description: 'Claims to assist with NovaPay logins but requests SMS permissions.', weight: 0.40 },
      { name: 'Publisher Mismatch', score: 80, description: 'Developer entity not in verified registry.', weight: 0.35 },
      { name: 'Brand Name In Title', score: 78, description: 'Contains brand name without trademark license.', weight: 0.25 },
    ],
    analystNotes: 'Initial malware sandbox scan reveals aggressive ad-injection and potential OTP intercept intent.',
    evidenceSummary: 'Suspected adware / spyware claiming to be an official NovaPay tutorial tool.',
    isSimulated: true,
  },
  {
    id: 'app-threat-3',
    brandId: 'brand-novapay-101',
    platform: 'ANDROID',
    appName: 'Nova Pay Finance & Loans',
    publisherName: 'Global Nova Fin',
    packageOrBundleId: 'org.novapay.financeapp',
    storeUrl: 'https://play.google.com/store/apps/details?id=org.novapay.financeapp',
    riskScore: 64,
    severity: 'MEDIUM',
    status: 'UNDER_REVIEW',
    detectedAt: '2026-10-07T18:40:00Z',
    similarityScore: 72,
    publisherMismatch: true,
    suspiciousIndicators: ['High-risk predatory loan category', 'Publisher Global Nova Fin unaffiliated'],
    detectionReasons: [
      { name: 'Predatory Category Mimicry', score: 75, description: 'Financial micro-lending app using Nova Pay name.', weight: 0.50 },
      { name: 'Developer Mismatch', score: 70, description: 'Publisher not registered as authorized vendor.', weight: 0.50 },
    ],
    analystNotes: 'Investigating trademark overlap in regional jurisdictions.',
    evidenceSummary: 'Micro-lending service utilizing Nova Pay brand variant in app store keywords.',
    isSimulated: true,
  },
];

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    action: 'STATUS_CHANGE',
    entityType: 'FINDING',
    entityId: 'soc-threat-1',
    performedBy: 'Lead Analyst (judge-svce-2025)',
    timestamp: '2026-10-11T14:40:00Z',
    details: 'Changed status from NEW to UNDER_REVIEW for @NovaPay_HelpDesk',
    previousStatus: 'NEW',
    newStatus: 'UNDER_REVIEW',
  },
  {
    id: 'log-2',
    action: 'STATUS_CHANGE',
    entityType: 'FINDING',
    entityId: 'app-threat-1',
    performedBy: 'Automated Threat Ingestion',
    timestamp: '2026-10-11T16:15:00Z',
    details: 'Flagged suspicious mobile application "NovaPay Rewards Wallet" (score: 89)',
    previousStatus: 'NEW',
    newStatus: 'CONFIRMED_SUSPICIOUS',
  },
  {
    id: 'log-3',
    action: 'STATUS_CHANGE',
    entityType: 'FINDING',
    entityId: 'soc-threat-5',
    performedBy: 'Senior Brand Counsel',
    timestamp: '2026-10-06T10:15:00Z',
    details: 'Marked @NovaPaymentCorp as FALSE_POSITIVE following legitimate entity verification',
    previousStatus: 'UNDER_REVIEW',
    newStatus: 'FALSE_POSITIVE',
  },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Critical Social Impersonation Detected',
    message: 'New account @NovaPay_HelpDesk detected offering fake support assistance (Risk Score: 88).',
    severity: 'CRITICAL',
    type: 'DETECTION',
    timestamp: '2026-10-11T14:32:00Z',
    read: false,
    targetId: 'soc-threat-1',
  },
  {
    id: 'notif-2',
    title: 'Suspicious Mobile App Identified',
    message: '"NovaPay Rewards Wallet" published by Apex Tech LLC flagged on Google Play Store.',
    severity: 'CRITICAL',
    type: 'DETECTION',
    timestamp: '2026-10-11T16:10:00Z',
    read: false,
    targetId: 'app-threat-1',
  },
  {
    id: 'notif-3',
    title: 'Monitoring Scan Completed',
    message: 'Global social reconnaissance scan evaluated 48 candidate profiles across 4 platforms.',
    severity: 'INFORMATIONAL',
    type: 'SCAN_COMPLETE',
    timestamp: '2026-10-12T01:00:00Z',
    read: true,
  },
];

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [brand, setBrand] = useState<BrandProfile>(() => {
    const saved = localStorage.getItem('sentinelguard_brand');
    return saved ? JSON.parse(saved) : DEFAULT_BRAND;
  });

  // Keep brand organizationId aligned with authenticated user's organization
  useEffect(() => {
    if (user?.organizationId) {
      setBrand(prev => {
        if (prev.organizationId !== user.organizationId) {
          return {
            ...prev,
            organizationId: user.organizationId || prev.organizationId,
            brandName: user.organizationName || prev.brandName,
          };
        }
        return prev;
      });
    }
  }, [user?.organizationId, user?.organizationName]);

  const [socialFindings, setSocialFindings] = useState<SocialFinding[]>(() => {
    const saved = localStorage.getItem('sentinelguard_social_findings');
    return saved ? JSON.parse(saved) : SEED_SOCIAL_FINDINGS;
  });

  const [appFindings, setAppFindings] = useState<AppFinding[]>(() => {
    const saved = localStorage.getItem('sentinelguard_app_findings');
    return saved ? JSON.parse(saved) : SEED_APP_FINDINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('sentinelguard_audit_logs');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('sentinelguard_notifications');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>('2026-10-12T01:00:00Z');
  const [isScanningSocial, setIsScanningSocial] = useState(false);
  const [isScanningApps, setIsScanningApps] = useState(false);
  const [sensitivityThreshold, setSensitivityThresholdState] = useState<number>(50);

  // Debounced sync state to local storage to avoid blocking the main thread
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('sentinelguard_brand', JSON.stringify(brand));
      } catch {
        // quota exceeded or disabled
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [brand]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('sentinelguard_social_findings', JSON.stringify(socialFindings));
      } catch {
        // quota exceeded
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [socialFindings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('sentinelguard_app_findings', JSON.stringify(appFindings));
      } catch {
        // quota exceeded
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [appFindings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('sentinelguard_audit_logs', JSON.stringify(auditLogs));
      } catch {
        // quota exceeded
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [auditLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('sentinelguard_notifications', JSON.stringify(notifications));
      } catch {
        // quota exceeded
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [notifications]);

  const updateBrandProfile = (updated: Partial<BrandProfile>) => {
    setBrand(prev => {
      const nextBrand = {
        ...prev,
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      syncBrandToFirestore(nextBrand.organizationId, nextBrand).catch((err) => {
        console.warn('[SentinelGuard Firestore Sync] Running in demo mode, local state retained:', err?.message || err);
      });
      return nextBrand;
    });
  };

  const addOfficialSocial = (asset: Omit<OfficialSocialAsset, 'id' | 'createdAt'>) => {
    const newAsset: OfficialSocialAsset = {
      ...asset,
      id: 'soc-off-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setBrand(prev => {
      const nextBrand = {
        ...prev,
        officialSocials: [...prev.officialSocials, newAsset],
      };
      syncBrandToFirestore(nextBrand.organizationId, nextBrand).catch(() => {});
      return nextBrand;
    });

    // Re-evaluate social findings: If any finding matches this new official asset, remove or exclude it
    setSocialFindings(prev => prev.filter(f => f.username.toLowerCase() !== asset.username.toLowerCase()));

    addAuditLog('OFFICIAL_ASSET_ADDED', newAsset.id, `Added official social asset @${asset.username} on ${asset.platform}`);
  };

  const removeOfficialSocial = (id: string) => {
    setBrand(prev => {
      const nextBrand = {
        ...prev,
        officialSocials: prev.officialSocials.filter(a => a.id !== id),
      };
      syncBrandToFirestore(nextBrand.organizationId, nextBrand).catch(() => {});
      return nextBrand;
    });
    addAuditLog('OFFICIAL_ASSET_REMOVED', id, `Removed official social asset ID ${id}`);
  };

  const addOfficialApp = (asset: Omit<OfficialAppAsset, 'id' | 'createdAt'>) => {
    const newAsset: OfficialAppAsset = {
      ...asset,
      id: 'app-off-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setBrand(prev => {
      const nextBrand = {
        ...prev,
        officialApps: [...prev.officialApps, newAsset],
      };
      syncBrandToFirestore(nextBrand.organizationId, nextBrand).catch(() => {});
      return nextBrand;
    });

    // Re-evaluate app findings
    setAppFindings(prev => prev.filter(f => f.packageOrBundleId.toLowerCase() !== asset.packageOrBundleId.toLowerCase()));

    addAuditLog('OFFICIAL_APP_ADDED', newAsset.id, `Added official mobile application ${asset.appName} (${asset.packageOrBundleId})`);
  };

  const removeOfficialApp = (id: string) => {
    setBrand(prev => {
      const nextBrand = {
        ...prev,
        officialApps: prev.officialApps.filter(a => a.id !== id),
      };
      syncBrandToFirestore(nextBrand.organizationId, nextBrand).catch(() => {});
      return nextBrand;
    });
    addAuditLog('OFFICIAL_APP_REMOVED', id, `Removed official app asset ID ${id}`);
  };

  const addAuditLog = (action: string, entityId: string, details: string, previousStatus?: string, newStatus?: string) => {
    const actor = user ? `${user.fullName || user.email} (${user.role})` : 'Security Analyst (Active Session)';
    const entry: AuditLogEntry = {
      id: 'log-' + Date.now(),
      action,
      entityType: 'FINDING',
      entityId,
      performedBy: actor,
      timestamp: new Date().toISOString(),
      details,
      previousStatus,
      newStatus,
    };
    setAuditLogs(prev => [entry, ...prev]);
    syncAuditLogToFirestore(brand.organizationId, entry).catch(() => {});
  };

  const scanSocials = async (): Promise<ScanResult> => {
    setIsScanningSocial(true);
    await new Promise(r => setTimeout(r, 1200));

    const timestamp = new Date().toISOString();
    setLastScanTimestamp(timestamp);
    setIsScanningSocial(false);

    const activeThreats = socialFindings.filter(f => f.status !== 'FALSE_POSITIVE' && f.status !== 'RESOLVED').length;

    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      title: 'Social Reconnaissance Complete',
      message: `Audited 12 target channels. ${activeThreats} active threat profiles currently tracked.`,
      severity: 'INFORMATIONAL',
      type: 'SCAN_COMPLETE',
      timestamp,
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
    addAuditLog('SCAN_EXECUTED', 'social-scan', 'Executed full social impersonation scan across registered platforms');

    return {
      scanId: 'scan-soc-' + Date.now(),
      type: 'SOCIAL',
      scannedAt: timestamp,
      itemsAnalyzed: 18,
      threatsIdentified: activeThreats,
      durationMs: 1200,
      status: 'COMPLETED',
    };
  };

  const scanApps = async (): Promise<ScanResult> => {
    setIsScanningApps(true);
    await new Promise(r => setTimeout(r, 1400));

    const timestamp = new Date().toISOString();
    setLastScanTimestamp(timestamp);
    setIsScanningApps(false);

    const activeThreats = appFindings.filter(f => f.status !== 'FALSE_POSITIVE' && f.status !== 'RESOLVED').length;

    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      title: 'App Store Reconnaissance Complete',
      message: `Audited Google Play and Apple App Store index. ${activeThreats} unauthorized app listings monitored.`,
      severity: 'INFORMATIONAL',
      type: 'SCAN_COMPLETE',
      timestamp,
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
    addAuditLog('SCAN_EXECUTED', 'app-scan', 'Executed full mobile store impersonation scan');

    return {
      scanId: 'scan-app-' + Date.now(),
      type: 'APP',
      scannedAt: timestamp,
      itemsAnalyzed: 24,
      threatsIdentified: activeThreats,
      durationMs: 1400,
      status: 'COMPLETED',
    };
  };

  const updateSocialStatus = (id: string, newStatus: InvestigationStatus, note?: string) => {
    const target = socialFindings.find(f => f.id === id);
    if (!target) return;
    const oldStatus = target.status;

    let updatedTarget: SocialFinding | null = null;
    setSocialFindings(prev => prev.map(f => {
      if (f.id === id) {
        updatedTarget = {
          ...f,
          status: newStatus,
          analystNotes: note ? `${f.analystNotes}\n[${new Date().toLocaleDateString()}] ${note}` : f.analystNotes,
        };
        return updatedTarget;
      }
      return f;
    }));

    if (updatedTarget) {
      syncSocialFindingToFirestore(brand.organizationId, updatedTarget).catch(() => {});
    }

    addAuditLog(
      'STATUS_CHANGE', 
      id, 
      `Changed social case @${target.username} from ${oldStatus} to ${newStatus}${note ? ` Note: ${note}` : ''}`,
      oldStatus,
      newStatus
    );
  };

  const updateAppStatus = (id: string, newStatus: InvestigationStatus, note?: string) => {
    const target = appFindings.find(f => f.id === id);
    if (!target) return;
    const oldStatus = target.status;

    let updatedTarget: AppFinding | null = null;
    setAppFindings(prev => prev.map(f => {
      if (f.id === id) {
        updatedTarget = {
          ...f,
          status: newStatus,
          analystNotes: note ? `${f.analystNotes}\n[${new Date().toLocaleDateString()}] ${note}` : f.analystNotes,
        };
        return updatedTarget;
      }
      return f;
    }));

    if (updatedTarget) {
      syncAppFindingToFirestore(brand.organizationId, updatedTarget).catch(() => {});
    }

    addAuditLog(
      'STATUS_CHANGE', 
      id, 
      `Changed mobile case "${target.appName}" from ${oldStatus} to ${newStatus}${note ? ` Note: ${note}` : ''}`,
      oldStatus,
      newStatus
    );
  };

  const addSocialNote = (id: string, note: string) => {
    setSocialFindings(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          analystNotes: `${f.analystNotes ? f.analystNotes + '\n' : ''}[${new Date().toLocaleTimeString()}] ${note}`,
        };
      }
      return f;
    }));
    addAuditLog('NOTE_ADDED', id, `Added investigation note to social candidate ID ${id}`);
  };

  const addAppNote = (id: string, note: string) => {
    setAppFindings(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          analystNotes: `${f.analystNotes ? f.analystNotes + '\n' : ''}[${new Date().toLocaleTimeString()}] ${note}`,
        };
      }
      return f;
    }));
    addAuditLog('NOTE_ADDED', id, `Added investigation note to app candidate ID ${id}`);
  };

  const addCustomSocialCandidate = (name: string, username: string, platform: SocialPlatform): SocialFinding => {
    const analysis = analyzeSocialCandidate(name, username, `https://${platform.toLowerCase()}.com/${username}`, brand);
    
    // Strict Exclusion of registered official assets
    if (analysis.isOfficial) {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        title: `Official Asset Verified: @${username}`,
        message: `Account matches registered official asset for ${brand.brandName}. Excluded from threat findings.`,
        severity: 'INFORMATIONAL',
        type: 'SYSTEM',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
      addAuditLog('ASSET_VERIFIED', 'official-whitelist', `Candidate @${username} verified as official asset and excluded from threat tracking.`);
      
      return {
        id: 'soc-official-' + Date.now(),
        brandId: brand.id,
        platform,
        accountName: name,
        username,
        profileUrl: `https://${platform.toLowerCase()}.com/${username}`,
        riskScore: 0,
        severity: 'INFORMATIONAL',
        status: 'RESOLVED',
        detectedAt: new Date().toISOString(),
        similarityScore: 100,
        suspiciousIndicators: ['Verified official brand asset'],
        detectionReasons: analysis.detectionReasons,
        analystNotes: 'Verified official corporate asset. Excluded from threat pipeline.',
        evidenceSummary: 'Matches official registry. Excluded from threats.',
        isSimulated: true,
      };
    }

    const newFinding: SocialFinding = {
      id: 'soc-custom-' + Date.now(),
      brandId: brand.id,
      platform,
      accountName: name,
      username,
      profileUrl: `https://${platform.toLowerCase()}.com/${username}`,
      riskScore: analysis.riskScore,
      severity: analysis.severity,
      status: 'NEW',
      detectedAt: new Date().toISOString(),
      similarityScore: analysis.similarityScore,
      suspiciousIndicators: analysis.suspiciousIndicators,
      detectionReasons: analysis.detectionReasons,
      analystNotes: 'Manually ingested candidate profile for evaluation.',
      evidenceSummary: analysis.evidenceSummary,
      isSimulated: true,
    };

    setSocialFindings(prev => [newFinding, ...prev]);

    if (newFinding.severity === 'CRITICAL' || newFinding.severity === 'HIGH') {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        title: `High Threat Profile Ingested: @${username}`,
        message: `Calculated Risk Score: ${newFinding.riskScore}/100 on ${platform}.`,
        severity: newFinding.severity,
        type: 'DETECTION',
        timestamp: new Date().toISOString(),
        read: false,
        targetId: newFinding.id,
      };
      setNotifications(prev => [notif, ...prev]);
    }

    addAuditLog('CANDIDATE_INGESTED', newFinding.id, `Ingested social candidate @${username} on ${platform} (Score: ${newFinding.riskScore})`);
    return newFinding;
  };

  const addCustomAppCandidate = (appName: string, publisher: string, packageId: string, platform: AppPlatform): AppFinding => {
    const analysis = analyzeAppCandidate(appName, publisher, packageId, `https://store.example.com/${packageId}`, brand);

    // Strict Exclusion of registered official apps
    if (analysis.isOfficial) {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        title: `Official Application Verified: ${appName}`,
        message: `Package ID ${packageId} matches registered official application for ${brand.brandName}. Excluded from threat findings.`,
        severity: 'INFORMATIONAL',
        type: 'SYSTEM',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
      addAuditLog('ASSET_VERIFIED', 'official-whitelist', `Application package ${packageId} verified as official asset and excluded from threat tracking.`);

      return {
        id: 'app-official-' + Date.now(),
        brandId: brand.id,
        platform,
        appName,
        publisherName: publisher,
        packageOrBundleId: packageId,
        storeUrl: `https://store.example.com/${packageId}`,
        riskScore: 0,
        severity: 'INFORMATIONAL',
        status: 'RESOLVED',
        detectedAt: new Date().toISOString(),
        similarityScore: 100,
        publisherMismatch: false,
        suspiciousIndicators: ['Verified official application'],
        detectionReasons: analysis.detectionReasons,
        analystNotes: 'Verified official corporate application. Excluded from threat pipeline.',
        evidenceSummary: 'Matches official registry. Excluded from threats.',
        isSimulated: true,
      };
    }

    const newFinding: AppFinding = {
      id: 'app-custom-' + Date.now(),
      brandId: brand.id,
      platform,
      appName,
      publisherName: publisher,
      packageOrBundleId: packageId,
      storeUrl: `https://store.example.com/${packageId}`,
      riskScore: analysis.riskScore,
      severity: analysis.severity,
      status: 'NEW',
      detectedAt: new Date().toISOString(),
      similarityScore: analysis.similarityScore,
      publisherMismatch: analysis.publisherMismatch,
      suspiciousIndicators: analysis.suspiciousIndicators,
      detectionReasons: analysis.detectionReasons,
      analystNotes: 'Manually submitted store package candidate.',
      evidenceSummary: analysis.evidenceSummary,
      isSimulated: true,
    };

    setAppFindings(prev => [newFinding, ...prev]);

    if (newFinding.severity === 'CRITICAL' || newFinding.severity === 'HIGH') {
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        title: `High Threat Mobile App Ingested: ${appName}`,
        message: `Publisher: ${publisher} | Risk Score: ${newFinding.riskScore}/100.`,
        severity: newFinding.severity,
        type: 'DETECTION',
        timestamp: new Date().toISOString(),
        read: false,
        targetId: newFinding.id,
      };
      setNotifications(prev => [notif, ...prev]);
    }

    addAuditLog('CANDIDATE_INGESTED', newFinding.id, `Ingested mobile app candidate ${appName} (${packageId})`);
    return newFinding;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const exportCsvReport = () => {
    const headers = [
      'Type',
      'Asset/Candidate Name',
      'Identifier / Username / Package',
      'Platform',
      'Risk Score',
      'Severity',
      'Status',
      'Detected At',
      'Publisher / Store',
      'Evidence Summary',
    ];

    const socialRows = socialFindings.map(s => [
      'Social Profile',
      `"${s.accountName.replace(/"/g, '""')}"`,
      `"@${s.username}"`,
      s.platform,
      s.riskScore,
      s.severity,
      s.status,
      s.detectedAt,
      'N/A',
      `"${s.evidenceSummary.replace(/"/g, '""')}"`,
    ]);

    const appRows = appFindings.map(a => [
      'Mobile App',
      `"${a.appName.replace(/"/g, '""')}"`,
      `"${a.packageOrBundleId}"`,
      a.platform,
      a.riskScore,
      a.severity,
      a.status,
      a.detectedAt,
      `"${a.publisherName.replace(/"/g, '""')}"`,
      `"${a.evidenceSummary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...socialRows.map(r => r.join(',')), ...appRows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Online_Guardian_Threat_Report_${brand.brandName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addAuditLog('REPORT_EXPORTED', 'csv-export', `Exported full CSV threat report (${socialRows.length + appRows.length} entries)`);
  };

  const resetToDemoDefaults = () => {
    setBrand(DEFAULT_BRAND);
    setSocialFindings(SEED_SOCIAL_FINDINGS);
    setAppFindings(SEED_APP_FINDINGS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setNotifications(SEED_NOTIFICATIONS);
    setSensitivityThresholdState(50);
    localStorage.removeItem('sentinelguard_brand');
    localStorage.removeItem('sentinelguard_social_findings');
    localStorage.removeItem('sentinelguard_app_findings');
    localStorage.removeItem('sentinelguard_audit_logs');
    localStorage.removeItem('sentinelguard_notifications');
  };

  const contextValue = useMemo(() => ({
    brand,
    socialFindings,
    appFindings,
    auditLogs,
    notifications,
    lastScanTimestamp,
    isScanningSocial,
    isScanningApps,
    sensitivityThreshold,
    setSensitivityThreshold: setSensitivityThresholdState,
    updateBrandProfile,
    addOfficialSocial,
    removeOfficialSocial,
    addOfficialApp,
    removeOfficialApp,
    scanSocials,
    scanApps,
    updateSocialStatus,
    updateAppStatus,
    addSocialNote,
    addAppNote,
    addCustomSocialCandidate,
    addCustomAppCandidate,
    markNotificationRead,
    markAllNotificationsRead,
    exportCsvReport,
    resetToDemoDefaults,
  }), [
    brand,
    socialFindings,
    appFindings,
    auditLogs,
    notifications,
    lastScanTimestamp,
    isScanningSocial,
    isScanningApps,
    sensitivityThreshold,
    updateBrandProfile,
    addOfficialSocial,
    removeOfficialSocial,
    addOfficialApp,
    removeOfficialApp,
    scanSocials,
    scanApps,
    updateSocialStatus,
    updateAppStatus,
    addSocialNote,
    addAppNote,
    addCustomSocialCandidate,
    addCustomAppCandidate,
    markNotificationRead,
    markAllNotificationsRead,
    exportCsvReport,
    resetToDemoDefaults,
  ]);

  return (
    <BrandContext.Provider value={contextValue}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) {
    console.warn('[BrandContext] useBrand called outside of BrandProvider, returning safe fallback context');
    return {
      brand: DEFAULT_BRAND,
      socialFindings: SEED_SOCIAL_FINDINGS,
      appFindings: SEED_APP_FINDINGS,
      auditLogs: SEED_AUDIT_LOGS,
      notifications: SEED_NOTIFICATIONS,
      lastScanTimestamp: new Date().toISOString(),
      isScanningSocial: false,
      isScanningApps: false,
      sensitivityThreshold: 50,
      setSensitivityThreshold: () => {},
      updateBrandProfile: () => {},
      addOfficialSocial: () => {},
      removeOfficialSocial: () => {},
      addOfficialApp: () => {},
      removeOfficialApp: () => {},
      scanSocials: async () => ({
        scanId: 'fallback-social-scan',
        type: 'SOCIAL',
        scannedAt: new Date().toISOString(),
        itemsAnalyzed: 0,
        threatsIdentified: 0,
        durationMs: 0,
        status: 'COMPLETED',
      }),
      scanApps: async () => ({
        scanId: 'fallback-app-scan',
        type: 'APP',
        scannedAt: new Date().toISOString(),
        itemsAnalyzed: 0,
        threatsIdentified: 0,
        durationMs: 0,
        status: 'COMPLETED',
      }),
      updateSocialStatus: () => {},
      updateAppStatus: () => {},
      addSocialNote: () => {},
      addAppNote: () => {},
      addCustomSocialCandidate: () => SEED_SOCIAL_FINDINGS[0],
      addCustomAppCandidate: () => SEED_APP_FINDINGS[0],
      markNotificationRead: () => {},
      markAllNotificationsRead: () => {},
      exportCsvReport: () => {},
      resetToDemoDefaults: () => {},
    };
  }
  return context;
};
