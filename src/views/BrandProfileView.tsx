import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { 
  Building2, 
  Share2, 
  Smartphone, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Globe, 
  Tag,
  AlertCircle
} from 'lucide-react';
import { SocialPlatform, AppPlatform } from '../types';
import { novaPayLogoImg } from '../assets/images';

export const BrandProfileView: React.FC = () => {
  const { t } = useLanguage();
  const { 
    brand, 
    updateBrandProfile, 
    addOfficialSocial, 
    removeOfficialSocial, 
    addOfficialApp, 
    removeOfficialApp 
  } = useBrand();

  const [brandName, setBrandName] = useState(brand.brandName);
  const [websiteUrl, setWebsiteUrl] = useState(brand.websiteUrl);
  const [industry, setIndustry] = useState(brand.industry);
  const [country, setCountry] = useState(brand.country);
  const [description, setDescription] = useState(brand.description);
  const [aliases, setAliases] = useState(brand.approvedAliases.join(', '));
  const [keywords, setKeywords] = useState(brand.approvedKeywords.join(', '));
  const [savedMsg, setSavedMsg] = useState(false);

  // Social Add Modal State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [newSocPlatform, setNewSocPlatform] = useState<SocialPlatform>('X');
  const [newSocUsername, setNewSocUsername] = useState('');
  const [newSocUrl, setNewSocUrl] = useState('');
  const [newSocNotes, setNewSocNotes] = useState('');
  const [socialError, setSocialError] = useState('');

  // App Add Modal State
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [newAppPlatform, setNewAppPlatform] = useState<AppPlatform>('ANDROID');
  const [newAppName, setNewAppName] = useState('');
  const [newAppPublisher, setNewAppPublisher] = useState('');
  const [newAppPackageId, setNewAppPackageId] = useState('');
  const [newAppStoreUrl, setNewAppStoreUrl] = useState('');
  const [appError, setAppError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandProfile({
      brandName,
      websiteUrl,
      industry,
      country,
      description,
      approvedAliases: aliases.split(',').map(s => s.trim()).filter(Boolean),
      approvedKeywords: keywords.split(',').map(s => s.trim()).filter(Boolean),
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleAddSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSocialError('');
    const cleanUser = newSocUsername.trim().replace(/^@/, '');
    if (!cleanUser) {
      setSocialError('Username handle is required');
      return;
    }
    // Duplicate check
    if (brand.officialSocials.some(s => s.username.toLowerCase() === cleanUser.toLowerCase() && s.platform === newSocPlatform)) {
      setSocialError('This social account is already registered in the official whitelist.');
      return;
    }

    addOfficialSocial({
      platform: newSocPlatform,
      username: cleanUser,
      profileUrl: newSocUrl.trim() || `https://${newSocPlatform.toLowerCase()}.com/${cleanUser}`,
      verifiedBadge: true,
      notes: newSocNotes.trim() || 'Verified organizational account',
    });

    setIsSocialModalOpen(false);
    setNewSocUsername('');
    setNewSocUrl('');
    setNewSocNotes('');
  };

  const handleAddAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppError('');
    if (!newAppName.trim() || !newAppPackageId.trim()) {
      setAppError('App Name and Package Identifier are required');
      return;
    }
    // Duplicate check
    if (brand.officialApps.some(a => a.packageOrBundleId.toLowerCase() === newAppPackageId.trim().toLowerCase())) {
      setAppError('This package/bundle ID is already whitelisted.');
      return;
    }

    addOfficialApp({
      platform: newAppPlatform,
      appName: newAppName.trim(),
      publisherName: newAppPublisher.trim() || brand.brandName + ' Technologies',
      packageOrBundleId: newAppPackageId.trim(),
      storeUrl: newAppStoreUrl.trim() || `https://store.example.com/${newAppPackageId.trim()}`,
      verified: true,
    });

    setIsAppModalOpen(false);
    setNewAppName('');
    setNewAppPublisher('');
    setNewAppPackageId('');
    setNewAppStoreUrl('');
  };

  return (
    <div className="space-y-6 layer-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>Brand Profile & Official Whitelist</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register your legitimate brand assets. Registered channels are strictly protected and excluded from threat pipelines.
          </p>
        </div>

        {savedMsg && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 glass-panel-subtle border border-emerald-500/40 text-emerald-300 text-xs rounded-xl shadow-lg">
            <Check className="w-4 h-4" />
            <span>Profile successfully synced</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 layer-2">
        {/* Brand Details Form */}
        <div className="lg:col-span-1 p-5.5 glass-card rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center overflow-hidden shadow-sm shadow-cyan-500/20">
              <img
                src={brand.logoUrl || novaPayLogoImg}
                alt={brand.brandName}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{brand.brandName}</h2>
              <span className="text-[11px] font-mono text-cyan-300">{brand.websiteUrl}</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Official Website URL</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Country / Region</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Approved Brand Aliases (comma separated)</label>
              <input
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="Nova Pay, NovaPay Inc"
                className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Approved Brand Keywords (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="wallet, payments, remittance"
                className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b1424] border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              Update Brand Registry
            </button>
          </form>
        </div>

        {/* Official Assets Management (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Official Social Handles */}
          <div className="p-5.5 glass-card rounded-2xl space-y-4 shadow-xl option-fly stagger-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Official Social Accounts ({brand.officialSocials.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified social assets automatically excluded from threat detections
                </p>
              </div>

              <button
                onClick={() => setIsSocialModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 glass-button-primary rounded-xl transition-all shadow-md shadow-cyan-500/25"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Social Account</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Official Username</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {brand.officialSocials.map((social) => (
                    <tr key={social.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-cyan-300">
                        {social.platform}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        @{social.username}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Whitelisted</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                        {social.notes || 'Official handle'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => removeOfficialSocial(social.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove from whitelist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Official Mobile Applications */}
          <div className="p-5.5 glass-card rounded-2xl space-y-4 shadow-xl option-fly stagger-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Official Mobile Applications ({brand.officialApps.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorized bundle identifiers and publisher credentials
                </p>
              </div>

              <button
                onClick={() => setIsAppModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 glass-button-primary rounded-xl transition-all shadow-md shadow-cyan-500/25"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Official App</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Application Title</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Package / Bundle ID</th>
                    <th className="py-2.5 px-3">Publisher</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {brand.officialApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {app.appName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">
                        {app.platform}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                        {app.packageOrBundleId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {app.publisherName}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => removeOfficialApp(app.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove from whitelist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Official Social Account */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c1424] border border-cyan-900/60 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Register Official Social Handle</h3>
            {socialError && (
              <div className="p-2.5 bg-red-950/40 border border-red-800 rounded text-xs text-red-300">
                {socialError}
              </div>
            )}
            <form onSubmit={handleAddSocialSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Platform</label>
                <select
                  value={newSocPlatform}
                  onChange={(e) => setNewSocPlatform(e.target.value as SocialPlatform)}
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                >
                  <option value="X">X (formerly Twitter)</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="TIKTOK">TikTok</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Username / Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={newSocUsername}
                    onChange={(e) => setNewSocUsername(e.target.value)}
                    placeholder="NovaPay"
                    className="w-full pl-8 pr-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Profile URL (optional)</label>
                <input
                  type="text"
                  value={newSocUrl}
                  onChange={(e) => setNewSocUrl(e.target.value)}
                  placeholder="https://x.com/NovaPay"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Verification Notes</label>
                <input
                  type="text"
                  value={newSocNotes}
                  onChange={(e) => setNewSocNotes(e.target.value)}
                  placeholder="Verified handle registered with PR team"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Official Mobile App */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c1424] border border-cyan-900/60 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Register Official Mobile App</h3>
            {appError && (
              <div className="p-2.5 bg-red-950/40 border border-red-800 rounded text-xs text-red-300">
                {appError}
              </div>
            )}
            <form onSubmit={handleAddAppSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Platform</label>
                  <select
                    value={newAppPlatform}
                    onChange={(e) => setNewAppPlatform(e.target.value as AppPlatform)}
                    className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                  >
                    <option value="ANDROID">Android (Google Play)</option>
                    <option value="IOS">iOS (Apple App Store)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">App Name</label>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="NovaPay"
                    className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Package / Bundle ID</label>
                <input
                  type="text"
                  required
                  value={newAppPackageId}
                  onChange={(e) => setNewAppPackageId(e.target.value)}
                  placeholder="com.example.novapay.demo"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Official Publisher Name</label>
                <input
                  type="text"
                  value={newAppPublisher}
                  onChange={(e) => setNewAppPublisher(e.target.value)}
                  placeholder="NovaPay Technologies"
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Store URL</label>
                <input
                  type="text"
                  value={newAppStoreUrl}
                  onChange={(e) => setNewAppStoreUrl(e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  className="w-full px-3 py-2 bg-[#09101e] border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg"
                >
                  Save App Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
