import React from 'react';
import { onlineGuardianLogoImg } from '../assets/images';

interface SentinelLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const SentinelLogo: React.FC<SentinelLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-sm font-semibold', spacing: 'gap-2' },
    md: { icon: 'w-9 h-9', text: 'text-lg font-bold', spacing: 'gap-2.5' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl font-bold', spacing: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl font-bold', spacing: 'gap-3.5' },
  };

  const { icon, text, spacing } = sizeMap[size];

  return (
    <div className={`flex items-center ${spacing} select-none ${className}`}>
      {/* Official Dragon Katana Photo Logo Emblem with Circular Flame Ring */}
      <div 
        className={`relative ${icon} flex items-center justify-center shrink-0 rounded-full p-[1.5px] bg-gradient-to-tr from-red-600 via-rose-500 to-cyan-500 shadow-[0_0_16px_rgba(220,38,38,0.55)] transition-transform duration-300 hover:scale-105`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
          <img
            src={onlineGuardianLogoImg}
            alt="Online Guardian Logo"
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {showText && (
        <span className={`tracking-tight font-black text-[#dc2626] ${text} whitespace-nowrap drop-shadow-[0_0_14px_rgba(220,38,38,0.65)]`}>
          Online Guardian
        </span>
      )}
    </div>
  );
};
