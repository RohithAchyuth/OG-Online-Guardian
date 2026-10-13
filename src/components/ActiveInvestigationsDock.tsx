import React from 'react';
import { useInvestigation } from '../context/InvestigationContext';
import { ShieldAlert, Maximize2, X, Users } from 'lucide-react';

export const ActiveInvestigationsDock: React.FC = () => {
  const { activeCases, isModalOpen, openModal, stopAllInvestigations, stopInvestigation } = useInvestigation();

  // Only display when there are active investigations and modal is closed
  if (!activeCases.length || isModalOpen) return null;

  return (
    <aside 
      aria-label="Active Multi-Profile Investigations Queue"
      className="fixed bottom-4 right-4 sm:right-6 z-40 max-w-lg w-[calc(100vw-2rem)] glass-panel border border-cyan-500/40 rounded-2xl shadow-2xl p-3.5 text-slate-100 transition-all layer-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/90 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm shadow-cyan-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold tracking-wider">
                Multi-Profile Investigation
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700/80 text-cyan-200 font-semibold">
                {activeCases.length} {activeCases.length === 1 ? 'Profile' : 'Profiles'} Active
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate font-medium mt-0.5">
              {activeCases.map((c) => c.title).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openModal()}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-500/30"
            title="Open investigation dossiers"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open ({activeCases.length})</span>
          </button>
          <button
            onClick={stopAllInvestigations}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Close all active investigations"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini quick list pills if multiple */}
      {activeCases.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5 scrollbar-thin">
          {activeCases.slice(0, 5).map((c) => (
            <div
              key={c.caseId}
              onClick={() => openModal(c.caseId)}
              className="cursor-pointer group flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 shrink-0 transition-colors"
            >
              <span className="truncate max-w-[100px]">{c.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stopInvestigation(c.caseId);
                }}
                className="text-slate-500 hover:text-red-400 ml-0.5"
                title="Dismiss from queue"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {activeCases.length > 5 && (
            <span className="text-[10px] font-mono text-cyan-400 shrink-0 pl-1">
              +{activeCases.length - 5} more
            </span>
          )}
        </div>
      )}
    </aside>
  );
};
