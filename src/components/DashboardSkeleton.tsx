import React from 'react';

export const DashboardTabSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-16 bg-slate-900/60 border border-slate-800/80 rounded-xl" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#091122]/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="h-3 w-24 bg-slate-800 rounded" />
            <div className="h-8 w-16 bg-slate-700/60 rounded" />
            <div className="h-2 w-32 bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-[#091122]/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="h-4 w-48 bg-slate-800 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-900/80 border border-slate-800/50 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="h-80 bg-[#091122]/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="h-4 w-36 bg-slate-800 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-900/80 border border-slate-800/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuthViewSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-[#091122] border border-slate-800 rounded-2xl p-8 space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-cyan-900/40 rounded mx-auto" />
        <div className="h-4 w-52 bg-slate-800 rounded mx-auto" />
        <div className="space-y-4 pt-4">
          <div className="h-10 bg-slate-900 rounded-lg" />
          <div className="h-10 bg-slate-900 rounded-lg" />
          <div className="h-10 bg-cyan-500/30 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const LandingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col p-6 text-slate-100 animate-pulse">
      <div className="h-14 bg-slate-900/80 border border-slate-800 rounded-xl mb-8" />
      <div className="max-w-5xl mx-auto w-full space-y-6 py-12">
        <div className="h-8 w-64 bg-cyan-900/40 rounded" />
        <div className="h-14 w-full max-w-xl bg-slate-800/60 rounded" />
        <div className="h-5 w-full max-w-lg bg-slate-800/40 rounded" />
        <div className="h-12 w-48 bg-cyan-500/20 rounded mt-4" />
      </div>
    </div>
  );
};
