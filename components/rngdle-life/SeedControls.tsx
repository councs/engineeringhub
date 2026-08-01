'use client';

import { useState } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';
import { Dices, Play, Pause, SkipForward, RotateCcw, SlidersHorizontal } from 'lucide-react';

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
    evalResult,
  } = useRngdleStore();

  const [inputVal, setInputVal] = useState(seed);

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

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl w-full text-slate-200">
      {/* Top Bar: Seed Input & Roll Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Seed Roller Input */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col gap-1">
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
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95"
              >
                <Dices size={20} /> Roll Seed
              </button>
            </div>
          </div>
        </div>

        {/* Trait Badge Chips */}
        <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end w-full sm:w-auto">
          {evalResult?.traits && evalResult.traits.length > 0 ? (
            evalResult.traits.map((trait) => (
              <div
                key={trait.id}
                title={trait.description}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm ${trait.color}`}
              >
                <span>{trait.emoji}</span>
                <span>{trait.name}</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-500 text-xs font-medium">
              Standard Seed Trait
            </div>
          )}
        </div>
      </div>

      {/* Main Simulation Action Controls */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 border-t border-slate-800/80 pt-5">
        
        {/* Play/Pause/Step/Reset Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => (isPlaying ? pause() : play())}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-all shadow-md w-32 ${
              isSettled
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

        {/* Speed Slider */}
        <div className="flex items-center gap-4 w-full xl:w-72">
          <SlidersHorizontal size={18} className="text-slate-400" />
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Tick Speed</span>
              <span className="font-mono text-sky-400">{speed}ms</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
