'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface MoveLogProps {
  history: string[];
  captured: {
    w: string[]; // captured white pieces (played by black)
    b: string[]; // captured black pieces (played by white)
  };
}

// Convert piece abbreviations to symbols for log display
const pieceSymbols: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

export default function MoveLog({ history, captured }: MoveLogProps) {
  // Format history into pairs of moves: e.g. [ { index: 1, w: 'e4', b: 'e5' } ]
  const formattedMoves = [];
  for (let i = 0; i < history.length; i += 2) {
    formattedMoves.push({
      index: Math.floor(i / 2) + 1,
      w: history[i],
      b: history[i + 1] || '',
    });
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-full space-y-6">
      
      {/* Captured Material Console */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Captured Material
        </h3>
        
        {/* Black pieces captured by White */}
        <div className="flex flex-col gap-1 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Captured by White</span>
          <div className="flex flex-wrap gap-1 min-h-[24px] text-lg text-slate-200">
            {captured.b.map((p, idx) => (
              <span key={idx} className="drop-shadow-sm select-none" title={p.toUpperCase()}>
                {pieceSymbols[p.toLowerCase()] || p}
              </span>
            ))}
            {captured.b.length === 0 && (
              <span className="text-xs font-mono text-slate-600">None</span>
            )}
          </div>
        </div>

        {/* White pieces captured by Black */}
        <div className="flex flex-col gap-1 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Captured by Black</span>
          <div className="flex flex-wrap gap-1 min-h-[24px] text-lg text-slate-400">
            {captured.w.map((p, idx) => (
              <span key={idx} className="drop-shadow-sm select-none" title={p.toUpperCase()}>
                {pieceSymbols[p.toLowerCase()] || p}
              </span>
            ))}
            {captured.w.length === 0 && (
              <span className="text-xs font-mono text-slate-600">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Algebraic Notation Move Log */}
      <div className="flex-1 flex flex-col min-h-[180px] max-h-[300px]">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-3">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Move Ledger
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {formattedMoves.map((m) => (
            <div
              key={m.index}
              className="grid grid-cols-12 text-xs font-mono py-1 px-2 rounded hover:bg-slate-950/40 border border-transparent hover:border-slate-850 transition-colors"
            >
              <span className="col-span-2 text-slate-500 font-bold">{m.index}.</span>
              <span className="col-span-5 text-slate-300 font-semibold">{m.w}</span>
              <span className="col-span-5 text-slate-400 font-semibold">{m.b}</span>
            </div>
          ))}
          {formattedMoves.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500 py-8">
              No moves played yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
