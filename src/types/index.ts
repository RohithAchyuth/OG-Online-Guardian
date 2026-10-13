export type Language = 'en' | 'te' | 'hi' | 'es';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type InvestigationStatus = 
  | 'NEW' 
  | 'UNDER_REVIEW' 
  | 'CONFIRMED_SUSPICIOUS' 
  | 'FALSE_POSITIVE' 
  | 'RESOLVED';

export type SocialPlatform = 
  | 'X' 
  | 'INSTAGRAM' 
  | 'LINKEDIN' 
  | 'FACEBOOK' 
  | 'YOUTUBE' 
  | 'TIKTOK';

export type AppPlatform = 'ANDROID' | 'IOS';

export interface OfficialSocialAsset {
  id: string;
  platform: SocialPlatform;
  username: string;
  profileUrl: string;
  verifiedBadge: boolean;
  notes?: string;
  createdAt: string;
}

export interface OfficialAppAsset {
  id: string;
  platform: AppPlatform;
  appName: string;
  storeUrl: string;
  packageOrBundleId: string;
  publisherName: string;
  verified: boolean;
  createdAt: string;
}

export interface BrandProfile {
  id: string;
  organizationId: string;
  brandName: string;
  websiteUrl: string;
  industry: string;
  country: string;
  description: string;
  logoUrl?: string;
  approvedAliases: string[];
  approvedKeywords: string[];
  officialSocials: OfficialSocialAsset[];
  officialApps: OfficialAppAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface DetectionFactor {
  name: string;
  score: number;
  description: string;
  weight: number;
}

export interface SocialFinding {
  id: string;
  brandId: string;
  platform: SocialPlatform;
  accountName: string;
  username: string;
  profileUrl: string;
  avatarUrl?: string;
  riskScore: number;
  severity: Severity;
  status: InvestigationStatus;
  detectedAt: string;
  similarityScore: number;
  logoSimilarityScore?: number;
  suspiciousIndicators: string[];
  detectionReasons: DetectionFactor[];
  analystNotes: string;
  evidenceSummary: string;
  officialMatch?: OfficialSocialAsset;
  isSimulated: boolean;
}

export interface AppFinding {
  id: string;
  brandId: string;
  platform: AppPlatform;
  appName: string;
  publisherName: string;
  packageOrBundleId: string;
  storeUrl: string;
  iconUrl?: string;
  riskScore: number;
  severity: Severity;
  status: InvestigationStatus;
  detectedAt: string;
  similarityScore: number;
  publisherMismatch: boolean;
  suspiciousIndicators: string[];
  detectionReasons: DetectionFactor[];
  analystNotes: string;
  evidenceSummary: string;
  officialMatch?: OfficialAppAsset;
  isSimulated: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: 'FINDING' | 'BRAND' | 'SCAN' | 'AUTH';
  entityId: string;
  performedBy: string;
  timestamp: string;
  details: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  type: 'DETECTION' | 'SCAN_COMPLETE' | 'CASE_UPDATE' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  targetId?: string;
}

export type AccountType = 'personal' | 'company';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  organizationName?: string;
  organizationId?: string;
  preferredLanguage: Language;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  isDemoUser?: boolean;
  accountType?: AccountType;
  approvalStatus?: ApprovalStatus;
  companyName?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScanResult {
  scanId: string;
  type: 'SOCIAL' | 'APP' | 'ALL';
  scannedAt: string;
  itemsAnalyzed: number;
  threatsIdentified: number;
  durationMs: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
}

export interface PersonalAppCandidate {
  id: string;
  trackId?: number;
  appName: string;
  developerName: string;
  bundleId: string;
  storeUrl: string;
  iconUrl?: string;
  price?: string;
  rating?: number;
  primaryGenreName?: string;
  releaseDate?: string;
  isPotentialCopy: boolean;
  copyRiskScore: number;
  explanation: string;
  detectionReasons: string[];
  source: 'apple_app_store_live' | 'play_store_catalog' | 'registry';
}

export interface LookalikeVariation {
  variation: string;
  type: 'homoglyph' | 'separator' | 'number_substitution' | 'deceptive_modifier' | 'typosquat';
  description: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DiscoveredProfile {
  platform: string;
  username: string;
  profileUrl: string;
  avatarUrl?: string;
  matchedPattern: string;
  riskScore: number;
  severity: Severity;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPICIOUS';
  reasons: string[];
  scannedAt: string;
  source: 'live_network_probe' | 'public_registry';
}

export interface PersonalLookalikeResult {
  query: string;
  normalizedQuery: string;
  generatedVariations: LookalikeVariation[];
  discoveredProfiles: DiscoveredProfile[];
}

export interface PersonalSocialFinding {
  id: string;
  platform: string;
  username: string;
  accountName?: string;
  profileUrl: string;
  avatarUrl?: string;
  riskScore: number;
  severity: Severity;
  matchingReasons: string[];
  scanTimestamp: string;
  status: 'SUSPICIOUS' | 'UNDER_REVIEW' | 'FLAGGED';
  dataSource: string;
  verifiedReal: boolean;
}

export interface PersonalAlert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  category: 'APP_STORE' | 'LOOKALIKE' | 'SOCIAL';
  timestamp: string;
  target: string;
}

