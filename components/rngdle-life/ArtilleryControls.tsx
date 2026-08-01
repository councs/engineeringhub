'use client';

import { useRngdleStore, ProjectileType, SpawnEdge } from '@/lib/store/useRngdleStore';
import { Target, Rocket, Sliders, Play, RotateCcw, Crosshair, ShieldAlert, Award } from 'lucide-react';

export default function ArtilleryControls() {
  const {
    ammoCount,
    initialTargetHp,
    currentTargetHp,
    percentDestroyed,
    projectileType,
    spawnEdge,
    spawnPos,
    isPlaying,
    isGameOver,
    setProjectileType,
    setSpawnEdge,
    setSpawnPos,
    fireArtillery,
    resetArtilleryRound,
  } = useRngdleStore();

  const hpPct = Math.max(0, Math.min(100, Math.round((currentTargetHp / (initialTargetHp || 1)) * 100)));

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-2xl border border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.2)] w-full text-slate-200">
      
      {/* Top Header: Ammo Status & Target HP Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        
        {/* Ammo Counter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400">
            <Target size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-rose-400">Glider Ammo</span>
            <div className="flex items-center gap-2 mt-0.5">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    num <= ammoCount
                      ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : 'bg-slate-950 text-slate-600 border-slate-800 opacity-40'
                  }`}
                >
                  <Rocket size={14} /> Shot #{num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Target HP Progress Bar */}
        <div className="flex flex-col flex-1 w-full md:max-w-md gap-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Crosshair size={14} className="text-rose-400" /> Target Structure HP
            </span>
            <span className="font-mono text-rose-400">
              {currentTargetHp} / {initialTargetHp} Cells ({hpPct}% HP)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${hpPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (Destroyed)</span>
            <span className="text-emerald-400 font-bold">{percentDestroyed}% Destroyed</span>
            <span>100% HP</span>
          </div>
        </div>

      </div>

      {/* Launcher Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* 1. Projectile Type Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Projectile Type</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setProjectileType('glider')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                projectileType === 'glider'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              🚀 Glider (Diagonal)
            </button>

            <button
              onClick={() => setProjectileType('lwss')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                projectileType === 'lwss'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              🛸 LWSS (Straight)
            </button>
          </div>
        </div>

        {/* 2. Perimeter Edge Picker */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Spawn Edge</span>
          <div className="grid grid-cols-4 gap-1.5">
            {(['top', 'left', 'right', 'bottom'] as SpawnEdge[]).map((edge) => (
              <button
                key={edge}
                onClick={() => setSpawnEdge(edge)}
                className={`py-2.5 rounded-lg border text-xs font-extrabold uppercase transition-all ${
                  spawnEdge === edge
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {edge}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Spawn Edge Position Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Perimeter Position</span>
            <span className="font-mono text-amber-400">Pos {spawnPos} / 47</span>
          </div>
          <input
            type="range"
            min="0"
            max="47"
            value={spawnPos}
            onChange={(e) => setSpawnPos(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-slate-800"
          />
        </div>

      </div>

      {/* Main Fire Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-5">
        
        <button
          onClick={fireArtillery}
          disabled={ammoCount <= 0 || isPlaying || isGameOver}
          className="flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-rose-500 via-red-600 to-orange-500 hover:from-rose-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-base rounded-xl transition-all shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 w-full sm:w-auto"
        >
          <Rocket size={22} />
          <span>
            {ammoCount <= 0
              ? 'Out of Ammo'
              : isPlaying
              ? 'Projectile Flying...'
              : `FIRE ${projectileType.toUpperCase()} (Shot #${4 - ammoCount})`}
          </span>
        </button>

        <button
          onClick={resetArtilleryRound}
          className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors"
        >
          <RotateCcw size={18} /> Reset Round
        </button>

      </div>

    </div>
  );
}
