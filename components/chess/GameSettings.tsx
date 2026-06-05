'use client';

import React from 'react';
import { Cpu, User, RefreshCw, Play, Pause } from 'lucide-react';

interface GameSettingsProps {
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
  playerColor: 'w' | 'b';
  setPlayerColor: (color: 'w' | 'b') => void;
  isAiVsAi: boolean;
  setIsAiVsAi: (val: boolean) => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  onReset: () => void;
  gameStatus: string;
}

export default function GameSettings({
  difficulty,
  setDifficulty,
  playerColor,
  setPlayerColor,
  isAiVsAi,
  setIsAiVsAi,
  isPaused,
  setIsPaused,
  onReset,
  gameStatus,
}: GameSettingsProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      
      {/* Game Status Banner */}
      <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl text-center">
        <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase tracking-widest block">
          SYSTEM STATUS
        </span>
        <span className="text-sm font-bold text-slate-100 mt-1 block font-mono">
          {gameStatus}
        </span>
      </div>

      {/* Settings Grid */}
      <div className="flex flex-col gap-5">
        
        {/* Game Mode Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
            Game Mode / Play As
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setIsAiVsAi(false);
                setPlayerColor('w');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                !isAiVsAi && playerColor === 'w'
                  ? 'bg-slate-100 border-slate-200 text-slate-950 shadow-md'
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              White
            </button>
            <button
              onClick={() => {
                setIsAiVsAi(false);
                setPlayerColor('b');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                !isAiVsAi && playerColor === 'b'
                  ? 'bg-slate-100 border-slate-200 text-slate-950 shadow-md'
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Black
            </button>
            <button
              onClick={() => {
                setIsAiVsAi(true);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isAiVsAi
                  ? 'bg-blue-600 border-blue-500 text-slate-100 shadow-md shadow-blue-600/10'
                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              AI vs AI
            </button>
          </div>
        </div>

        {/* AI Engine Difficulty */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
            Engine Search Depth (Difficulty)
          </label>
          <div className="flex gap-1.5">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                  difficulty === diff
                    ? 'bg-blue-600 border-blue-500 text-slate-100 shadow-md shadow-blue-600/10'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isPaused
              ? 'bg-emerald-600 border-emerald-500 text-slate-100 shadow-md shadow-emerald-600/10 hover:bg-emerald-500'
              : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-300'
          }`}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-slate-100 font-extrabold text-xs rounded-xl tracking-wider uppercase transition-all shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Restart
        </button>
      </div>
    </div>
  );
}
