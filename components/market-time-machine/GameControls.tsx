'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Flame, Trophy, Percent } from 'lucide-react';

interface GameControlsProps {
  onPredict: (prediction: 'UP' | 'DOWN') => void;
  streak: number;
  highScore: number;
  score: number;
  hasGuessed: boolean;
  currentPrediction: 'UP' | 'DOWN' | null;
}

export default function GameControls({
  onPredict,
  streak,
  highScore,
  score,
  hasGuessed,
  currentPrediction,
}: GameControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
      {/* Gamification Stats Dashboard */}
      <div className="md:col-span-6 grid grid-cols-3 gap-4">
        {/* Score */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between items-center shadow-lg">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-blue-400" />
            <span>Score</span>
          </div>
          <span className="text-2xl font-black text-slate-100 mt-2 font-mono">{score}</span>
        </div>

        {/* Current Streak */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between items-center shadow-lg relative overflow-hidden">
          {streak > 0 && (
            <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-bl-full flex items-center justify-center">
              <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 animate-bounce' : 'text-slate-500'}`} />
            <span>Streak</span>
          </div>
          <span className="text-2xl font-black text-slate-100 mt-2 font-mono">
            {streak}
          </span>
        </div>

        {/* High Score */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between items-center shadow-lg">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            <span>High Record</span>
          </div>
          <span className="text-2xl font-black text-slate-100 mt-2 font-mono">{highScore}</span>
        </div>
      </div>

      {/* Action Buttons Console */}
      <div className="md:col-span-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 shadow-lg">
        {!hasGuessed ? (
          <div className="w-full flex gap-4">
            {/* UP button */}
            <button
              onClick={() => onPredict('UP')}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5 stroke-[3]" />
              PREDICT UP
            </button>

            {/* DOWN button */}
            <button
              onClick={() => onPredict('DOWN')}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-rose-500/10 cursor-pointer"
            >
              <ArrowDownRight className="w-5 h-5 stroke-[3]" />
              PREDICT DOWN
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs font-mono text-slate-400">
            Selected prediction:{' '}
            <span
              className={`font-black ml-2 px-2 py-0.5 rounded text-[11px] ${
                currentPrediction === 'UP'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {currentPrediction}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
