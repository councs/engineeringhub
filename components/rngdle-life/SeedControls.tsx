'use client';

import { useState } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';
import { Dices, Play, Pause, SkipForward, SkipBack, RotateCcw, SlidersHorizontal, Volume2, VolumeX, Zap, Search, X, ShieldAlert, Infinity as InfinityIcon, Grid, Info, Award, Compass } from 'lucide-react';

export default function SeedControls() {
  const {
    seed,
    setSeed,
    rollRandomSeed,
    isPlaying,
    isSettled,
    play,
    pause,
    step,
    reset,
    speed,
    setSpeed,
    isMuted,
    toggleMute,
    autoPauseOnSettled,
    toggleAutoPause,
    evalResult,

    // Inspector State & Actions
    isInspecting,
    inspectStep,
    inspectTotalSteps,
    inspectAutoPlay,
    startInspection,
    exitInspection,
    setInspectStep,
    stepInspection,
    toggleInspectAutoPlay,
  } = useRngdleStore();

  const [inputVal, setInputVal] = useState(seed);
  const [activeTraitHover, setActiveTraitHover] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    if (val.replace(/\D/g, '').length === 7) {
      setSeed(val);
    }
  };

  const handleRoll = () => {
    rollRandomSeed();
    const newSeed = useRngdleStore.getState().seed;
    setInputVal(newSeed);
  };

  const isRuleMutated = evalResult?.ruleMode && !evalResult.ruleMode.includes('Conway');

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl w-full text-slate-200">
      
      {/* Top Bar: Seed Input, Active Rule Badge, Arena Size Badge */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        
        {/* Seed Roller Input */}
        <div className="flex flex-col gap-1 w-full xl:w-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">7-Digit Seed (RNGdle)</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={7}
              value={inputVal}
              onChange={handleInputChange}
              className="bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-4 py-2 text-xl font-mono tracking-widest font-extrabold text-sky-400 outline-none w-36 text-center shadow-inner"
            />
            <button
              onClick={handleRoll}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95 shrink-0"
            >
              <Dices size={20} /> Roll Seed
            </button>

            {/* Inspect Seed Mode Button */}
            <button
              onClick={() => (isInspecting ? exitInspection() : startInspection())}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border shadow-md shrink-0 ${
                isInspecting
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
              }`}
              title="Inspect step-by-step PRNG seed construction"
            >
              {isInspecting ? <X size={18} /> : <Search size={18} />}
              <span>{isInspecting ? 'Exit Mode' : 'Inspect Seed'}</span>
            </button>
          </div>
        </div>

        {/* ACTIVE RULE & ARENA STATUS BADGES (OBVIOUS BREAKDOWN) */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          
          {/* Active Rule Badge */}
          <div className={`flex flex-col p-3 rounded-xl border transition-all ${
            isRuleMutated
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 flex items-center gap-1">
              <Zap size={12} className={isRuleMutated ? 'text-amber-400' : 'text-slate-500'} /> Simulation Rule Set
            </span>
            <span className="text-xs font-mono font-bold mt-0.5">
              {evalResult?.ruleMode || 'B3/S23 (Conway)'}
            </span>
          </div>

          {/* Arena Dimensions & Pod Spawner Badge */}
          <div className="flex flex-col p-3 rounded-xl border bg-slate-950/80 border-slate-800 text-slate-300">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 flex items-center gap-1">
              <Grid size={12} className="text-purple-400" /> Arena & Spawners
            </span>
            <span className="text-xs font-mono font-bold text-sky-300 mt-0.5">
              {evalResult?.gridSize}x{evalResult?.gridSize} Grid ({evalResult?.podCount} {evalResult?.podCount === 1 ? 'Pod' : 'Corner Pods'})
            </span>
          </div>

        </div>

      </div>

      {/* Trait Badge Chips with Interactive Hover Popovers */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Award size={14} className="text-amber-400" /> Active Seed Trait Bonuses:
        </span>

        <div className="flex flex-wrap gap-2 items-center">
          {evalResult?.traits && evalResult.traits.length > 0 ? (
            evalResult.traits.map((trait) => (
              <div
                key={trait.id}
                onMouseEnter={() => setActiveTraitHover(trait.id)}
                onMouseLeave={() => setActiveTraitHover(null)}
                className="relative group cursor-pointer"
              >
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm transition-all hover:scale-105 ${trait.color}`}>
                  <span>{trait.emoji}</span>
                  <span>{trait.name}</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-950/60 font-mono text-[10px] text-amber-300 font-extrabold border border-amber-500/30">
                    +{trait.bonusPoints}
                  </span>
                </div>

                {/* Trait Interactive Popover Tooltip */}
                {activeTraitHover === trait.id && (
                  <div className="absolute top-full right-0 mt-2 z-50 w-72 p-3 bg-slate-950/95 backdrop-blur-md border border-amber-500/50 rounded-xl shadow-2xl text-slate-200 animate-in fade-in duration-200 pointer-events-none">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                      <span className="text-lg">{trait.emoji}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-100">{trait.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">+{trait.bonusPoints} Bonus Points</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                      {trait.description}
                    </p>
                    {trait.ruleUnlocked && (
                      <div className="flex items-start gap-1.5 text-[10px] font-bold text-sky-400 bg-sky-950/40 p-2 rounded-lg border border-sky-500/30">
                        <Zap size={12} className="shrink-0 mt-0.5" />
                        <span>{trait.ruleUnlocked}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <span>⚙️ Standard Conway Rules (No Special Trait Bonuses)</span>
            </div>
          )}
        </div>
      </div>

      {/* INSPECTOR TOOLBAR */}
      {isInspecting ? (
        <div className="flex flex-col gap-4 border-t border-amber-500/40 pt-5 bg-amber-950/20 p-4 rounded-xl border animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => stepInspection(-1)}
                disabled={inspectStep <= 0}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-bold text-slate-200 border border-slate-700"
              >
                <SkipBack size={14} /> Prev Cell
              </button>

              <button
                onClick={toggleInspectAutoPlay}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-[0_0_12px_rgba(250,204,21,0.3)]"
              >
                {inspectAutoPlay ? (
                  <>
                    <Pause size={14} /> Pause Scan
                  </>
                ) : (
                  <>
                    <Play size={14} /> Auto Scan
                  </>
                )}
              </button>

              <button
                onClick={() => stepInspection(1)}
                disabled={inspectStep >= inspectTotalSteps}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-bold text-slate-200 border border-slate-700"
              >
                Next Cell <SkipForward size={14} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-amber-300">
                Cell Index: <span className="text-white">{inspectStep}</span> / {inspectTotalSteps}
              </span>

              <button
                onClick={exitInspection}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-lg text-xs font-bold border border-rose-900/50"
              >
                <X size={14} /> Exit Inspector
              </button>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            <div className="flex flex-col flex-1 gap-1 w-full">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>PRNG Pod Scanning Progress</span>
                <span className="font-mono text-amber-400">{((inspectStep / inspectTotalSteps) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={inspectTotalSteps}
                value={inspectStep}
                onChange={(e) => setInspectStep(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-56">
              <SlidersHorizontal size={16} className="text-amber-400" />
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Scan Speed</span>
                  <span className="font-mono text-amber-400">{speed > 70 ? 'Fast' : speed > 40 ? 'Med' : 'Slow'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* NORMAL SIMULATION ACTION CONTROLS */
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 border-t border-slate-800/80 pt-5">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => (isPlaying ? pause() : play())}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-all shadow-md w-32 ${
                isSettled && autoPauseOnSettled
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-sky-600 hover:bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={18} /> Pause
                </>
              ) : (
                <>
                  <Play size={18} /> {isSettled ? 'Resume' : 'Play'}
                </>
              )}
            </button>

            <button
              onClick={step}
              disabled={isPlaying}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-slate-200 transition-colors border border-slate-700"
              title="Advance 1 Generation"
            >
              <SkipForward size={18} /> Step (+1)
            </button>

            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-slate-200 transition-colors border border-slate-700"
              title="Reset to Initial Seed Grid"
            >
              <RotateCcw size={18} /> Reset
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                isMuted
                  ? 'bg-slate-950 text-slate-500 border-slate-800'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
              }`}
              title={isMuted ? 'Unmute Web Audio Pitch Beeps' : 'Mute Web Audio Pitch Beeps'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            <button
              onClick={toggleAutoPause}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                autoPauseOnSettled
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
              }`}
              title={autoPauseOnSettled ? 'Auto-Pause when steady state reached' : 'Continuous Mode: keeps animating even after steady state'}
            >
              {autoPauseOnSettled ? <ShieldAlert size={16} /> : <InfinityIcon size={16} />}
              <span>{autoPauseOnSettled ? 'Auto-Stop: ON' : 'Continuous: ON'}</span>
            </button>

            <div className="flex items-center gap-3 flex-1 xl:w-52">
              <SlidersHorizontal size={18} className="text-slate-400" />
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Speed</span>
                  <span className="font-mono text-sky-400">{speed > 70 ? 'Fast' : speed > 40 ? 'Med' : 'Slow'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
