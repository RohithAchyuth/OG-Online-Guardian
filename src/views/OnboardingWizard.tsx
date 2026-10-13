import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand, BrandProvider } from '../context/BrandContext';
import { SentinelLogo } from '../components/SentinelLogo';
import { 
  Building2, 
  Share2, 
  Smartphone, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { SocialPlatform, AppPlatform } from '../types';

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingWizardInner: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const { t } = useLanguage();
  const { brand, updateBrandProfile, addOfficialSocial, addOfficialApp } = useBrand();

  const [step, setStep] = useState(1);

  // Step 1: Brand Details
  const [bName, setBName] = useState(brand.brandName);
  const [bUrl, setBUrl] = useState(brand.websiteUrl);
  const [bIndustry, setBIndustry] = useState(brand.industry);
  const [bCountry, setBCountry] = useState(brand.country);
  const [bDesc, setBDesc] = useState(brand.description);

  // Step 2: Official Social
  const [socPlatform, setSocPlatform] = useState<SocialPlatform>('X');
  const [socUsername, setSocUsername] = useState('NovaPay');
  const [socUrl, setSocUrl] = useState('https://x.com/NovaPay');

  // Step 3: Official Mobile App
  const [appPlatform, setAppPlatform] = useState<AppPlatform>('ANDROID');
  const [appName, setAppName] = useState('NovaPay');
  const [appPkg, setAppPkg] = useState('com.example.novapay.demo');
  const [appPublisher, setAppPublisher] = useState('NovaPay Technologies');

  // Step 4: Brand Identity & Aliases
  const [aliases, setAliases] = useState(brand.approvedAliases.join(', '));
  const [keywords, setKeywords] = useState(brand.approvedKeywords.join(', '));

  const handleFinish = () => {
    updateBrandProfile({
      brandName: bName,
      websiteUrl: bUrl,
      industry: bIndustry,
      country: bCountry,
      description: bDesc,
      approvedAliases: aliases.split(',').map(s => s.trim()).filter(Boolean),
      approvedKeywords: keywords.split(',').map(s => s.trim()).filter(Boolean),
    });
    onComplete();
  };

  const steps = [
    { num: 1, title: 'Brand Details' },
    { num: 2, title: 'Official Socials' },
    { num: 3, title: 'Official Apps' },
    { num: 4, title: 'Identity & Keywords' },
    { num: 5, title: 'Review & Activate' },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-2xl bg-[#091122] border border-cyan-900/50 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <SentinelLogo size="md" />
          <button
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Skip to Dashboard
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>STEP {step} OF 5</span>
            <span className="text-cyan-400">{steps[step - 1].title}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Brand Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Step 1: Primary Brand Identity</h2>
              <p className="text-xs text-slate-400">
                Specify your organization name and primary domain to anchor string similarity calculations.
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Brand or Company Name</label>
                <input
                  type="text"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white font-medium"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Official Website URL</label>
                <input
                  type="text"
                  value={bUrl}
                  onChange={(e) => setBUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Industry</label>
                  <input
                    type="text"
                    value={bIndustry}
                    onChange={(e) => setBIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Country / Region</label>
                  <input
                    type="text"
                    value={bCountry}
                    onChange={(e) => setBCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Official Social Accounts */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Step 2: Official Social Handles</h2>
              <p className="text-xs text-slate-400">
                Provide legitimate social accounts. These will be strictly excluded from threat detections.
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Primary Platform</label>
                  <select
                    value={socPlatform}
                    onChange={(e) => setSocPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                  >
                    <option value="X">X (Twitter)</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="TIKTOK">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Official Username Handle</label>
                  <input
                    type="text"
                    value={socUsername}
                    onChange={(e) => setSocUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Official Profile URL</label>
                <input
                  type="text"
                  value={socUrl}
                  onChange={(e) => setSocUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg flex items-center gap-2 text-cyan-300">
                <Info className="w-4 h-4 shrink-0" />
                <span>Default NovaPay verified social channels are already pre-loaded into your account.</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Official Mobile Applications */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Step 3: Official Mobile Applications</h2>
              <p className="text-xs text-slate-400">
                Register authorized app store package identifiers to prevent unauthorized clones.
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Platform</label>
                  <select
                    value={appPlatform}
                    onChange={(e) => setAppPlatform(e.target.value as AppPlatform)}
                    className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                  >
                    <option value="ANDROID">Google Play (Android)</option>
                    <option value="IOS">Apple App Store (iOS)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">App Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Package ID / Bundle Identifier</label>
                <input
                  type="text"
                  value={appPkg}
                  onChange={(e) => setAppPkg(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Official Publisher / Developer</label>
                <input
                  type="text"
                  value={appPublisher}
                  onChange={(e) => setAppPublisher(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Brand Identity & Keywords */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Step 4: Approved Aliases & Keywords</h2>
              <p className="text-xs text-slate-400">
                Configure known legitimate variations of your brand name to calibrate algorithm sensitivity.
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Approved Aliases (comma separated)</label>
                <input
                  type="text"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Common Industry Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Activate */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Step 5: Review & Launch Threat Monitoring</h2>
              <p className="text-xs text-slate-400">
                Verify registered parameters. Your monitoring dashboard is ready with pre-configured reconnaissance.
              </p>
            </div>
            <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Brand Name:</span>
                <span className="text-white font-bold">{bName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Official Domain:</span>
                <span className="text-cyan-400 font-mono">{bUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Whitelisted Handles:</span>
                <span className="text-slate-200">@{socUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Whitelisted Mobile Package:</span>
                <span className="text-emerald-400 font-mono">{appPkg}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-md shadow-cyan-500/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-lg shadow-cyan-500/25"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Activate Security Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = (props) => {
  return (
    <BrandProvider>
      <OnboardingWizardInner {...props} />
    </BrandProvider>
  );
};
