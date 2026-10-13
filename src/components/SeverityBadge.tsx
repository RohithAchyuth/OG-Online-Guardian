import React from 'react';
import { Severity, InvestigationStatus } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export const SeverityBadge: React.FC<{ severity: Severity; size?: 'sm' | 'md' }> = ({ severity, size }) => {
  const { t } = useLanguage();

  const config: Record<Severity, { label: string; textClass: string; dotClass: string }> = {
    CRITICAL: {
      label: t.severityCritical,
      textClass: 'text-red-400 font-medium',
      dotClass: 'bg-red-500',
    },
    HIGH: {
      label: t.severityHigh,
      textClass: 'text-amber-400 font-medium',
      dotClass: 'bg-amber-500',
    },
    MEDIUM: {
      label: t.severityMedium,
      textClass: 'text-yellow-300 font-normal',
      dotClass: 'bg-yellow-400',
    },
    LOW: {
      label: t.severityLow,
      textClass: 'text-cyan-300 font-normal',
      dotClass: 'bg-cyan-400',
    },
    INFORMATIONAL: {
      label: t.severityInformational,
      textClass: 'text-slate-400 font-normal',
      dotClass: 'bg-slate-400',
    },
  };

  const item = config[severity] || config.INFORMATIONAL;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${item.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dotClass}`} aria-hidden="true" />
      <span>{item.label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: InvestigationStatus }> = ({ status }) => {
  const { t } = useLanguage();

  const config: Record<InvestigationStatus, { label: string; textClass: string }> = {
    NEW: { label: t.statusNew, textClass: 'text-cyan-400 font-medium' },
    UNDER_REVIEW: { label: t.statusUnderReview, textClass: 'text-amber-300 font-medium' },
    CONFIRMED_SUSPICIOUS: { label: t.statusConfirmedSuspicious, textClass: 'text-rose-400 font-semibold' },
    FALSE_POSITIVE: { label: t.statusFalsePositive, textClass: 'text-slate-400' },
    RESOLVED: { label: t.statusResolved, textClass: 'text-emerald-400 font-medium' },
  };

  const item = config[status] || { label: status, textClass: 'text-slate-300' };

  return (
    <span className={`text-xs whitespace-nowrap ${item.textClass}`}>
      {item.label}
    </span>
  );
};
