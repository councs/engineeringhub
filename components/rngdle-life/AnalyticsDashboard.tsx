'use client';

import { useState } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';
import { Share2, Check, Sparkles, Activity, ShieldCheck, Flame, Repeat } from 'lucide-react';

export default function AnalyticsDashboard() {
  const {
    generation,
    grid,
    gridSize,
    peakPopulation,
    evalResult,
    generateShareText,
  } = useRngdleStore();

  const [copied, setCopied] = useState(false);

  // Compute active live cells in current generation
  let currentLiveCount = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 1) currentLiveCount++;
    }
  }

  const handleShare = () => {
    const shareText = generateShareText();
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Seed Rating Styling
  const rating = evalResult?.rating || 'Common';
  let ratingBadgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let ratingIcon = '⚙️';

  if (rating === 'Mythic') {
    ratingBadgeStyle = 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    ratingIcon = '🌟';
  } else if (rating === 'Legendary') {
    ratingBadgeStyle = 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
    ratingIcon = '🔥';
  } else if (rating === 'Rare') {
    ratingBadgeStyle = 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border-sky-500/50';
    ratingIcon = '💎';
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl w-full text-slate-200">
      
      {/* Top Header: Rating & Share Button */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-sky-400" size={22} />
          <h3 className="text-lg font-bold tracking-wide text-slate-100">Seed Analytics & Rating</h3>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-700 shadow-md"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied Result!</span>
            </>
          ) : (
            <>
              <Share2 size={16} />
              <span>Share Wordle Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Seed Power Score & Rating Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${ratingBadgeStyle} text-2xl`}>
            {ratingIcon}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seed Rating</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold border ${ratingBadgeStyle}`}>
                {rating}
              </span>
            </div>
            <span className="text-2xl font-mono font-extrabold text-slate-100 mt-0.5">
              {evalResult?.score || 0} <span className="text-xs text-slate-500 font-sans font-normal">Power Score</span>
            </span>
          </div>
        </div>

        {/* Period Loop / Extinction Evaluator Tag */}
        <div className="flex flex-col sm:items-end text-left sm:text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Repeat size={14} className="text-purple-400" /> Loop Evaluator
          </span>
          <span className="text-sm font-mono font-bold text-slate-300 mt-1">
            {evalResult?.period && evalResult.period > 0 ? (
              <span className="text-purple-400">Period-{evalResult.period} Oscillator</span>
            ) : (
              <span className="text-slate-400">Extinct / Static at Tick {evalResult?.lifespan}</span>
            )}
          </span>
        </div>
      </div>

      {/* Grid Real-time Stats Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Current Generation */}
        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Activity size={12} className="text-sky-400" /> Generation
          </span>
          <span className="text-2xl font-mono font-bold text-sky-400 tabular-nums">
            {generation}
          </span>
        </div>

        {/* Live Population */}
        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" /> Live Cells
          </span>
          <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            {currentLiveCount}
          </span>
        </div>

        {/* Peak Population */}
        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Flame size={12} className="text-rose-400" /> Peak Pop
          </span>
          <span className="text-2xl font-mono font-bold text-rose-400 tabular-nums">
            {peakPopulation}
          </span>
        </div>

        {/* Chaos Variance */}
        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Sparkles size={12} className="text-purple-400" /> Chaos SD
          </span>
          <span className="text-2xl font-mono font-bold text-purple-400 tabular-nums">
            ±{evalResult?.chaosVariance || 0}
          </span>
        </div>

      </div>

    </div>
  );
}
