'use client';

import { useState } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';
import { Share2, Check, Sparkles, Activity, ShieldCheck, Flame, Repeat, Flag, Clock, Layers } from 'lucide-react';

export default function AnalyticsDashboard() {
  const {
    generation,
    grid,
    gridSize,
    peakPopulation,
    evalResult,
    isSettled,
    settledInfo,
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

  const bd = evalResult?.breakdown || {
    lifespanPoints: 0,
    peakPopPoints: 0,
    chaosPoints: 0,
    loopPoints: 0,
    traitPoints: 0,
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl w-full text-slate-200">
      
      {/* Simulation Settled Banner Alert */}
      {isSettled && settledInfo && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-300">
              <Flag size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-300">
                  Simulation Settled!
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Tick {settledInfo.generation}
                </span>
              </div>
              <span className="text-xs text-slate-300 mt-0.5">
                {settledInfo.reason}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tally Score</span>
            <span className="text-xl font-mono font-extrabold text-amber-400">
              {evalResult?.score || 0}
            </span>
          </div>
        </div>
      )}

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

      {/* Score Formula Breakdown Section */}
      <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Layers size={14} className="text-sky-400" /> Seed Power Score Breakdown
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          {/* 1. Run Time / Lifespan */}
          <div className="flex flex-col p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Clock size={10} className="text-sky-400" /> Pre-Loop Run Time
            </span>
            <span className="font-mono font-bold text-sky-400 mt-1">
              +{bd.lifespanPoints} pts
            </span>
            <span className="text-[9px] text-slate-500">{evalResult?.lifespan || 0} ticks (3.0×)</span>
          </div>

          {/* 2. Peak Population */}
          <div className="flex flex-col p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Flame size={10} className="text-rose-400" /> Peak Pop
            </span>
            <span className="font-mono font-bold text-rose-400 mt-1">
              +{bd.peakPopPoints} pts
            </span>
            <span className="text-[9px] text-slate-500">{evalResult?.peakPopulation || 0} max cells (1.5×)</span>
          </div>

          {/* 3. Chaos SD */}
          <div className="flex flex-col p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Sparkles size={10} className="text-purple-400" /> Chaos Variance
            </span>
            <span className="font-mono font-bold text-purple-400 mt-1">
              +{bd.chaosPoints} pts
            </span>
            <span className="text-[9px] text-slate-500">±{evalResult?.chaosVariance || 0} SD (4.0×)</span>
          </div>

          {/* 4. Loop Period */}
          <div className="flex flex-col p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Repeat size={10} className="text-amber-400" /> Loop Bonus
            </span>
            <span className="font-mono font-bold text-amber-400 mt-1">
              +{bd.loopPoints} pts
            </span>
            <span className="text-[9px] text-slate-500">Period {evalResult?.period || 0} (20× P)</span>
          </div>

          {/* 5. Traits */}
          <div className="flex flex-col p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <Flag size={10} className="text-emerald-400" /> Trait Badges
            </span>
            <span className="font-mono font-bold text-emerald-400 mt-1">
              +{bd.traitPoints} pts
            </span>
            <span className="text-[9px] text-slate-500">{evalResult?.traits.length || 0} badges (50×)</span>
          </div>

        </div>
      </div>

    </div>
  );
}
