import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PRESET_AVATARS, avatarImg } from '../assets/images';
import { 
  Camera, 
  Upload, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Image as ImageIcon,
  Building2
} from 'lucide-react';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose }) => {
  const { user, updateAvatar } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<string>(user?.avatarUrl || avatarImg);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedUrl(user?.avatarUrl || avatarImg);
      setCustomUrlInput('');
      setUploadError('');
      setSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSelectPreset = (url: string) => {
    setSelectedUrl(url);
    setUploadError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image size exceeds 4MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedUrl(reader.result);
        setUploadError('');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    try {
      new URL(customUrlInput.trim());
      setSelectedUrl(customUrlInput.trim());
      setCustomUrlInput('');
      setUploadError('');
    } catch {
      setUploadError('Please enter a valid HTTP or HTTPS image URL.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAvatar(selectedUrl);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } finally {
      setSaving(false);
    }
  };

  const isCompany = user.accountType === 'company';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-modal rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/30 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="avatar-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Change Profile Photo</span>
                {isCompany ? (
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
              </h2>
              <p className="text-xs text-slate-400">
                Choose from cybersecurity operator presets, upload a file, or provide an image link.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300">
          {/* Current / Selected Preview Hero */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20 bg-slate-950">
                <img
                  src={selectedUrl}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-cyan-300 text-[10px] font-mono"
                title="Upload Photo"
              >
                <Upload className="w-4 h-4 mb-0.5" />
                <span>Upload</span>
              </button>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-sm truncate">{user.fullName}</p>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-1.5 py-0.2 rounded">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <p className="text-[11px] text-cyan-300/80 font-mono">
                {user.organizationName || 'Personal Workspace'}
              </p>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-red-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Section 1: Choose from Cybersecurity Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Security Specialist Presets</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {PRESET_AVATARS.length} Available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/60'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-cyan-500/30 backdrop-blur-xs flex items-center justify-center">
                          <Check className="w-5 h-5 text-cyan-300 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <span className="block text-xs font-semibold text-white truncate">
                        {preset.role}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate">
                        {preset.name.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Upload Custom Photo or Provide URL */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Custom Photo or Image URL</span>
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 glass-button rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload From Device</span>
              </button>

              <span className="text-xs text-slate-500 font-mono">or paste web URL:</span>
            </div>

            <form onSubmit={handleApplyCustomUrl} className="flex items-center gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-9 pr-3 py-1.5 glass-input rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!customUrlInput.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-cyan-300 rounded-xl transition-colors shrink-0"
              >
                Apply
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {success && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" />
                <span>Profile Photo Updated!</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 glass-button-primary disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/25 flex items-center gap-2"
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
