import { Severity, DetectionFactor, BrandProfile, OfficialSocialAsset, OfficialAppAsset } from '../types';

// Common homoglyphs and leetspeak substitutions
const HOMOGLYPH_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'l',
  'l': 'i',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  '$': 's',
  '7': 't',
  '8': 'b',
  'vv': 'w',
  'rn': 'm',
};

// High-risk deceptive modifiers commonly used in phishing & impersonation
const DECEPTIVE_MODIFIERS = [
  'support', 'help', 'helpdesk', 'care', 'customercare',
  'official', 'verify', 'verified', 'real', 'team',
  'rewards', 'offers', 'giveaway', 'bonus', 'promo',
  'security', 'secure', 'auth', 'login', 'portal',
  'wallet', 'finance', 'claim', 'airdrop', 'refund'
];

/**
 * Normalizes a string by stripping punctuation, emojis, spaces, and converting to lowercase.
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// In-memory LRU-like caches to avoid repeated O(N*M) edit-distance calculations
const DISTANCE_CACHE = new Map<string, number>();
const SIMILARITY_CACHE = new Map<string, number>();
const HOMOGLYPH_CACHE = new Map<string, { normalized: string; substituted: boolean; details: string[] }>();
const MAX_CACHE_SIZE = 1000;

function setBoundedCache<K, V>(map: Map<K, V>, key: K, value: V) {
  if (map.size >= MAX_CACHE_SIZE) {
    // Delete oldest entry
    const firstKey = map.keys().next().value;
    if (firstKey !== undefined) map.delete(firstKey);
  }
  map.set(key, value);
}

/**
 * Replaces common homoglyphs with standard characters.
 */
export function dehomoglyph(str: string): { normalized: string; substituted: boolean; details: string[] } {
  const cached = HOMOGLYPH_CACHE.get(str);
  if (cached) return cached;

  let result = str.toLowerCase();
  let substituted = false;
  const details: string[] = [];

  for (const [symbol, target] of Object.entries(HOMOGLYPH_MAP)) {
    if (result.includes(symbol)) {
      substituted = true;
      details.push(`Replaced '${symbol}' with '${target}'`);
      result = result.split(symbol).join(target);
    }
  }

  const output = { normalized: normalizeString(result), substituted, details };
  setBoundedCache(HOMOGLYPH_CACHE, str, output);
  return output;
}

/**
 * Computes Damerau-Levenshtein distance between two strings with memoization.
 */
export function damerauLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const cacheKey = a < b ? `${a}|${b}` : `${b}|${a}`;
  const cached = DISTANCE_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let min = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        min = Math.min(min, matrix[i - 2][j - 2] + cost);
      }

      matrix[i][j] = min;
    }
  }

  const result = matrix[al][bl];
  setBoundedCache(DISTANCE_CACHE, cacheKey, result);
  return result;
}

/**
 * Computes similarity ratio from 0 to 100 based on edit distance with memoization.
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const n1 = normalizeString(s1);
  const n2 = normalizeString(s2);
  if (n1 === n2) return 100;
  if (!n1 || !n2) return 0;

  const cacheKey = n1 < n2 ? `${n1}#${n2}` : `${n2}#${n1}`;
  const cached = SIMILARITY_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  const maxLen = Math.max(n1.length, n2.length);
  const distance = damerauLevenshteinDistance(n1, n2);
  const similarity = ((maxLen - distance) / maxLen) * 100;
  const result = Math.max(0, Math.min(100, Math.round(similarity)));
  setBoundedCache(SIMILARITY_CACHE, cacheKey, result);
  return result;
}

/**
 * Calculates Jaro-Winkler token similarity.
 */
export function calculateTokenSimilarity(s1: string, s2: string): number {
  const tokens1 = s1.toLowerCase().split(/[\s_\-.]+/).filter(Boolean);
  const tokens2 = s2.toLowerCase().split(/[\s_\-.]+/).filter(Boolean);

  if (!tokens1.length || !tokens2.length) return 0;

  let commonTokens = 0;
  for (const t1 of tokens1) {
    if (tokens2.some(t2 => t1 === t2 || calculateSimilarity(t1, t2) >= 85)) {
      commonTokens++;
    }
  }

  return Math.round((commonTokens / Math.max(tokens1.length, tokens2.length)) * 100);
}

