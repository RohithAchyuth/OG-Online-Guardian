import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  Sliders, 
  Database, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Globe,
  Lock,
  Layers,
  Camera,
  User,
  Building2
} from 'lucide-react';
import { AvatarSelectionModal } from '../components/AvatarSelectionModal';
import { avatarImg } from '../assets/images';

interface SettingsViewProps {
  onOpenFirebaseModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenFirebaseModal }) => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const { 
    sensitivityThreshold, 
    setSensitivityThreshold, 
    resetToDemoDefaults, 
    brand 
  } = useBrand();
  const { user } = useAuth();

  const [thresholdVal, setThresholdVal] = useState<number>(sensitivityThreshold);
  const [successMsg, setSuccessMsg] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleSaveThreshold = () => {
    setSensitivityThreshold(thresholdVal);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  const handleReset = () => {
    resetToDemoDefaults();
    setResetConfirm(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl layer-1">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>{t.settingsTitle}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust account profile photos, detection scoring weights, language preferences, and database configurations.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 glass-panel-subtle border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4" />
          <span>{t.settingsSuccessMessage}</span>
        </div>
      )}


      {/* User Profile & Avatar Customization Card */}
      <div className="p-5.5 glass-card rounded-2xl space-y-4 option-fly stagger-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20 bg-slate-950">
                <img
                  src={user?.avatarUrl || avatarImg}
                  alt={user?.fullName || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-cyan-300 text-[10px] font-mono cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Change</span>
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {user?.fullName || 'Cybersecurity Analyst'}
                </h3>
                {user?.accountType === 'company' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>Company Admin</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Personal User</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.email} · {user?.organizationName || 'Personal Digital Protection'}
              </p>
              <p className="text-[11px] text-cyan-400/90 font-mono mt-1">
                Customize your analyst avatar photo across the platform
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 glass-button-primary rounded-xl transition-all shadow-md shadow-cyan-500/30 shrink-0 self-start sm:self-center"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Profile Photo</span>
          </button>
        </div>
      </div>

      {/* Detection Engine Threshold Slider */}
      <div className="p-5.5 glass-card rounded-2xl space-y-4 option-fly stagger-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>{t.settingsThresholdTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.settingsThresholdDesc}
            </p>
          </div>
          <span className="text-base font-bold font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-xl shadow-sm">
            {thresholdVal}% Minimum
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="35"
            max="80"
            value={thresholdVal}
            onChange={(e) => setThresholdVal(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>35% (Aggressive Detection)</span>
            <span>50% (Standard Enterprise Baseline)</span>
            <span>80% (High Precision Only)</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveThreshold}
            className="px-4 py-2 text-xs font-semibold text-slate-950 glass-button-primary rounded-xl transition-all shadow-md shadow-cyan-500/30"
          >
            {t.settingsSaveBtn}
          </button>
        </div>
      </div>

      {/* Interface Language Preference */}
      <div className="p-5.5 glass-card rounded-2xl space-y-4 option-fly stagger-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Multilingual Interface Localization</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly toggle the platform interface across English, Telugu, Hindi, or Spanish.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          {availableLanguages.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-3.5 rounded-xl border text-left transition-all option-fly stagger-${idx + 1} ${
                language === lang.code
                  ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold shadow-md shadow-cyan-500/20'
                  : 'glass-panel-subtle border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span className="block font-medium">{lang.nativeName}</span>
              <span className="font-mono text-[10px] text-cyan-400/90 uppercase">{lang.label} ({lang.code})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Backend & Firebase Architecture Integration */}
      <div className="p-5.5 glass-card rounded-2xl space-y-4 option-fly stagger-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Firebase Cloud Architecture & Security Rules</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect database status, deployed firestore.rules, and environment variables.
            </p>
          </div>
          <button
            onClick={onOpenFirebaseModal}
            className="px-3.5 py-1.5 text-xs text-cyan-300 glass-button rounded-xl transition-all font-medium"
          >
            Inspect Blueprint & Rules
          </button>
        </div>
      </div>

      {/* Hackathon Judge Demo Data Reset */}
      <div className="p-5.5 glass-card rounded-2xl border border-rose-500/30 space-y-3 option-fly stagger-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Demo State to Original Seed</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Restores the default fictional enterprise dataset (NovaPay) and clears all custom added candidates and state alterations.
            </p>
          </div>
          <button
            onClick={() => setResetConfirm(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900 rounded-xl transition-all shadow-sm shadow-rose-950/40"
          >
            Reset Demo Data
          </button>
        </div>

        {resetConfirm && (
          <div className="p-3.5 glass-panel-subtle border border-rose-500/50 rounded-xl flex items-center justify-between text-xs text-rose-200">
            <span>Are you sure you want to restore original NovaPay seed data?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1 glass-button text-white rounded-lg text-[11px]"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-[11px] shadow-sm shadow-red-500/30"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
