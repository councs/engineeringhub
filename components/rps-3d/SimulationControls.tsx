'use client';

import { useState, useEffect } from 'react';
import { useRpsStore } from '@/lib/store/useRpsStore';
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward } from 'lucide-react';

export default function SimulationControls() {
  const {
    isPlaying,
    speedMultiplier,
    volume,
    isMuted,
    initialRockCount,
    initialPaperCount,
    initialScissorsCount,
    currentRockCount,
    currentPaperCount,
    currentScissorsCount,
    isFinished,
    winner,
    setInitialCounts,
    setSpeedMultiplier,
    setVolume,
    toggleMute,
    play,
    pause,
    reset,
    dimensionMode,
    setDimensionMode,
    movementMode,
    setMovementMode
  } = useRpsStore();

  // Local inputs to allow typing count values before submitting them
  const [rocks, setRocks] = useState(initialRockCount);
  const [papers, setPapers] = useState(initialPaperCount);
  const [scissors, setScissors] = useState(initialScissorsCount);

  // Sync state if store resets
  useEffect(() => {
    setRocks(initialRockCount);
    setPapers(initialPaperCount);
    setScissors(initialScissorsCount);
  }, [initialRockCount, initialPaperCount, initialScissorsCount]);

  const handleApplyCounts = () => {
    // Basic boundaries (ensure minimum of 1 and reasonable max to avoid crash)
    const r = Math.max(1, Math.min(rocks, 200));
    const p = Math.max(1, Math.min(papers, 200));
    const s = Math.max(1, Math.min(scissors, 200));
    setInitialCounts(r, p, s);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const totalEntities = currentRockCount + currentPaperCount + currentScissorsCount;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-xl w-full text-slate-200 border border-slate-800 shadow-xl">
      
      {/* Game Over Banner */}
      {isFinished && winner && (
        <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30 p-4 rounded-lg text-center animate-pulse">
          <h3 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
            🏆 {winner === 'rock' ? '🪨 ROCK' : winner === 'paper' ? '📄 PAPER' : '✂️ SCISSORS'} WINS!
          </h3>
          <p className="text-xs text-slate-400 mt-1">All opposing emojis have been eaten.</p>
        </div>
      )}

      {/* Primary Actions & Stats */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePlayPause}
            disabled={isFinished}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] w-32"
          >
            {isPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play</>}
          </button>
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors border border-slate-700 hover:border-slate-600"
          >
            <RotateCcw size={18} /> Restart
          </button>
          
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 ml-2">
            <button
              onClick={() => setDimensionMode('2D')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${dimensionMode === '2D' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              2D
            </button>
            <button
              onClick={() => setDimensionMode('3D')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${dimensionMode === '3D' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              3D
            </button>
          </div>
        </div>

        {/* Real-time stats */}
        <div className="flex flex-wrap gap-4 items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪨</span>
            <span className="text-sm font-semibold text-slate-400">Rock:</span>
            <span className="font-mono text-xl font-bold text-amber-500">{currentRockCount}</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <span className="text-sm font-semibold text-slate-400">Paper:</span>
            <span className="font-mono text-xl font-bold text-blue-400">{currentPaperCount}</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">✂️</span>
            <span className="text-sm font-semibold text-slate-400">Scissors:</span>
            <span className="font-mono text-xl font-bold text-purple-400">{currentScissorsCount}</span>
          </div>
        </div>
      </div>

      {/* Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 border-t border-slate-800 pt-5">
        
        {/* Spawn Count Settings */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Initial Spawns</label>
          <div className="flex gap-2 items-center">
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">🪨 Rock</span>
              <input 
                type="number" 
                min="1" 
                max="200"
                value={rocks} 
                disabled={isPlaying}
                onChange={(e) => setRocks(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 focus:border-blue-500 disabled:opacity-50 transition-colors rounded px-3 py-1.5 text-sm font-mono outline-none"
              />
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">📄 Paper</span>
              <input 
                type="number" 
                min="1" 
                max="200"
                value={papers} 
                disabled={isPlaying}
                onChange={(e) => setPapers(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 focus:border-blue-500 disabled:opacity-50 transition-colors rounded px-3 py-1.5 text-sm font-mono outline-none"
              />
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">✂️ Scissors</span>
              <input 
                type="number" 
                min="1" 
                max="200"
                value={scissors} 
                disabled={isPlaying}
                onChange={(e) => setScissors(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 focus:border-blue-500 disabled:opacity-50 transition-colors rounded px-3 py-1.5 text-sm font-mono outline-none"
              />
            </div>
            <button
              onClick={handleApplyCounts}
              disabled={isPlaying}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 hover:border-slate-600 rounded text-xs font-semibold uppercase tracking-wider self-end h-[34px] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Simulation Speed</label>
          <div className="flex items-center gap-4 h-full">
            <FastForward size={18} className="text-slate-400" />
            <input 
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="font-mono text-sm w-12 text-right">{speedMultiplier.toFixed(2)}x</span>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sound FX</label>
          <div className="flex items-center gap-3 h-full">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) toggleMute();
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              title="Volume"
            />
            <span className="font-mono text-xs w-8 text-right">{isMuted ? 0 : Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Movement Behaviors */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Movement Mode</label>
          <div className="flex items-center h-full">
            <select
              value={movementMode}
              onChange={(e) => setMovementMode(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500 w-full transition-colors h-[38px]"
            >
              <option value="hunt">Standard Hunt (Seek & Flee)</option>
              <option value="chaos">Chaos Jitter (Hunt + Wobble)</option>
              <option value="wander">Calm Wander (Ignore & Drift)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