/**
 * Checks if a candidate is an exact match to registered official brand assets.
 */
export function checkOfficialSocialMatch(
  username: string,
  profileUrl: string,
  officialSocials: OfficialSocialAsset[]
): OfficialSocialAsset | null {
  const normUser = normalizeString(username);
  const normUrl = profileUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  for (const official of officialSocials) {
    const officialNormUser = normalizeString(official.username);
    const officialNormUrl = official.profileUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (normUser === officialNormUser || normUrl === officialNormUrl) {
      return official;
    }
  }
  return null;
}

/**
 * Checks if an app candidate matches a registered official mobile app.
 */
export function checkOfficialAppMatch(
  packageOrBundleId: string,
  storeUrl: string,
  officialApps: OfficialAppAsset[]
): OfficialAppAsset | null {
  const normPkg = packageOrBundleId.trim().toLowerCase();
  const normUrl = storeUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  for (const official of officialApps) {
    if (normPkg === official.packageOrBundleId.trim().toLowerCase()) {
      return official;
    }
    const officialNormUrl = official.storeUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (normUrl === officialNormUrl) {
      return official;
    }
  }
  return null;
}

/**
 * Maps numerical risk score (0-100) to Enterprise Severity.
 */
export function scoreToSeverity(score: number): Severity {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 30) return 'LOW';
  return 'INFORMATIONAL';
}

/**
 * Analyzes a candidate social profile against a brand profile.
 */
export interface SocialAnalysisResult {
  isOfficial: boolean;
  officialMatch?: OfficialSocialAsset;
  riskScore: number;
  severity: Severity;
  similarityScore: number;
  suspiciousIndicators: string[];
  detectionReasons: DetectionFactor[];
  evidenceSummary: string;
}

