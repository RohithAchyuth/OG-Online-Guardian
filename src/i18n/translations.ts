import { Language } from '../types';

export interface Translations {
  // Brand & General
  brandName: string;
  tagline: string;
  demoMode: string;
  demoModeNotice: string;
  fictionalDataLabel: string;
  allRightsReserved: string;
  
  // Navigation
  navHome: string;
  navFeatures: string;
  navHowItWorks: string;
  navSecurity: string;
  navSignIn: string;
  navGetStarted: string;
  navDashboard: string;
  navOverview: string;
  navBrandProfile: string;
  navSocialMonitoring: string;
  navAppMonitoring: string;
  navThreatInvestigations: string;
  navReports: string;
  navNotifications: string;
  navSettings: string;
  navSignOut: string;

  // Landing Page
  heroTitle: string;
  heroSubtitle: string;
  ctaStartProtecting: string;
  ctaExploreDemo: string;
  featureSocialTitle: string;
  featureSocialDesc: string;
  featureAppTitle: string;
  featureAppDesc: string;
  featureLookalikeTitle: string;
  featureLookalikeDesc: string;
  howItWorksStep1Title: string;
  howItWorksStep1Desc: string;
  howItWorksStep2Title: string;
  howItWorksStep2Desc: string;
  howItWorksStep3Title: string;
  howItWorksStep3Desc: string;
  securitySectionTitle: string;
  securitySectionDesc: string;

  // Authentication
  authSignInTitle: string;
  authRegisterTitle: string;
  authEmailLabel: string;
  authPasswordLabel: string;
  authConfirmPasswordLabel: string;
  authFullNameLabel: string;
  authOrgLabel: string;
  authRememberMe: string;
  authForgotPassword: string;
  authSignInBtn: string;
  authRegisterBtn: string;
  authNoAccount: string;
  authHaveAccount: string;
  authJudgeLoginBtn: string;
  authTermsConsent: string;
  authPasswordStrengthWeak: string;
  authPasswordStrengthMedium: string;
  authPasswordStrengthStrong: string;
  authInvalidCreds: string;

  // Dashboard Overview
  statAssetsMonitored: string;
  statSocialImpersonations: string;
  statSuspiciousApps: string;
  statHighPriority: string;
  statResolvedThreats: string;
  statLastScan: string;
  chartThreatTrendsTitle: string;
  chartThreatDistributionTitle: string;
  chartSeverityBreakdownTitle: string;
  chartSourcesHealthTitle: string;
  recentDetectionsTitle: string;
  protectedAssetsTitle: string;

  // Social Monitoring
  socialScanNowBtn: string;
  socialSearchPlaceholder: string;
  socialFilterPlatform: string;
  socialFilterSeverity: string;
  socialFilterStatus: string;
  socialCandidateName: string;
  socialPlatformCol: string;
  socialUsernameCol: string;
  socialSimilarityCol: string;
  socialRiskScoreCol: string;
  socialSeverityCol: string;
  socialStatusCol: string;
  socialActionsCol: string;
  socialAddCandidateBtn: string;
  socialScanningProgress: string;

  // App Monitoring
  appScanNowBtn: string;
  appSearchPlaceholder: string;
  appFilterOS: string;
  appColAppName: string;
  appColPublisher: string;
  appColPackageId: string;
  appColPlatform: string;
  appColRiskScore: string;
  appColStatus: string;
  appAddCandidateBtn: string;
  appScanningProgress: string;

  // Investigation & Cases
  caseInvestigationTitle: string;
  caseOfficialAssetComparison: string;
  caseDetectionFactors: string;
  caseEvidenceSummary: string;
  caseAnalystNotes: string;
  caseRecommendedSteps: string;
  caseAuditTrail: string;
  actionMarkUnderReview: string;
  actionConfirmSuspicious: string;
  actionMarkFalsePositive: string;
  actionResolveCase: string;
  actionCopyEvidence: string;
  actionEvidenceCopied: string;
  actionAddNoteBtn: string;
  confirmActionPrompt: string;
  confirmBtn: string;
  cancelBtn: string;

  // Severities & Statuses
  severityCritical: string;
  severityHigh: string;
  severityMedium: string;
  severityLow: string;
  severityInformational: string;
  statusNew: string;
  statusUnderReview: string;
  statusConfirmedSuspicious: string;
  statusFalsePositive: string;
  statusResolved: string;

  // Reports & Settings
  reportsTitle: string;
  reportsExportCsvBtn: string;
  reportsPrintBtn: string;
  settingsTitle: string;
  settingsThresholdTitle: string;
  settingsThresholdDesc: string;
  settingsSaveBtn: string;
  settingsSuccessMessage: string;
  notificationsTitle: string;
  notificationsMarkAllRead: string;
  notificationsEmpty: string;

  // Firebase Dialog
  firebaseSetupTitle: string;
  firebaseStatusConnected: string;
  firebaseStatusDemo: string;
  firebaseInstructions: string;
  closeBtn: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: "Online Guardian",
    tagline: "Detect Impersonation. Protect Your Brand.",
    demoMode: "Judge Demo Mode Active",
    demoModeNotice: "Operating with verified fictional enterprise dataset (NovaPay). Live scanning simulated deterministically.",
    fictionalDataLabel: "Fictional Demo Data",
    allRightsReserved: "Enterprise Digital Risk Protection. All rights reserved.",

    navHome: "Home",
    navFeatures: "Features",
    navHowItWorks: "How It Works",
    navSecurity: "Security",
    navSignIn: "Sign In",
    navGetStarted: "Get Started",
    navDashboard: "Dashboard",
    navOverview: "Overview",
    navBrandProfile: "Brand Profile",
    navSocialMonitoring: "Social Monitoring",
    navAppMonitoring: "App Monitoring",
    navThreatInvestigations: "Threat Investigations",
    navReports: "Reports",
    navNotifications: "Notifications",
    navSettings: "Settings",
    navSignOut: "Sign Out",

