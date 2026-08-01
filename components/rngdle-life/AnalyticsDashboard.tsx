'use client';

import { useState, useEffect } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';
import { Share2, Check, Sparkles, Activity, ShieldCheck, Flame, Repeat, Flag, Clock, Layers, ChevronDown, ChevronUp, Zap, Trophy, Grid } from 'lucide-react';

function ScoreTicker({ targetScore, rating }: { targetScore: number; rating: string }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 600;
    const stepTime = 20;
    const steps = Math.ceil(duration / stepTime);
    const increment = (targetScore - start) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start + increment * currentStep));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  let scoreColorStyle = 'text-sky-400';
  if (rating === 'Mythic') {
    scoreColorStyle = 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]';
  } else if (rating === 'Legendary') {
    scoreColorStyle = 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]';
  } else if (rating === 'Rare') {
    scoreColorStyle = 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]';
  }

  return (
    <span className={`text-3xl font-mono font-extrabold transition-all ${scoreColorStyle}`}>
      {displayScore.toLocaleString()}
    </span>
  );
}

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
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);

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
    baseScore: 0,
    lifespanPoints: 0,
    peakPopPoints: 0,
    chaosPoints: 0,
    loopPoints: 0,
    traitPoints: 0,
    multiplier: 1.0,
    percentile: 'Top 45% Common Seed',
    appliedTraits: [],
  };

  const archetype = evalResult?.archetype;

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

      {/* Top Header: Class Archetype Title & Share Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          {archetype ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-950/80 to-slate-950 border border-purple-500/40 rounded-xl shadow-md">
              <span className="text-2xl">{archetype.emoji}</span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-purple-300">Class Archetype</span>
                <span className="text-base font-extrabold text-slate-100">{archetype.title}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="text-sky-400" size={22} />
              <h3 className="text-lg font-bold tracking-wide text-slate-100">Seed Analytics & Rating</h3>
            </div>
          )}
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

      {/* Seed Power Score, Percentile Rank & Rating Card */}
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
              <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {bd.percentile}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <ScoreTicker targetScore={evalResult?.score || 0} rating={rating} />
              <span className="text-xs text-slate-400 font-sans font-medium">Total Power Score</span>
            </div>
          </div>
        </div>

        {/* Period Loop Evaluator Tag */}
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
        
        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Activity size={12} className="text-sky-400" /> Generation
          </span>
          <span className="text-2xl font-mono font-bold text-sky-400 tabular-nums">
            {generation}
          </span>
        </div>

        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" /> Live Cells
          </span>
          <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            {currentLiveCount}
          </span>
        </div>

        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Flame size={12} className="text-rose-400" /> Peak Pop
          </span>
          <span className="text-2xl font-mono font-bold text-rose-400 tabular-nums">
            {peakPopulation}
          </span>
        </div>

        <div className="flex flex-col p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Layers size={12} className="text-purple-400" /> Chaos SD
          </span>
          <span className="text-2xl font-mono font-bold text-purple-400 tabular-nums">
            ±{evalResult?.chaosVariance || 0}
          </span>
        </div>
      </div>

      {/* COLLAPSIBLE "WHY THIS SEED IS GOOD" BREAKDOWN CARD */}
      <div className="flex flex-col border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden transition-all">
        <button
          onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
          className="flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900 transition-colors w-full text-left"
        >
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
            <Trophy size={16} />
            <span>Why This Seed Is Good (Score Breakdown)</span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {bd.percentile}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>{isBreakdownOpen ? 'Collapse' : 'Expand'}</span>
            {isBreakdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isBreakdownOpen && (
          <div className="flex flex-col gap-4 p-4 border-t border-slate-800 animate-in fade-in duration-300 text-xs">
            
            {/* Arena & Multiplier Summary Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-purple-950/30 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Grid size={16} className="text-purple-400" />
                <span className="font-semibold text-slate-200">
                  Arena: <strong className="text-sky-300">{evalResult?.gridSize}x{evalResult?.gridSize}</strong> ({evalResult?.podCount} {evalResult?.podCount === 1 ? 'Pod' : 'Pods'}) | Rule: <strong className="text-amber-300">{evalResult?.ruleMode}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded font-mono font-bold border border-amber-500/40">
                <Zap size={14} /> {bd.multiplier}x Rarity Multiplier Applied
              </div>
            </div>

            {/* Base Sim Score vs Trait Points Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Base Simulation Points */}
              <div className="flex flex-col p-3 bg-slate-900/80 rounded-lg border border-slate-800 gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Base Simulation Score (+{bd.baseScore || 0} pts)
                </span>

                <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Lifespan (Pre-loop Ticks)</span>
                    <span className="font-bold text-sky-400">+{bd.lifespanPoints} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Peak Cell Population</span>
                    <span className="font-bold text-emerald-400">+{bd.peakPopPoints} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Chaos Volatility SD</span>
                    <span className="font-bold text-purple-400">+{bd.chaosPoints} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Oscillator Loop Bonus</span>
                    <span className="font-bold text-amber-400">+{bd.loopPoints} pts</span>
                  </div>
                </div>
              </div>

              {/* Trait Bonuses Unlocked */}
              <div className="flex flex-col p-3 bg-slate-900/80 rounded-lg border border-slate-800 gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  Trait Bonuses Unlocked (+{bd.traitPoints || 0} pts)
                </span>

                {bd.appliedTraits && bd.appliedTraits.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {bd.appliedTraits.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-950/60 border border-slate-800">
                        <span className="font-semibold text-slate-200 flex items-center gap-1">
                          <span>{t.emoji}</span> {t.name}
                        </span>
                        <span className="font-mono font-bold text-amber-400">+{t.bonusPoints} pts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">
                    No special seed traits. Standard Conway rules applied.
                  </span>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
