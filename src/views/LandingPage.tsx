import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Navbar } from '../components/Navbar';
import { SentinelLogo } from '../components/SentinelLogo';
import { 
  ShieldCheck, 
  Share2, 
  Smartphone, 
  Search, 
  CheckCircle2, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Database,
  Eye,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onExploreDemo: () => void;
  onOpenFirebaseModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreDemo,
  onOpenFirebaseModal,
}) => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Online Guardian detect look-alike account handles and typosquatting?",
      a: "Online Guardian leverages normalized string distance metrics (Damerau-Levenshtein and Jaro-Winkler) along with automated homoglyph detection (e.g. 0 for o, 1 for l, rn for m). It correlates these with high-risk deceptive keywords like 'support' and 'rewards' to accurately surface impersonators."
    },
    {
      q: "Are legitimate official brand channels protected from false alerts?",
      a: "Yes. Online Guardian implements a strict pre-filtering exclusion engine. Registered official handles, verified app store package IDs, and authorized publishers are registered in your Brand Profile and automatically whitelisted from threat pipelines."
    },
    {
      q: "How does App Store Monitoring identify unauthorized mobile apps?",
      a: "The platform analyzes candidate applications across Google Play and Apple App Store for brand stem hijacking in application titles and bundle identifiers (e.g. com.novapay.rewards), publisher identity mismatches, and unauthorized financial utility claims."
    },
    {
      q: "How does Online Guardian integrate with Firebase Firestore and Authentication?",
      a: "The platform is architected around Firebase Authentication and Cloud Firestore, protected by hardened Attribute-Based Access Control (ABAC) Firestore Security Rules that isolate multi-tenant brand records and prevent unauthorized tampering."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar 
        onOpenAuth={onOpenAuth} 
        onExploreDemo={onExploreDemo}
        onOpenFirebaseModal={onOpenFirebaseModal}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6">
            <div className="space-y-8 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-300 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Enterprise Digital Risk Protection</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">External Threat Intelligence</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white text-balance leading-[1.12]">
                {t.heroTitle}
              </h1>

              <p className="text-base md:text-xl text-slate-300 max-w-3xl leading-relaxed text-balance">
                {t.heroSubtitle}
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-7 py-3.5 text-sm font-semibold text-slate-950 glass-button-primary rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                >
                  <span>{t.ctaStartProtecting}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onExploreDemo}
                  className="px-7 py-3.5 text-sm font-semibold text-slate-200 hover:text-white glass-button rounded-xl transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>{t.ctaExploreDemo}</span>
                </button>
              </div>

              {/* Proof Adjacency: Key Guarantees */}
              <div className="pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Multi-Platform Social Reconnaissance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Google Play & iOS App Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Zero False-Positive Whitelisting</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights: 3 Pillars */}
        <section id="features" className="py-20 border-t border-b border-white/10 relative">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3 layer-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Core Capabilities
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Comprehensive Digital Risk Defense
              </h2>
              <p className="text-sm text-slate-400">
                End-to-end identification and investigation for cross-platform brand impersonation attacks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 layer-2">
              {/* Feature 1 */}
              <div className="p-6 glass-card rounded-2xl space-y-4 option-fly stagger-1">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t.featureSocialTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.featureSocialDesc}
                </p>
                <div className="pt-2 text-xs font-mono text-cyan-400/90 flex items-center gap-1.5">
                  <span>Audits X · IG · FB · LinkedIn · TikTok</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-6 glass-card rounded-2xl space-y-4 option-fly stagger-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t.featureAppTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.featureAppDesc}
                </p>
                <div className="pt-2 text-xs font-mono text-cyan-400/90 flex items-center gap-1.5">
                  <span>Google Play & iOS Bundle Verification</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-6 glass-card rounded-2xl space-y-4 option-fly stagger-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t.featureLookalikeTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.featureLookalikeDesc}
                </p>
                <div className="pt-2 text-xs font-mono text-cyan-400/90 flex items-center gap-1.5">
                  <span>Damerau-Levenshtein & Homoglyphs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section: 3 Clear Steps */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Architecture & Workflow
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Three Steps from Asset Registration to Threat Mitigation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 layer-2">
              <div className="p-6.5 glass-card rounded-2xl space-y-3 option-fly stagger-1">
                <span className="text-2xl font-mono font-bold text-cyan-400">01</span>
                <h3 className="text-base font-bold text-white">{t.howItWorksStep1Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorksStep1Desc}</p>
              </div>

              <div className="p-6.5 glass-card rounded-2xl space-y-3 option-fly stagger-2">
                <span className="text-2xl font-mono font-bold text-cyan-400">02</span>
                <h3 className="text-base font-bold text-white">{t.howItWorksStep2Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorksStep2Desc}</p>
              </div>

              <div className="p-6.5 glass-card rounded-2xl space-y-3 option-fly stagger-3">
                <span className="text-2xl font-mono font-bold text-cyan-400">03</span>
                <h3 className="text-base font-bold text-white">{t.howItWorksStep3Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorksStep3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Firebase Architecture Section */}
        <section id="security" className="py-20 border-t border-b border-white/10 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5 layer-1">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {t.securitySectionTitle}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t.securitySectionDesc}
                </p>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Attribute-Based Access Control (ABAC) with Firestore security rules</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>Deterministic threat scoring with human-in-the-loop analyst decisions</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>No unverified automatic account suspensions or external disruptions</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={onOpenFirebaseModal}
                    className="px-4 py-2 text-xs font-semibold text-cyan-300 glass-button rounded-xl transition-all flex items-center gap-2"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Inspect Firebase & Firestore Blueprint</span>
                  </button>
                </div>
              </div>

              {/* Architecture Blueprint Card */}
              <div className="p-6.5 glass-panel rounded-2xl border border-cyan-500/30 space-y-4 layer-2 shadow-2xl">
                <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-semibold">
                  Production Database Entities
                </span>
                <div className="space-y-2 text-xs font-mono text-slate-400">
                  <div className="p-2.5 glass-panel-subtle rounded-xl border border-white/5 flex justify-between option-fly stagger-1">
                    <span className="text-cyan-300 font-semibold">/organizations/{'{orgId}'}</span>
                    <span className="text-slate-400">ABAC Tenant Barrier</span>
                  </div>
                  <div className="p-2.5 glass-panel-subtle rounded-xl border border-white/5 flex justify-between option-fly stagger-2">
                    <span className="text-cyan-300 font-semibold">/brands/{'{brandId}'}</span>
                    <span className="text-slate-400">Official Asset Registry</span>
                  </div>
                  <div className="p-2.5 glass-panel-subtle rounded-xl border border-white/5 flex justify-between option-fly stagger-3">
                    <span className="text-cyan-300 font-semibold">/socialFindings/{'{id}'}</span>
                    <span className="text-slate-400">Impersonation Pipeline</span>
                  </div>
                  <div className="p-2.5 glass-panel-subtle rounded-xl border border-white/5 flex justify-between option-fly stagger-4">
                    <span className="text-cyan-300 font-semibold">/appFindings/{'{id}'}</span>
                    <span className="text-slate-400">Mobile Threat Registry</span>
                  </div>
                  <div className="p-2.5 glass-panel-subtle rounded-xl border border-white/5 flex justify-between option-fly stagger-5">
                    <span className="text-cyan-300 font-semibold">/auditLogs/{'{logId}'}</span>
                    <span className="text-slate-400">Immutable Audit Trail</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 space-y-8 layer-1">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase text-cyan-400 font-semibold">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl font-bold text-white">
                Platform Technical Details
              </h2>
            </div>

            <div className="space-y-3 layer-2">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="glass-card rounded-2xl overflow-hidden option-fly"
                  style={{ animationDelay: `${(idx + 1) * 60}ms` }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4.5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {openFaq === idx && (
                    <div className="px-4.5 pb-4.5 text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a14] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SentinelLogo size="sm" />
            <span className="text-slate-500">·</span>
            <span>{t.tagline}</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenFirebaseModal} className="hover:text-cyan-400 transition-colors">
              Firebase Security Spec
            </button>
            <button onClick={onExploreDemo} className="hover:text-cyan-400 transition-colors">
              Judge Quick Access
            </button>
          </div>

          <div className="text-slate-500 text-[11px]">
            © 2026 Online Guardian. {t.allRightsReserved}
          </div>
        </div>
      </footer>
    </div>
  );
};