    heroTitle: "Your Brand. Your Reputation. Protected.",
    heroSubtitle: "Detect fake social profiles, fraudulent brand pages, and suspicious mobile apps before they damage customer trust.",
    ctaStartProtecting: "Start Protecting Your Brand",
    ctaExploreDemo: "Explore Live Demo",
    featureSocialTitle: "Social Impersonation Detection",
    featureSocialDesc: "Continuous reconnaissance across X, Instagram, LinkedIn, and Facebook for unauthorized brand accounts and copycats.",
    featureAppTitle: "Suspicious App Discovery",
    featureAppDesc: "Scan Google Play and Apple App Store for unauthorized publisher apps hijacking brand names and bundle identifiers.",
    featureLookalikeTitle: "Intelligent Look-alike Analysis",
    featureLookalikeDesc: "Damerau-Levenshtein distance, homoglyph detection, and keyword modifier analytics evaluate impersonation risk.",
    howItWorksStep1Title: "1. Register Legitimate Brand Assets",
    howItWorksStep1Desc: "Provide verified official handles, official store URLs, publisher identifiers, and known brand aliases.",
    howItWorksStep2Title: "2. Real-Time Detection & Exclusion Engine",
    howItWorksStep2Desc: "Our weighted algorithm continuously audits candidates while strictly safeguarding legitimate registered assets.",
    howItWorksStep3Title: "3. Triage & Execute Threat Remediation",
    howItWorksStep3Desc: "Review side-by-side evidence, mark false positives, copy structured legal dossiers, and track audit trails.",
    securitySectionTitle: "Enterprise-Grade Architecture & Data Privacy",
    securitySectionDesc: "Zero-trust attribute-based access control, encrypted telemetry, and strict isolation for organizational brand assets.",

    authSignInTitle: "Sign in to Online Guardian",
    authRegisterTitle: "Create Organization Account",
    authEmailLabel: "Work Email",
    authPasswordLabel: "Password",
    authConfirmPasswordLabel: "Confirm Password",
    authFullNameLabel: "Full Name",
    authOrgLabel: "Organization Name",
    authRememberMe: "Remember my session",
    authForgotPassword: "Forgot password?",
    authSignInBtn: "Sign In",
    authRegisterBtn: "Create Security Account",
    authNoAccount: "Don't have an enterprise account?",
    authHaveAccount: "Already registered?",
    authJudgeLoginBtn: "Quick Sign-In as Hackathon Judge",
    authTermsConsent: "I accept Online Guardian Terms of Service and Privacy Protocols.",
    authPasswordStrengthWeak: "Weak password",
    authPasswordStrengthMedium: "Moderate strength",
    authPasswordStrengthStrong: "Strong enterprise password",
    authInvalidCreds: "Invalid credentials. Use Judge Quick Sign-In for demo access.",

    statAssetsMonitored: "Assets Monitored",
    statSocialImpersonations: "Potential Social Threats",
    statSuspiciousApps: "Suspicious Mobile Apps",
    statHighPriority: "High-Priority Detections",
    statResolvedThreats: "Resolved Threats",
    statLastScan: "Last Monitoring Scan",
    chartThreatTrendsTitle: "Threat Detections Over Time",
    chartThreatDistributionTitle: "Social vs. Mobile Threat Distribution",
    chartSeverityBreakdownTitle: "Threat Severity Breakdown",
    chartSourcesHealthTitle: "Monitoring Source Availability",
    recentDetectionsTitle: "Recent Discovered Candidates",
    protectedAssetsTitle: "Verified Official Assets",

    socialScanNowBtn: "Scan Social Profiles",
    socialSearchPlaceholder: "Search account name, handle or indicator...",
    socialFilterPlatform: "All Platforms",
    socialFilterSeverity: "All Severities",
    socialFilterStatus: "All Statuses",
    socialCandidateName: "Suspected Account",
    socialPlatformCol: "Platform",
    socialUsernameCol: "Username / URL",
    socialSimilarityCol: "Similarity",
    socialRiskScoreCol: "Risk Score",
    socialSeverityCol: "Severity",
    socialStatusCol: "Review Status",
    socialActionsCol: "Actions",
    socialAddCandidateBtn: "Add Candidate",
    socialScanningProgress: "Analyzing candidate profiles against brand registry...",

    appScanNowBtn: "Scan App Stores",
    appSearchPlaceholder: "Search app name, publisher or package ID...",
    appFilterOS: "All Stores",
    appColAppName: "Application Name",
    appColPublisher: "Publisher / Developer",
    appColPackageId: "Package Identifier",
    appColPlatform: "Store",
    appColRiskScore: "Risk Score",
    appColStatus: "Review Status",
    appAddCandidateBtn: "Add Candidate App",
    appScanningProgress: "Querying app store repositories and analyzing publisher trust...",

    caseInvestigationTitle: "Threat Investigation Case",
    caseOfficialAssetComparison: "Official Asset Comparison",
    caseDetectionFactors: "Weighted Risk Factor Breakdown",
    caseEvidenceSummary: "Evidence Dossier",
    caseAnalystNotes: "Analyst Investigation Notes",
    caseRecommendedSteps: "Recommended Remediation Steps",
    caseAuditTrail: "Audit History & Actions",
    actionMarkUnderReview: "Mark Under Review",
    actionConfirmSuspicious: "Confirm Suspicious",
    actionMarkFalsePositive: "Mark False Positive",
    actionResolveCase: "Resolve Case",
    actionCopyEvidence: "Copy Evidence Dossier",
    actionEvidenceCopied: "Copied to Clipboard!",
    actionAddNoteBtn: "Save Note",
    confirmActionPrompt: "Are you sure you want to change this investigation status?",
    confirmBtn: "Confirm Status Change",
    cancelBtn: "Cancel",