export function analyzeSocialCandidate(
  candidateName: string,
  candidateUsername: string,
  candidateUrl: string,
  brand: BrandProfile
): SocialAnalysisResult {
  // 1. Exclusion check against official assets
  const officialMatch = checkOfficialSocialMatch(candidateUsername, candidateUrl, brand.officialSocials);
  if (officialMatch) {
    return {
      isOfficial: true,
      officialMatch,
      riskScore: 0,
      severity: 'INFORMATIONAL',
      similarityScore: 100,
      suspiciousIndicators: [],
      detectionReasons: [{
        name: 'Official Asset Verified',
        score: 0,
        description: `Verified legitimate asset matching registered official account @${officialMatch.username}. Excluded from threat findings.`,
        weight: 1.0,
      }],
      evidenceSummary: `Matched registered official brand profile for ${officialMatch.platform}.`,
    };
  }

  const detectionReasons: DetectionFactor[] = [];
  const suspiciousIndicators: string[] = [];

  // 2. Base Brand Name & Username Similarity
  const normBrand = normalizeString(brand.brandName);
  const normUsername = normalizeString(candidateUsername);
  const normCandidateName = normalizeString(candidateName);

  const usernameSim = calculateSimilarity(normBrand, normUsername);
  const nameSim = calculateSimilarity(normBrand, normCandidateName);
  const highestSim = Math.max(usernameSim, nameSim);

  if (highestSim >= 60) {
    detectionReasons.push({
      name: 'High Name Similarity',
      score: highestSim,
      description: `Name/handle exhibits ${highestSim}% edit-distance similarity to registered brand '${brand.brandName}'.`,
      weight: 0.35,
    });
    suspiciousIndicators.push(`Name similarity score: ${highestSim}%`);
  }

  // 3. Homoglyph / Leetspeak analysis
  const userHomoglyph = dehomoglyph(candidateUsername);
  const nameHomoglyph = dehomoglyph(candidateName);
  if (userHomoglyph.substituted || nameHomoglyph.substituted) {
    const homoglyphScore = 90;
    detectionReasons.push({
      name: 'Character Homoglyph / Typosquatting',
      score: homoglyphScore,
      description: `Detected character substitutions or visually confusable glyphs mimicking legitimate characters.`,
      weight: 0.25,
    });
    suspiciousIndicators.push('Deceptive homoglyph characters detected');
  }

  // 4. Deceptive modifier presence (e.g. support, offers, official)
  const combinedText = `${candidateName} ${candidateUsername}`.toLowerCase();
  const matchedModifiers = DECEPTIVE_MODIFIERS.filter(mod => combinedText.includes(mod));
  if (matchedModifiers.length > 0) {
    const modifierScore = Math.min(100, 75 + matchedModifiers.length * 10);
    detectionReasons.push({
      name: 'Deceptive Impersonation Keywords',
      score: modifierScore,
      description: `Contains high-risk targeting keywords: [${matchedModifiers.join(', ')}] frequently leveraged in brand spoofing & phishing.`,
      weight: 0.25,
    });
    suspiciousIndicators.push(`Targeting modifiers: ${matchedModifiers.slice(0, 3).join(', ')}`);
  }

  // 5. Alias resemblance
  for (const alias of brand.approvedAliases) {
    const aliasSim = calculateSimilarity(alias, candidateName);
    if (aliasSim > 75) {
      detectionReasons.push({
        name: 'Brand Alias Mimicry',
        score: aliasSim,
        description: `Corresponds closely (${aliasSim}%) to registered brand alias '${alias}'.`,
        weight: 0.15,
      });
      suspiciousIndicators.push(`Resembles approved alias '${alias}'`);
      break;
    }
  }

  // Compute weighted composite score
  let totalScore = 0;
  let totalWeight = 0;

  for (const factor of detectionReasons) {
    totalScore += factor.score * factor.weight;
    totalWeight += factor.weight;
  }

  let finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 10;
  
  // Cap / scale based on presence of critical red flags
  if (matchedModifiers.includes('support') && highestSim >= 70) {
    finalScore = Math.max(finalScore, 86); // Critical support spoofing
  }
  if ((userHomoglyph.substituted || nameHomoglyph.substituted) && highestSim >= 75) {
    finalScore = Math.max(finalScore, 88); // Critical look-alike
  }

  // If name similarity is low and no modifiers match, score is minimal
  if (highestSim < 45 && matchedModifiers.length === 0) {
    finalScore = Math.min(finalScore, 25);
  }

  const severity = scoreToSeverity(finalScore);

  const evidenceSummary = [
    `Target: ${candidateName} (@${candidateUsername})`,
    `Platform: ${candidateUrl}`,
    `Calculated Brand Similarity: ${highestSim}%`,
    matchedModifiers.length ? `Suspicious Keywords: ${matchedModifiers.join(', ')}` : null,
    userHomoglyph.substituted ? `Character substitutions detected in handle` : null,
    `Calculated Risk Score: ${finalScore}/100 (${severity})`,
  ].filter(Boolean).join(' | ');

  return {
    isOfficial: false,
    riskScore: finalScore,
    severity,
    similarityScore: highestSim,
    suspiciousIndicators,
    detectionReasons,
    evidenceSummary,
  };
}

/**
 * Analyzes a candidate mobile application against brand profile and official apps.
 */
export interface AppAnalysisResult {
  isOfficial: boolean;
  officialMatch?: OfficialAppAsset;
  riskScore: number;
  severity: Severity;
  similarityScore: number;
  publisherMismatch: boolean;
  suspiciousIndicators: string[];
  detectionReasons: DetectionFactor[];
  evidenceSummary: string;
}

