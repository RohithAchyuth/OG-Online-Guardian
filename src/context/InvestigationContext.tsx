import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SocialFinding, AppFinding } from '../types';

export interface ActiveCaseInvestigation {
  caseId: string;
  title: string;
  category: 'SOCIAL' | 'APP' | 'PERSONAL';
  platform?: string;
  riskScore?: number;
  severity?: string;
  startedAt: number;
  status: 'running' | 'completed' | 'paused';
  finding: SocialFinding | AppFinding | any;
}

interface InvestigationContextType {
  activeCases: ActiveCaseInvestigation[];
  activeCaseId: string | null;
  activeCase: ActiveCaseInvestigation | null;
  activeCount: number;
  isModalOpen: boolean;
  openModal: (caseId?: string) => void;
  closeModal: () => void;
  startInvestigation: (finding: SocialFinding | AppFinding | any, title?: string, openModalImmediately?: boolean) => void;
  startMultipleInvestigations: (findings: (SocialFinding | AppFinding | any)[], openModalImmediately?: boolean) => void;
  stopInvestigation: (caseId?: string) => void;
  stopAllInvestigations: () => void;
  setActiveCaseId: (caseId: string) => void;
  getCaseProgress: (caseId: string) => number | null;
  isCaseActive: (caseId: string) => boolean;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export const InvestigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store multiple active investigations
  const [activeCases, setActiveCases] = useState<ActiveCaseInvestigation[]>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_active_cases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      // Backward compatibility check for single case
      const legacy = sessionStorage.getItem('sentinel_active_investigation');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed && parsed.caseId) return [parsed];
      }
    } catch {
      // Ignore sessionStorage error
    }
    return [];
  });

  const [activeCaseId, setActiveCaseId] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_active_case_id');
      if (saved) return saved;
    } catch {
      // Ignore
    }
    return null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync active investigations to sessionStorage
  useEffect(() => {
    try {
      if (activeCases.length > 0) {
        sessionStorage.setItem('sentinel_active_cases', JSON.stringify(activeCases));
      } else {
        sessionStorage.removeItem('sentinel_active_cases');
      }
      if (activeCaseId) {
        sessionStorage.setItem('sentinel_active_case_id', activeCaseId);
      } else {
        sessionStorage.removeItem('sentinel_active_case_id');
      }
    } catch {
      // Ignore
    }
  }, [activeCases, activeCaseId]);

  // Derive current focused activeCase
  const activeCase = useMemo(() => {
    if (!activeCases.length) return null;
    if (activeCaseId) {
      const found = activeCases.find((c) => c.caseId === activeCaseId);
      if (found) return found;
    }
    return activeCases[0] || null;
  }, [activeCases, activeCaseId]);

  // Helper to construct case object from finding
  const buildCaseObject = useCallback((finding: SocialFinding | AppFinding | any, customTitle?: string): ActiveCaseInvestigation => {
    const caseId = String(finding.id || `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    const isSocial = 'accountName' in finding || ('platform' in finding && typeof finding.accountName === 'string');
    const isApp = 'appName' in finding || 'packageOrBundleId' in finding;
    
    const title = customTitle || (isSocial ? finding.accountName : isApp ? finding.appName : finding.title || `Target ${caseId}`);
    const category = isSocial ? 'SOCIAL' : isApp ? 'APP' : 'PERSONAL';

    return {
      caseId,
      title,
      category,
      platform: finding.platform,
      riskScore: finding.riskScore || 85,
      severity: finding.severity || 'HIGH',
      startedAt: Date.now(),
      status: 'running',
      finding,
    };
  }, []);

  // Start single investigation (supports any number of profiles concurrently)
  const startInvestigation = useCallback((finding: SocialFinding | AppFinding | any, customTitle?: string, openModalImmediately: boolean = true) => {
    const newCase = buildCaseObject(finding, customTitle);

    setActiveCases((prev) => {
      const existingIndex = prev.findIndex((c) => c.caseId === newCase.caseId);
      if (existingIndex >= 0) {
        // Already investigating, update finding reference if newer
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], finding: newCase.finding };
        return updated;
      }
      // Add to active investigations queue
      return [...prev, newCase];
    });

    setActiveCaseId(newCase.caseId);
    if (openModalImmediately) {
      setIsModalOpen(true);
    }
  }, [buildCaseObject]);

  // Bulk start: investigate any number of profiles at once
  const startMultipleInvestigations = useCallback((findings: (SocialFinding | AppFinding | any)[], openModalImmediately: boolean = true) => {
    if (!findings.length) return;

    const newCases = findings.map((f) => buildCaseObject(f));

    setActiveCases((prev) => {
      const existingIds = new Set(prev.map((c) => c.caseId));
      const additions = newCases.filter((c) => !existingIds.has(c.caseId));
      return [...prev, ...additions];
    });

    if (newCases.length > 0) {
      setActiveCaseId(newCases[0].caseId);
    }

    if (openModalImmediately) {
      setIsModalOpen(true);
    }
  }, [buildCaseObject]);

  // Stop investigation for a specific case or clear all
  const stopInvestigation = useCallback((caseId?: string) => {
    if (!caseId) {
      // Clear all active investigations
      setActiveCases([]);
      setActiveCaseId(null);
      setIsModalOpen(false);
      return;
    }

    setActiveCases((prev) => {
      const filtered = prev.filter((c) => c.caseId !== caseId);
      if (filtered.length === 0) {
        setIsModalOpen(false);
        setActiveCaseId(null);
      } else if (activeCaseId === caseId) {
        setActiveCaseId(filtered[0].caseId);
      }
      return filtered;
    });
  }, [activeCaseId]);

  const stopAllInvestigations = useCallback(() => {
    setActiveCases([]);
    setActiveCaseId(null);
    setIsModalOpen(false);
  }, []);

  const isCaseActive = useCallback((caseId: string): boolean => {
    return activeCases.some((c) => c.caseId === String(caseId));
  }, [activeCases]);

  const getCaseProgress = useCallback((_caseId: string): number | null => {
    return null;
  }, []);

  const openModal = useCallback((caseId?: string) => {
    if (caseId) {
      setActiveCaseId(caseId);
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const contextValue = useMemo(() => ({
    activeCases,
    activeCaseId,
    activeCase,
    activeCount: activeCases.length,
    isModalOpen,
    openModal,
    closeModal,
    startInvestigation,
    startMultipleInvestigations,
    stopInvestigation,
    stopAllInvestigations,
    setActiveCaseId,
    getCaseProgress,
    isCaseActive,
  }), [
    activeCases,
    activeCaseId,
    activeCase,
    isModalOpen,
    openModal,
    closeModal,
    startInvestigation,
    startMultipleInvestigations,
    stopInvestigation,
    stopAllInvestigations,
    getCaseProgress,
    isCaseActive,
  ]);

  return (
    <InvestigationContext.Provider value={contextValue}>
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = () => {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
};