    severityCritical: "Critical",
    severityHigh: "High",
    severityMedium: "Medium",
    severityLow: "Low",
    severityInformational: "Informational",
    statusNew: "New",
    statusUnderReview: "Under Review",
    statusConfirmedSuspicious: "Confirmed Suspicious",
    statusFalsePositive: "False Positive",
    statusResolved: "Resolved",

    reportsTitle: "Digital Risk Intelligence Reports",
    reportsExportCsvBtn: "Export CSV Dataset",
    reportsPrintBtn: "Generate Executive Summary",
    settingsTitle: "Platform & Security Settings",
    settingsThresholdTitle: "Impersonation Sensitivity Threshold",
    settingsThresholdDesc: "Adjust minimum composite similarity score required to flag candidate profiles.",
    settingsSaveBtn: "Save Preferences",
    settingsSuccessMessage: "Configuration updated successfully.",
    notificationsTitle: "Security Alerts & Notifications",
    notificationsMarkAllRead: "Mark all as read",
    notificationsEmpty: "No unread security alerts.",

    firebaseSetupTitle: "Firebase Backend Configuration",
    firebaseStatusConnected: "Live Cloud Firestore & Auth Connected",
    firebaseStatusDemo: "Running in Isolated Demo Store (Hackathon Mode)",
    firebaseInstructions: "To link live production Firebase, configure environment variables VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc. in your deployment.",
    closeBtn: "Close",
  },

  te: {
    brandName: "Online Guardian",
    tagline: "నకిలీలను గుర్తించండి. మీ బ్రాండ్‌ను రక్షించండి.",
    demoMode: "జడ్జ్ డెమో మోడ్ యాక్టివ్‌లో ఉంది",
    demoModeNotice: "ధృవీకరించబడిన కల్పిత సంస్థ డేటాసెట్ (NovaPay) తో రన్ అవుతోంది. లైవ్ స్కానింగ్ సిమ్యులేట్ చేయబడింది.",
    fictionalDataLabel: "కల్పిత డెమో డేటా",
    allRightsReserved: "ఎంటర్‌ప్రైజ్ డిజిటల్ రిస్క్ ప్రొటెక్షన్. సర్వ హక్కులు ప్రత్యేకించబడ్డాయి.",

    navHome: "హోమ్",
    navFeatures: "ఫీచర్లు",
    navHowItWorks: "ఇది ఎలా పనిచేస్తుంది",
    navSecurity: "భద్రత",
    navSignIn: "లాగిన్",
    navGetStarted: "ప్రారంభించండి",
    navDashboard: "డాష్‌బోర్డ్",
    navOverview: "అవలోకనం",
    navBrandProfile: "బ్రాండ్ ప్రొఫైల్",
    navSocialMonitoring: "సోషల్ మానిటరింగ్",
    navAppMonitoring: "యాప్ మానిటరింగ్",
    navThreatInvestigations: "ముప్పు విచారణలు",
    navReports: "నివేదికలు",
    navNotifications: "నోటిఫికేషన్లు",
    navSettings: "సెట్టింగ్‌లు",
    navSignOut: "సైన్ అవుట్",

    heroTitle: "మీ బ్రాండ్. మీ ప్రతిష్ట. రక్షించబడింది.",
    heroSubtitle: "కస్టమర్ నమ్మకాన్ని దెబ్బతీసే ముందు నకిలీ సోషల్ ప్రొఫైల్‌లు, బ్రాండ్ పేజీలు మరియు అనుమానాస్పద మొబైల్ యాప్‌లను గుర్తించండి.",
    ctaStartProtecting: "మీ బ్రాండ్‌ను రక్షించడం ప్రారంభించండి",
    ctaExploreDemo: "లైవ్ డెమోని అన్వేషించండి",
    featureSocialTitle: "సోషల్ ఇంపర్సనేషన్ డిటెక్షన్",
    featureSocialDesc: "అనధికారిక బ్రాండ్ ఖాతాలు మరియు నకిలీల కోసం X, Instagram, LinkedIn, మరియు Facebook లో నిరంతర నిఘా.",
    featureAppTitle: "అనుమానాస్పద యాప్ ఆవిష్కరణ",
    featureAppDesc: "బ్రాండ్ పేర్లను దుర్వినియోగం చేస్తున్న అనధికారిక పబ్లిషర్ యాప్‌ల కోసం Google Play మరియు App Store ను స్కాన్ చేయండి.",
    featureLookalikeTitle: "ఇంటెలిజెంట్ పోలిక విశ్లేషణ",
    featureLookalikeDesc: "డమెరౌ-లెవెన్‌ష్టీన్ దూరం, హోమోగ్లిఫ్ గుర్తింపు మరియు కీవర్డ్ మోడిఫైయర్ల ద్వారా ముప్పు స్థాయి అంచనా.",
    howItWorksStep1Title: "1. అధికారిక బ్రాండ్ ఆస్తులను నమోదు చేయండి",
    howItWorksStep1Desc: "ధృవీకరించబడిన అధికారిక హ్యాండిల్స్, స్టోర్ URLలు మరియు పబ్లిషర్ వివరాలను అందించండి.",
    howItWorksStep2Title: "2. నిజ-సమయ గుర్తింపు & మినహాయింపు ఇంజిన్",
    howItWorksStep2Desc: "మా అల్గోరిథం అధికారిక ఆస్తులను మినహాయిస్తూ నకిలీలను ఖచ్చితంగా గుర్తిస్తుంది.",
    howItWorksStep3Title: "3. ముప్పు విచారణ & పరిష్కారం",
    howItWorksStep3Desc: "సాక్ష్యాలను సరిపోల్చండి, ఫాల్స్ పాజిటివ్‌లను గుర్తించండి మరియు చట్టపరమైన నివేదికలను కాపీ చేయండి.",
    securitySectionTitle: "ఎంటర్‌ప్రైజ్ ఆర్కిటెక్చర్ & డేటా గోప్యత",
    securitySectionDesc: "జీరో-ట్రస్ట్ ఆధారిత యాక్సెస్ కంట్రోల్ మరియు ఎన్‌క్రిప్టెడ్ భద్రత.",

    authSignInTitle: "Online Guardian లోకి సైన్ ఇన్ చేయండి",
    authRegisterTitle: "సంస్థ ఖాతాను సృష్టించండి",
    authEmailLabel: "వర్క్ ఈమెయిల్",
    authPasswordLabel: "పాస్‌వర్డ్",
    authConfirmPasswordLabel: "పాస్‌వర్డ్ నిర్ధారించండి",
    authFullNameLabel: "పూర్తి పేరు",
    authOrgLabel: "సంస్థ పేరు",
    authRememberMe: "నన్ను గుర్తుంచుకో",
    authForgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    authSignInBtn: "సైన్ ఇన్",
    authRegisterBtn: "ఖాతాను సృష్టించండి",
    authNoAccount: "ఖాతా లేదా?",
    authHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    authJudgeLoginBtn: "హ్యాకథాన్ జడ్జ్ లాగిన్",
    authTermsConsent: "నేను సేవా నిబంధనలను అంగీకరిస్తున్నాను.",
    authPasswordStrengthWeak: "బలహీనమైన పాస్‌వర్డ్",
    authPasswordStrengthMedium: "మధ్యస్థ బలం",
    authPasswordStrengthStrong: "బలమైన పాస్‌వర్డ్",
    authInvalidCreds: "చెల్లని ఆధారాలు. డెమో కోసం జడ్జ్ లాగిన్ ఉపయోగించండి.",

    statAssetsMonitored: "పర్యవేక్షించబడుతున్న ఆస్తులు",
    statSocialImpersonations: "సాధారణ సోషల్ ముప్పులు",
    statSuspiciousApps: "అనుమానాస్పద మొబైల్ యాప్‌లు",
    statHighPriority: "అధిక ప్రాధాన్యత గుర్తింపులు",
    statResolvedThreats: "పరిష్కరించబడిన ముప్పులు",
    statLastScan: "చివరి స్కానింగ్ సమయం",
    chartThreatTrendsTitle: "కాలక్రమేణా ముప్పు గుర్తింపులు",
    chartThreatDistributionTitle: "సోషల్ vs మొబైల్ ముప్పు పంపిణీ",
    chartSeverityBreakdownTitle: "ముప్పు తీవ్రత విభజన",
    chartSourcesHealthTitle: "మానిటరింగ్ మూలాల లభ్యత",
    recentDetectionsTitle: "ఇటీవలి గుర్తింపులు",
    protectedAssetsTitle: "రక్షించబడిన అధికారిక ఆస్తులు",

    socialScanNowBtn: "సోషల్ ప్రొఫైల్‌లను స్కాన్ చేయండి",
    socialSearchPlaceholder: "ఖాతా పేరు లేదా హ్యాండిల్ వెతకండి...",
    socialFilterPlatform: "అన్ని ప్లాట్‌ఫారమ్‌లు",
    socialFilterSeverity: "అన్ని తీవ్రతలు",
    socialFilterStatus: "అన్ని స్థితిగతులు",
    socialCandidateName: "అనుమానిత ఖాతా",
    socialPlatformCol: "ప్లాట్‌ఫారమ్",
    socialUsernameCol: "యూజర్‌నేమ్ / URL",
    socialSimilarityCol: "పోలిక శాతం",
    socialRiskScoreCol: "రిస్క్ స్కోరు",
    socialSeverityCol: "తీవ్రత",
    socialStatusCol: "సమీక్ష స్థితి",
    socialActionsCol: "చర్యలు",
    socialAddCandidateBtn: "ఖాతాను జోడించండి",
    socialScanningProgress: "ప్రొఫైల్‌లను విశ్లేషిస్తోంది...",

    appScanNowBtn: "యాప్ స్టోర్‌లను స్కాన్ చేయండి",
    appSearchPlaceholder: "యాప్ పేరు లేదా ప్యాకేజీ ID వెతకండి...",
    appFilterOS: "అన్ని స్టోర్‌లు",
    appColAppName: "యాప్ పేరు",
    appColPublisher: "పబ్లిషర్ / డెవలపర్",
    appColPackageId: "ప్యాకేజ్ ఐడెంటిఫైయర్",
    appColPlatform: "స్టోర్",
    appColRiskScore: "రిస్క్ స్కోరు",
    appColStatus: "సమీక్ష స్థితి",
    appAddCandidateBtn: "యాప్‌ను జోడించండి",
    appScanningProgress: "యాప్ స్టోర్‌లను విశ్లేషిస్తోంది...",

    caseInvestigationTitle: "ముప్పు విచారణ కేసు",
    caseOfficialAssetComparison: "అధికారిక ఆస్తితో పోలిక",
    caseDetectionFactors: "రిస్క్ కారణాల విశ్లేషణ",
    caseEvidenceSummary: "సాక్ష్యాల సారాంశం",
    caseAnalystNotes: "విశ్లేషకుల గమనికలు",
    caseRecommendedSteps: "సిఫార్సు చేయబడిన తదుపరి చర్యలు",
    caseAuditTrail: "ఆడిట్ చరిత్ర",
    actionMarkUnderReview: "సమీక్షలో ఉందని గుర్తించండి",
    actionConfirmSuspicious: "అనుమానాస్పదంగా నిర్ధారించండి",
    actionMarkFalsePositive: "తప్పుడు అలారంగా గుర్తించండి",
    actionResolveCase: "కేసును పరిష్కరించండి",
    actionCopyEvidence: "సాక్ష్యాలను కాపీ చేయండి",
    actionEvidenceCopied: "క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!",
    actionAddNoteBtn: "గమనికను సేవ్ చేయండి",
    confirmActionPrompt: "మీరు ఈ కేసు స్థితిని మార్చాలనుకుంటున్నారా?",
    confirmBtn: "మార్పును నిర్ధారించండి",
    cancelBtn: "రద్దు చేయండి",

    severityCritical: "కీలకమైనది (Critical)",
    severityHigh: "అధికం (High)",
    severityMedium: "మధ్యస్థం (Medium)",
    severityLow: "తక్కువ (Low)",
    severityInformational: "సమాచార ప్రాయం",
    statusNew: "కొత్తది",
    statusUnderReview: "సమీక్షలో ఉంది",
    statusConfirmedSuspicious: "అనుమానాస్పదంగా నిర్ధారించబడింది",
    statusFalsePositive: "తప్పుడు అలారం (False Positive)",
    statusResolved: "పరిష్కరించబడింది",

    reportsTitle: "డిజిటల్ రిస్క్ ఇంటెలిజెన్స్ నివేదికలు",
    reportsExportCsvBtn: "CSV డౌన్‌లోడ్ చేయండి",
    reportsPrintBtn: "సారాంశ నివేదికను రూపొందించండి",
    settingsTitle: "ప్లాట్‌ఫారమ్ సెట్టింగ్‌లు",
    settingsThresholdTitle: "సెన్సిటివిటీ థ్రెషోల్డ్",
    settingsThresholdDesc: "అనుమానాస్పద ఖాతాలను ఫ్లాగ్ చేయడానికి అవసరమైన కనీస స్కోరును సెట్ చేయండి.",
    settingsSaveBtn: "సేవ్ చేయండి",
    settingsSuccessMessage: "కాన్ఫిగరేషన్ విజయవంతంగా అప్‌డేట్ చేయబడింది.",
    notificationsTitle: "భద్రతా హెచ్చరికలు",
    notificationsMarkAllRead: "అన్నీ చదివినట్లుగా గుర్తించండి",
    notificationsEmpty: "హెచ్చరికలు లేవు.",

    firebaseSetupTitle: "ఫైర్‌బేస్ బ్యాకెండ్ కాన్ఫిగరేషన్",
    firebaseStatusConnected: "లైవ్ Cloud Firestore & Auth కనెక్ట్ చేయబడింది",
    firebaseStatusDemo: "డెమో మోడ్‌లో నడుస్తోంది (Hackathon Mode)",
    firebaseInstructions: "లైవ్ ఫైర్‌బేస్‌ను కనెక్ట్ చేయడానికి ఎన్విరాన్‌మెంట్ వేరియబుల్స్‌ను కాన్ఫిగర్ చేయండి.",
    closeBtn: "మూసివేయండి",
  },

  hi: {
    brandName: "Online Guardian",
    tagline: "नकली प्रोफाइल पहचानें। अपने ब्रांड की रक्षा करें।",
    demoMode: "जज डेमो मोड सक्रिय",
    demoModeNotice: "सत्यापित काल्पनिक कॉर्पोरेट डेटासेट (NovaPay) के साथ चल रहा है। स्कैनिंग सिम्युलेटेड है।",
    fictionalDataLabel: "काल्पनिक डेमो डेटा",
    allRightsReserved: "एंटरप्राइज डिजिटल रिस्क प्रोटेक्शन। सर्वाधिकार सुरक्षित।",

    navHome: "होम",
    navFeatures: "विशेषताएं",
    navHowItWorks: "यह कैसे काम करता है",
    navSecurity: "सुरक्षा",
    navSignIn: "साइन इन",
    navGetStarted: "शुरू करें",
    navDashboard: "डैशबोर्ड",
    navOverview: "अवलोकन",
    navBrandProfile: "ब्रांड प्रोफाइल",
    navSocialMonitoring: "सोशल मॉनिटरिंग",
    navAppMonitoring: "ऐप मॉनिटरिंग",
    navThreatInvestigations: "खतरे की जांच",
    navReports: "रिपोर्ट्स",
    navNotifications: "सूचनाएं",
    navSettings: "सेटिंग्स",
    navSignOut: "साइन आउट",

    heroTitle: "आपका ब्रांड। आपकी प्रतिष्ठा। सुरक्षित।",
    heroSubtitle: "ग्राहकों के भरोसे को नुकसान पहुंचाने से पहले नकली सोशल प्रोफाइल, पेजों और संदिग्ध ऐप्स का पता लगाएं।",
    ctaStartProtecting: "ब्रांड सुरक्षा शुरू करें",
    ctaExploreDemo: "लाइव डेमो देखें",
    featureSocialTitle: "सोशल प्रतिरूपण पहचान",
    featureSocialDesc: "अनधिकृत खातों और नकलचियों के लिए X, Instagram, LinkedIn, और Facebook की निरंतर निगरानी।",
    featureAppTitle: "संदिग्ध ऐप खोज",
    featureAppDesc: "ब्रांड नाम चुराने वाले अनधिकृत ऐप्स के लिए Google Play और App Store को स्कैन करें।",
    featureLookalikeTitle: "सटीक हमशक्ल विश्लेषण",
    featureLookalikeDesc: "डैमरो-लेवेनशेटिन दूरी, होमोग्लिफ़ पहचान और जोखिम स्कोरिंग के माध्यम से सटीक जांच।",
    howItWorksStep1Title: "1. आधिकारिक ब्रांड संपत्तियां दर्ज करें",
    howItWorksStep1Desc: "सत्यापित हैंडल, स्टोर URL और प्रकाशक विवरण प्रदान करें।",
    howItWorksStep2Title: "2. रीयल-टाइम डिटेक्शन और अपवर्जन इंजन",
    howItWorksStep2Desc: "हमारा एल्गोरिदम आधिकारिक संपत्तियों को सुरक्षित रखते हुए संदिग्धों को ढूंढता है।",
    howItWorksStep3Title: "3. जांच करें और कार्रवाई करें",
    howItWorksStep3Desc: "सबूतों की तुलना करें, गलत पहचान को चिह्नित करें और कानूनी रिपोर्ट तैयार करें।",
    securitySectionTitle: "एंटरप्राइज-ग्रेड आर्किटेक्चर और गोपनीयता",
    securitySectionDesc: "जीरो-ट्रस्ट सुरक्षा और संगठनात्मक डेटा का कड़ा अलगाव।",

    authSignInTitle: "Online Guardian में साइन इन करें",
    authRegisterTitle: "संगठन खाता बनाएं",
    authEmailLabel: "कार्य ईमेल",
    authPasswordLabel: "पासवर्ड",
    authConfirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    authFullNameLabel: "पूरा नाम",
    authOrgLabel: "संगठन का नाम",
    authRememberMe: "मुझे याद रखें",
    authForgotPassword: "पासवर्ड भूल गए?",
    authSignInBtn: "साइन इन करें",
    authRegisterBtn: "खाता बनाएं",
    authNoAccount: "खाता नहीं है?",
    authHaveAccount: "पहले से पंजीकृत हैं?",
    authJudgeLoginBtn: "हैकाथॉन जज के रूप में त्वरित साइन-इन",
    authTermsConsent: "मैं सेवा की शर्तों को स्वीकार करता हूं।",
    authPasswordStrengthWeak: "कमजोर पासवर्ड",
    authPasswordStrengthMedium: "मध्यम शक्ति",
    authPasswordStrengthStrong: "मजबूत पासवर्ड",
    authInvalidCreds: "अमान्य क्रेडेंशियल। डेमो के लिए जज साइन-इन का उपयोग करें।",

    statAssetsMonitored: "निगरानी संपत्तियां",
    statSocialImpersonations: "संभावित सोशल खतरे",
    statSuspiciousApps: "संदिग्ध मोबाइल ऐप्स",
    statHighPriority: "उच्च प्राथमिकता वाली पहचान",
    statResolvedThreats: "हल किए गए खतरे",
    statLastScan: "अंतिम स्कैन का समय",
    chartThreatTrendsTitle: "समय के साथ खतरे की पहचान",
    chartThreatDistributionTitle: "सोशल बनाम मोबाइल खतरा वितरण",
    chartSeverityBreakdownTitle: "गंभीरता वर्गीकरण",
    chartSourcesHealthTitle: "मॉनिटरिंग स्रोतों की उपलब्धता",
    recentDetectionsTitle: "हालिया मिली पहचानें",
    protectedAssetsTitle: "सुरक्षित आधिकारिक संपत्तियां",

    socialScanNowBtn: "सोशल प्रोफाइल स्कैन करें",
    socialSearchPlaceholder: "खाता नाम या हैंडल खोजें...",
    socialFilterPlatform: "सभी प्लेटफॉर्म",
    socialFilterSeverity: "सभी गंभीरताएं",
    socialFilterStatus: "सभी स्थितियां",
    socialCandidateName: "संदिग्ध खाता",
    socialPlatformCol: "प्लेटफॉर्म",
    socialUsernameCol: "यूजरनेम / URL",
    socialSimilarityCol: "समानता",
    socialRiskScoreCol: "जोखिम स्कोर",
    socialSeverityCol: "गंभीरता",
    socialStatusCol: "समीक्षा स्थिति",
    socialActionsCol: "कार्रवाई",
    socialAddCandidateBtn: "खाता जोड़ें",
    socialScanningProgress: "प्रोफाइलों का विश्लेषण जारी है...",

    appScanNowBtn: "ऐप स्टोर स्कैन करें",
    appSearchPlaceholder: "ऐप नाम या पैकेज ID खोजें...",
    appFilterOS: "सभी स्टोर",
    appColAppName: "ऐप का नाम",
    appColPublisher: "प्रकाशक / डेवलपर",
    appColPackageId: "पैकेज पहचानकर्ता",
    appColPlatform: "स्टोर",
    appColRiskScore: "जोखिम स्कोर",
    appColStatus: "समीक्षा स्थिति",
    appAddCandidateBtn: "ऐप जोड़ें",
    appScanningProgress: "ऐप स्टोर का विश्लेषण हो रहा है...",

    caseInvestigationTitle: "खतरे की जांच मामला",
    caseOfficialAssetComparison: "आधिकारिक संपत्ति से तुलना",
    caseDetectionFactors: "जोखिम कारकों का विश्लेषण",
    caseEvidenceSummary: "सबूतों का सारांश",
    caseAnalystNotes: "विश्लेषक नोट्स",
    caseRecommendedSteps: "अनुशंसित सुधारात्मक कदम",
    caseAuditTrail: "ऑडिट इतिहास",
    actionMarkUnderReview: "समीक्षाधीन चिह्नित करें",
    actionConfirmSuspicious: "संदिग्ध के रूप में पुष्टि करें",
    actionMarkFalsePositive: "गलत पहचान (False Positive)",
    actionResolveCase: "मामला हल करें",
    actionCopyEvidence: "सबूत कॉपी करें",
    actionEvidenceCopied: "क्लिपबोर्ड पर कॉपी हो गया!",
    actionAddNoteBtn: "नोट सहेजें",
    confirmActionPrompt: "क्या आप इस मामले की स्थिति बदलना चाहते हैं?",
    confirmBtn: "बदलाव की पुष्टि करें",
    cancelBtn: "रद्द करें",

    severityCritical: "गंभीर (Critical)",
    severityHigh: "उच्च (High)",
    severityMedium: "मध्यम (Medium)",
    severityLow: "कम (Low)",
    severityInformational: "सूचनात्मक",
    statusNew: "नया",
    statusUnderReview: "समीक्षाधीन",
    statusConfirmedSuspicious: "संदिग्ध की पुष्टि",
    statusFalsePositive: "गलत चेतावनी",
    statusResolved: "हल किया गया",

    reportsTitle: "डिजिटल जोखिम रिपोर्ट",
    reportsExportCsvBtn: "CSV निर्यात करें",
    reportsPrintBtn: "कार्यकारी सारांश तैयार करें",
    settingsTitle: "प्लेटफ़ॉर्म सेटिंग्स",
    settingsThresholdTitle: "संवेदनशीलता सीमा",
    settingsThresholdDesc: "संदिग्ध खातों को चिह्नित करने के लिए न्यूनतम स्कोर निर्धारित करें।",
    settingsSaveBtn: "सहेजें",
    settingsSuccessMessage: "कॉन्फ़िगरेशन सफलतापूर्वक अपडेट किया गया।",
    notificationsTitle: "सुरक्षा अलर्ट",
    notificationsMarkAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
    notificationsEmpty: "कोई नया अलर्ट नहीं।",

    firebaseSetupTitle: "फायरबेस बैकएंड कॉन्फ़िगरेशन",
    firebaseStatusConnected: "लाइव Cloud Firestore और Auth जुड़ा हुआ है",
    firebaseStatusDemo: "डेमो मोड में चल रहा है (Hackathon Mode)",
    firebaseInstructions: "लाइव फायरबेस को जोड़ने के लिए पर्यावरण चर कॉन्फ़िगर करें।",
    closeBtn: "बंद करें",
  },

  es: {
    brandName: "Online Guardian",
    tagline: "Detecte Suplantaciones. Proteja su Marca.",
    demoMode: "Modo Demostración de Jueces Activo",
    demoModeNotice: "Operando con conjunto de datos corporativo de prueba (NovaPay). Escaneos simulados de manera determinista.",
    fictionalDataLabel: "Datos Ficticios de Demostración",
    allRightsReserved: "Protección Contra Riesgos Digitales Corporativos. Todos los derechos reservados.",

    navHome: "Inicio",
    navFeatures: "Características",
    navHowItWorks: "Cómo Funciona",
    navSecurity: "Seguridad",
    navSignIn: "Iniciar Sesión",
    navGetStarted: "Comenzar",
    navDashboard: "Panel",
    navOverview: "Resumen",
    navBrandProfile: "Perfil de Marca",
    navSocialMonitoring: "Monitoreo Social",
    navAppMonitoring: "Monitoreo de Aplicaciones",
    navThreatInvestigations: "Investigaciones",
    navReports: "Reportes",
    navNotifications: "Notificaciones",
    navSettings: "Configuración",
    navSignOut: "Cerrar Sesión",

    heroTitle: "Su Marca. Su Reputación. Protegida.",
    heroSubtitle: "Detecte perfiles sociales falsos, páginas fraudulentas y aplicaciones móviles sospechosas antes de que dañen la confianza del cliente.",
    ctaStartProtecting: "Comience a Proteger su Marca",
    ctaExploreDemo: "Explorar Demo en Vivo",
    featureSocialTitle: "Detección de Suplantación en Redes",
    featureSocialDesc: "Reconocimiento continuo en X, Instagram, LinkedIn y Facebook en busca de cuentas no autorizadas.",
    featureAppTitle: "Descubrimiento de Apps Sospechosas",
    featureAppDesc: "Escanee Google Play y App Store en busca de aplicaciones que utilizan indebidamente el nombre de su marca.",
    featureLookalikeTitle: "Análisis Inteligente de Similitud",
    featureLookalikeDesc: "Distancia Damerau-Levenshtein, detección de homoglifos y modificadores de alto riesgo para evaluar amenazas.",
    howItWorksStep1Title: "1. Registre sus Activos Legítimos",
    howItWorksStep1Desc: "Proporcione identificadores oficiales, URLs de tiendas y desarrolladores autorizados.",
    howItWorksStep2Title: "2. Motor de Detección y Exclusión",
    howItWorksStep2Desc: "Nuestro algoritmo audita candidatos excluyendo estrictamente los activos registrados.",
    howItWorksStep3Title: "3. Investigue y Resuelva Amenazas",
    howItWorksStep3Desc: "Revise pruebas lado a lado, marque falsos positivos y exporte expedientes legales.",
    securitySectionTitle: "Arquitectura Corporativa y Privacidad",
    securitySectionDesc: "Control de acceso basado en atributos Zero-Trust y aislamiento estricto de activos.",

    authSignInTitle: "Iniciar sesión en Online Guardian",
    authRegisterTitle: "Crear Cuenta de Organización",
    authEmailLabel: "Correo Electrónico Corporativo",
    authPasswordLabel: "Contraseña",
    authConfirmPasswordLabel: "Confirmar Contraseña",
    authFullNameLabel: "Nombre Completo",
    authOrgLabel: "Nombre de la Organización",
    authRememberMe: "Recordar mi sesión",
    authForgotPassword: "¿Olvidó su contraseña?",
    authSignInBtn: "Iniciar Sesión",
    authRegisterBtn: "Crear Cuenta de Seguridad",
    authNoAccount: "¿No tiene una cuenta corporativa?",
    authHaveAccount: "¿Ya está registrado?",
    authJudgeLoginBtn: "Acceso Rápido para Juez de Hackathon",
    authTermsConsent: "Acepto los Términos de Servicio y Privacidad de Online Guardian.",
    authPasswordStrengthWeak: "Contraseña débil",
    authPasswordStrengthMedium: "Fuerza moderada",
    authPasswordStrengthStrong: "Contraseña empresarial fuerte",
    authInvalidCreds: "Credenciales inválidas. Use el acceso rápido de Juez para demostración.",

    statAssetsMonitored: "Activos Monitoreados",
    statSocialImpersonations: "Posibles Amenazas Sociales",
    statSuspiciousApps: "Aplicaciones Sospechosas",
    statHighPriority: "Detecciones de Alta Prioridad",
    statResolvedThreats: "Amenazas Resueltas",
    statLastScan: "Último Escaneo",
    chartThreatTrendsTitle: "Detección de Amenazas en el Tiempo",
    chartThreatDistributionTitle: "Distribución de Amenazas (Social vs Móvil)",
    chartSeverityBreakdownTitle: "Desglose por Severidad",
    chartSourcesHealthTitle: "Disponibilidad de Fuentes de Monitoreo",
    recentDetectionsTitle: "Candidatos Recientemente Detectados",
    protectedAssetsTitle: "Activos Oficiales Verificados",

    socialScanNowBtn: "Escanear Perfiles Sociales",
    socialSearchPlaceholder: "Buscar nombre de cuenta o indicador...",
    socialFilterPlatform: "Todas las Plataformas",
    socialFilterSeverity: "Todas las Severidades",
    socialFilterStatus: "Todos los Estados",
    socialCandidateName: "Cuenta Sospechosa",
    socialPlatformCol: "Plataforma",
    socialUsernameCol: "Usuario / URL",
    socialSimilarityCol: "Similitud",
    socialRiskScoreCol: "Puntuación de Riesgo",
    socialSeverityCol: "Severidad",
    socialStatusCol: "Estado",
    socialActionsCol: "Acciones",
    socialAddCandidateBtn: "Agregar Candidato",
    socialScanningProgress: "Analizando perfiles contra el registro de la marca...",

    appScanNowBtn: "Escanear Tiendas de Apps",
    appSearchPlaceholder: "Buscar nombre de app o package ID...",
    appFilterOS: "Todas las Tiendas",
    appColAppName: "Nombre de la Aplicación",
    appColPublisher: "Desarrollador / Publicador",
    appColPackageId: "Identificador de Paquete",
    appColPlatform: "Tienda",
    appColRiskScore: "Puntuación de Riesgo",
    appColStatus: "Estado",
    appAddCandidateBtn: "Agregar App Candidata",
    appScanningProgress: "Consultando repositorios de tiendas y analizando reputación...",

    caseInvestigationTitle: "Caso de Investigación de Amenaza",
    caseOfficialAssetComparison: "Comparación con Activo Oficial",
    caseDetectionFactors: "Desglose Ponderado de Factores",
    caseEvidenceSummary: "Expediente de Evidencia",
    caseAnalystNotes: "Notas del Analista",
    caseRecommendedSteps: "Pasos Recomendados de Mitigación",
    caseAuditTrail: "Historial de Auditoría",
    actionMarkUnderReview: "Marcar en Revisión",
    actionConfirmSuspicious: "Confirmar Sospechoso",
    actionMarkFalsePositive: "Marcar Falso Positivo",
    actionResolveCase: "Resolver Caso",
    actionCopyEvidence: "Copiar Expediente de Evidencia",
    actionEvidenceCopied: "¡Copiado al Portapapeles!",
    actionAddNoteBtn: "Guardar Nota",
    confirmActionPrompt: "¿Está seguro de que desea cambiar el estado de este caso?",
    confirmBtn: "Confirmar Cambio",
    cancelBtn: "Cancelar",

    severityCritical: "Crítico",
    severityHigh: "Alto",
    severityMedium: "Medio",
    severityLow: "Bajo",
    severityInformational: "Informativo",
    statusNew: "Nuevo",
    statusUnderReview: "En Revisión",
    statusConfirmedSuspicious: "Sospechoso Confirmado",
    statusFalsePositive: "Falso Positivo",
    statusResolved: "Resuelto",

    reportsTitle: "Reportes de Inteligencia de Riesgo",
    reportsExportCsvBtn: "Exportar Conjunto de Datos CSV",
    reportsPrintBtn: "Generar Resumen Ejecutivo",
    settingsTitle: "Configuración de Seguridad y Plataforma",
    settingsThresholdTitle: "Umbral de Sensibilidad",
    settingsThresholdDesc: "Ajuste el puntaje mínimo requerido para alertar sobre perfiles sospechosos.",
    settingsSaveBtn: "Guardar Preferencias",
    settingsSuccessMessage: "Configuración guardada exitosamente.",
    notificationsTitle: "Alertas y Notificaciones de Seguridad",
    notificationsMarkAllRead: "Marcar todas como leídas",
    notificationsEmpty: "Sin alertas pendientes.",

    firebaseSetupTitle: "Configuración del Backend de Firebase",
    firebaseStatusConnected: "Cloud Firestore y Auth Conectados en Vivo",
    firebaseStatusDemo: "Operando en Almacén de Demostración Aislado (Modo Hackathon)",
    firebaseInstructions: "Para vincular Firebase de producción, configure las variables de entorno VITE_FIREBASE_API_KEY, etc.",
    closeBtn: "Cerrar",
  }
};