export function analyzeAppCandidate(
  appName: string,
  publisherName: string,
  packageOrBundleId: string,
  storeUrl: string,
  brand: BrandProfile
): AppAnalysisResult {
  // 1. Exclusion check against official apps
  const officialMatch = checkOfficialAppMatch(packageOrBundleId, storeUrl, brand.officialApps);
  if (officialMatch) {
    return {
      isOfficial: true,
      officialMatch,
      riskScore: 0,
      severity: 'INFORMATIONAL',
      similarityScore: 100,
      publisherMismatch: false,
      suspiciousIndicators: [],
      detectionReasons: [{
        name: 'Official Mobile App Verified',
        score: 0,
        description: `Verified legitimate mobile application matching registered package ID ${officialMatch.packageOrBundleId}. Excluded from threat findings.`,
        weight: 1.0,
      }],
      evidenceSummary: `Verified authentic mobile application for ${officialMatch.platform}.`,
    };
  }

  const detectionReasons: DetectionFactor[] = [];
  const suspiciousIndicators: string[] = [];

  // 2. Name similarity
  const normBrand = normalizeString(brand.brandName);
  const normAppName = normalizeString(appName);
  const nameSim = calculateSimilarity(normBrand, normAppName);

  if (nameSim >= 50) {
    detectionReasons.push({
      name: 'App Name Resemblance',
      score: nameSim,
      description: `Application title exhibits ${nameSim}% lexical similarity to brand '${brand.brandName}'.`,
      weight: 0.35,
    });
    suspiciousIndicators.push(`Name similarity: ${nameSim}%`);
  }

  // 3. Package ID analysis (e.g. contains brand name)
  const normPackage = packageOrBundleId.toLowerCase();
  let packageSuspicious = false;
  if (normPackage.includes(normBrand)) {
    packageSuspicious = true;
    detectionReasons.push({
      name: 'Brand Identifier in Package ID',
      score: 85,
      description: `Package identifier '${packageOrBundleId}' incorporates brand stem without official registration.`,
      weight: 0.25,
    });
    suspiciousIndicators.push(`Package ID contains '${brand.brandName.toLowerCase()}'`);
  }

  // 4. Publisher mismatch check
  const officialPublishers = brand.officialApps.map(a => a.publisherName.toLowerCase());
  const isPublisherRecognized = officialPublishers.some(pub => {
    return pub.includes(publisherName.toLowerCase()) || publisherName.toLowerCase().includes(pub);
  });

  const publisherMismatch = !isPublisherRecognized;
  if (publisherMismatch) {
    detectionReasons.push({
      name: 'Unrecognized Third-Party Publisher',
      score: 80,
      description: `Published by '${publisherName}', which does not match registered official developer entities: [${officialPublishers.join(', ')}].`,
      weight: 0.25,
    });
    suspiciousIndicators.push(`Publisher mismatch: ${publisherName}`);
  }

  // 5. Deceptive app modifiers (e.g. wallet, reward, helper, bonus)
  const appModifiers = ['wallet', 'rewards', 'helper', 'finance', 'cash', 'loan', 'pay', 'bonus', 'crypto'];
  const matchedAppModifiers = appModifiers.filter(mod => appName.toLowerCase().includes(mod));
  if (matchedAppModifiers.length > 0) {
    detectionReasons.push({
      name: 'Financial / Utility Mimicry Keywords',
      score: 85,
      description: `Contains high-risk financial or service keywords: [${matchedAppModifiers.join(', ')}].`,
      weight: 0.15,
    });
    suspiciousIndicators.push(`High-risk keywords: ${matchedAppModifiers.join(', ')}`);
  }

  // Compute weighted score
  let totalScore = 0;
  let totalWeight = 0;
  for (const factor of detectionReasons) {
    totalScore += factor.score * factor.weight;
    totalWeight += factor.weight;
  }

  let finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 15;

  if (publisherMismatch && packageSuspicious && nameSim >= 65) {
    finalScore = Math.max(finalScore, 85); // Critical unauthorized app
  }

  const severity = scoreToSeverity(finalScore);

  const evidenceSummary = [
    `Application: ${appName}`,
    `Package ID: ${packageOrBundleId}`,
    `Publisher: ${publisherName}`,
    `Lexical Similarity: ${nameSim}%`,
    publisherMismatch ? `Developer Mismatch Verified` : null,
    `Risk Score: ${finalScore}/100 (${severity})`,
  ].filter(Boolean).join(' | ');

  return {
    isOfficial: false,
    riskScore: finalScore,
    severity,
    similarityScore: nameSim,
    publisherMismatch,
    suspiciousIndicators,
    detectionReasons,
    evidenceSummary,
  };
}
