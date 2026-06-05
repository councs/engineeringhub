'use client';

import React from 'react';

interface EvalBarProps {
  score: number; // positive = White advantage, negative = Black advantage
  isReversed: boolean;
}

export default function EvalBar({ score, isReversed }: EvalBarProps) {
  // Convert centipawns score to pawns (e.g. +320 -> +3.2)
  const pawnScore = score / 100;
  
  // Cap at +/- 10.0 pawns for visualization scaling
  const maxCap = 10.0;
  const clampedScore = Math.max(-maxCap, Math.min(maxCap, pawnScore));
  
  // Calculate percentage fill (0% is full Black advantage, 100% is full White advantage)
  // middle is 50%
  let percentage = 50 + (clampedScore / maxCap) * 50;

  // If view is reversed (playing as black), invert fill perspective
  if (isReversed) {
    percentage = 100 - percentage;
  }

  // Display label formatting
  let scoreLabel = '0.0';
  if (pawnScore !== 0) {
    const absScore = Math.abs(pawnScore).toFixed(1);
    const sign = pawnScore > 0 ? '+' : '-';
    // If it's a huge king valuation (mate detected/critical checkmate), show M
    if (Math.abs(pawnScore) > 150) {
      scoreLabel = 'M';
    } else {
      scoreLabel = `${sign}${absScore}`;
    }
  }

  return (
    <div className="w-8 h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col relative select-none">
      {/* Black perspective fill (Top for normal view, Bottom for reversed) */}
      <div 
        className="w-full bg-[#1e293b] transition-all duration-500 ease-out"
        style={{ height: `${100 - percentage}%` }}
      />
      
      {/* Divider */}
      <div className="absolute left-0 right-0 top-1/2 h-[1px] border-t border-slate-700/60 z-10" />

      {/* White perspective fill (Bottom for normal view, Top for reversed) */}
      <div 
        className="w-full bg-slate-100 transition-all duration-500 ease-out flex-grow"
        style={{ height: `${percentage}%` }}
      />

      {/* Value Overlay Text label */}
      <div 
        className={`absolute inset-x-0 font-mono text-[10px] font-black text-center pointer-events-none z-20 ${
          percentage > 50 
            ? isReversed ? 'text-slate-100 top-3' : 'text-slate-950 bottom-3'
            : isReversed ? 'text-slate-950 bottom-3' : 'text-slate-100 top-3'
        }`}
      >
        {scoreLabel}
      </div>
    </div>
  );
}
