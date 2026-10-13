import React, { useState } from 'react';
import { SentinelLogo } from './SentinelLogo';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onExploreDemo: () => void;
  onOpenFirebaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  onExploreDemo,
  onOpenFirebaseModal 
}) => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <a href="#hero" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <SentinelLogo size="md" />
        </a>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {t.navFeatures}
          </a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {t.navHowItWorks}
          </a>
          <a href="#security" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
            {t.navSecurity}
          </a>
          <button 
            onClick={onOpenFirebaseModal}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-slate-400"
          >
            Firebase Architecture
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Language Selector */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              aria-label="Select language"
              aria-expanded={langDropdownOpen}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="uppercase font-mono">{language}</span>
            </button>

            {langDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-38 p-1.5 glass-dropdown layer-2 rounded-2xl shadow-2xl z-50 space-y-1"
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                {availableLanguages.map((item, idx) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-xl transition-all flex items-center justify-between option-fly stagger-${idx + 1} ${
                      language === item.code ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/30 font-semibold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.nativeName}</span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">{item.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign In link */}
          <button
            onClick={() => onOpenAuth('signin')}
            className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navSignIn}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onExploreDemo}
            className="px-4.5 py-2 text-xs font-bold text-slate-950 glass-button-primary rounded-xl transition-all shadow-md shadow-cyan-500/30 whitespace-nowrap shrink-0"
          >
            {t.ctaExploreDemo}
          </button>
        </div>
      </div>
    </header>
  );
};
