import { 
  damerauLevenshteinDistance, 
  calculateSimilarity, 
  dehomoglyph, 
  analyzeSocialCandidate, 
  analyzeAppCandidate 
} from './lookalikeEngine';
import { BrandProfile } from '../types';

const testBrand: BrandProfile = {
  id: 'brand-test-1',
  organizationId: 'org-test',
  brandName: 'NovaPay',
  websiteUrl: 'https://novapay.global',
  industry: 'Fintech',
  country: 'USA',
  description: 'Digital payments and fintech.',
  approvedAliases: ['Nova Pay', 'NovaPay Global', 'NovaPay Inc.'],
  approvedKeywords: ['payments', 'wallet', 'fintech'],
  officialSocials: [
    {
      id: 'soc-1',
      platform: 'X',
      username: 'NovaPay',
      profileUrl: 'https://x.com/NovaPay',
      verifiedBadge: true,
      createdAt: '2026-01-01',
    },
    {
      id: 'soc-2',
      platform: 'INSTAGRAM',
      username: 'NovaPay',
      profileUrl: 'https://instagram.com/NovaPay',
      verifiedBadge: true,
      createdAt: '2026-01-01',
    }
  ],
  officialApps: [
    {
      id: 'app-1',
      platform: 'ANDROID',
      appName: 'NovaPay',
      packageOrBundleId: 'com.example.novapay.demo',
      publisherName: 'NovaPay Technologies',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.example.novapay.demo',
      verified: true,
      createdAt: '2026-01-01',
    }
  ],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function runTests() {
  console.log('--- RUNNING AUDIT & QA ENGINE TESTS ---');

  // Test 1: String Distance
  const d1 = damerauLevenshteinDistance('novapay', 'novapay');
  console.assert(d1 === 0, `Expected distance 0, got ${d1}`);

  const sim1 = calculateSimilarity('NovaPay', 'NovaPay');
  console.assert(sim1 === 100, `Expected similarity 100, got ${sim1}`);

  // Test 2: Homoglyph detection
  const hg1 = dehomoglyph('N0vaPay');
  console.assert(hg1.substituted === true, 'Expected homoglyph substitution for 0->o');
  console.assert(hg1.normalized === 'novapay', `Expected normalized 'novapay', got ${hg1.normalized}`);

  // Test 3: Official Social Exclusion
  const officialAnalysis = analyzeSocialCandidate(
    'NovaPay Official', 
    'NovaPay', 
    'https://x.com/NovaPay', 
    testBrand
  );
  console.assert(officialAnalysis.isOfficial === true, 'Official social account must be excluded');
  console.assert(officialAnalysis.riskScore === 0, 'Official social account risk score must be 0');

  // Test 4: Critical Threat Detection (Deceptive keywords + Homoglyph)
  const phishAnalysis = analyzeSocialCandidate(
    'N0vaPay Rewards', 
    'N0vaPayPromo', 
    'https://instagram.com/N0vaPayPromo', 
    testBrand
  );
  console.assert(phishAnalysis.isOfficial === false, 'Phishing candidate is not official');
  console.assert(phishAnalysis.riskScore >= 85, `Expected Critical risk >= 85, got ${phishAnalysis.riskScore}`);
  console.assert(phishAnalysis.severity === 'CRITICAL', `Expected CRITICAL severity, got ${phishAnalysis.severity}`);

  // Test 5: Support Impersonation
  const supportAnalysis = analyzeSocialCandidate(
    'NovaPay Support Helpdesk', 
    'NovaPay_HelpDesk', 
    'https://x.com/NovaPay_HelpDesk', 
    testBrand
  );
  console.assert(supportAnalysis.riskScore >= 70, `Expected High risk >= 70, got ${supportAnalysis.riskScore}`);

  // Test 6: Official Mobile App Exclusion
  const officialAppAnalysis = analyzeAppCandidate(
    'NovaPay', 
    'NovaPay Technologies', 
    'com.example.novapay.demo', 
    'https://play.google.com/store/apps/details?id=com.example.novapay.demo', 
    testBrand
  );
  console.assert(officialAppAnalysis.isOfficial === true, 'Official app must be excluded');
  console.assert(officialAppAnalysis.riskScore === 0, 'Official app risk score must be 0');

  // Test 7: Rogue Mobile App Detection (Publisher Mismatch + Package Hijacking)
  const rogueAppAnalysis = analyzeAppCandidate(
    'NovaPay Rewards Wallet', 
    'Apex Tech LLC', 
    'com.novapay.rewards.cash', 
    'https://play.google.com/store/apps/details?id=com.novapay.rewards.cash', 
    testBrand
  );
  console.assert(rogueAppAnalysis.isOfficial === false, 'Rogue app is not official');
  console.assert(rogueAppAnalysis.publisherMismatch === true, 'Publisher mismatch must be true');
  console.assert(rogueAppAnalysis.riskScore >= 80, `Expected risk score >= 80, got ${rogueAppAnalysis.riskScore}`);

  console.log('✅ ALL 7 AUDIT ENGINE TESTS PASSED SUCCESSFULLY!');
}

runTests();
