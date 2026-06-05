'use client';

import React from 'react';
import { RefreshCw, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface RevealModalProps {
  companyName: string;
  ticker: string;
  dateRangeText: string;
  eventSummary: string;
  percentChange: number;
  isCorrect: boolean;
  onNext: () => void;
  onReset: () => void;
}

export default function RevealModal({
  companyName,
  ticker,
  dateRangeText,
  eventSummary,
  percentChange,
  isCorrect,
  onNext,
  onReset,
}: RevealModalProps) {
  const isUp = percentChange > 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col gap-6 relative overflow-hidden">
      {/* Background radial accent glow */}
      <div
        className={`absolute top-0 right-0 w-64 h-64 rounded-full filter blur-[80px] opacity-10 pointer-events-none -mr-16 -mt-16 transition-all duration-500 ${
          isCorrect ? 'bg-emerald-400' : 'bg-rose-500'
        }`}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="flex items-center gap-1 text-emerald-400 font-extrabold text-xs font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CORRECT PREDICTION
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-extrabold text-xs font-mono bg-rose-500/10 px-2 py-0.5 rounded">
                <XCircle className="w-3.5 h-3.5" />
                INCORRECT
              </span>
            )}
            <span className="text-xs text-slate-500 font-semibold uppercase font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
              {dateRangeText}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-100 mt-2 flex items-baseline gap-2">
            {companyName}
            <span className="text-sm font-bold text-slate-500 font-mono">({ticker})</span>
          </h2>
        </div>

        {/* Outcome Percent Badge */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            5-Day Return
          </span>
          <span
            className={`text-2xl font-black font-mono ${
              isUp ? 'text-emerald-400' : 'text-rose-500'
            }`}
          >
            {isUp ? '+' : ''}
            {percentChange.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Historical Summary Box */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          What Happened?
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed font-medium bg-slate-950/40 p-4 border border-slate-900 rounded-xl">
          {eventSummary}
        </p>
      </div>

      {/* Control Actions */}
      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3 px-5 border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-100 hover:border-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Game
        </button>
        <button
          onClick={onNext}
          className="flex-grow flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-slate-100 font-extrabold text-sm rounded-xl tracking-wide transition-all hover:translate-x-0.5 active:translate-x-0 shadow-lg shadow-blue-600/10 cursor-pointer"
        >
          Next Scenario
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
