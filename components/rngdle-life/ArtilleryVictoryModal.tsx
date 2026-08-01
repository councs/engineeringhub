'use client';

import { useState } from 'react';
import { useRngdleStore } from '@/lib/store/useRngdleStore';
import { Trophy, Share2, Check, RotateCcw, Target, Rocket, Award, Sparkles, X } from 'lucide-react';

export default function ArtilleryVictoryModal() {
  const {
    seed,
    isGameOver,
    percentDestroyed,
    artilleryFinalScore,
    ammoCount,
    evalResult,
    resetArtilleryRound,
    generateArtilleryShareText,
  } = useRngdleStore();

  const [copied, setCopied] = useState(false);

  if (!isGameOver) return null;

  const handleShare = () => {
    const text = generateArtilleryShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isWin = percentDestroyed >= 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex flex-col gap-6 p-8 bg-slate-900 border border-rose-500/50 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.3)] max-w-lg w-full text-slate-100 relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-4 bg-gradient-to-tr from-rose-500 to-amber-500 text-slate-950 rounded-2xl shadow-xl">
            <Trophy size={36} />
          </div>

          <h2 className="text-2xl font-extrabold tracking-wide text-slate-100 mt-2">
            {isWin ? '🏆 TARGET COLLAPSED!' : '💥 DESTRUCTION COMPLETE!'}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Glider Artillery Round #{seed}
          </span>
        </div>

        {/* Stat Badges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Destroyed</span>
            <span className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">
              {percentDestroyed}%
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Final Score</span>
            <span className="text-3xl font-mono font-extrabold text-amber-400 mt-1">
              {artilleryFinalScore}
            </span>
          </div>
        </div>

        {/* Score Breakdown List */}
        <div className="flex flex-col gap-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Target Destruction (% Destroyed × 100)</span>
            <span className="font-mono font-bold text-slate-200">+{percentDestroyed * 100} pts</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Unused Ammo Bonus ({ammoCount} Gliders left)</span>
            <span className="font-mono font-bold text-rose-400">+{ammoCount * 500} pts</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Seed Rarity Bonus ({evalResult?.rating || 'Common'})</span>
            <span className="font-mono font-bold text-amber-400">+{evalResult?.score || 0} pts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all shadow-md w-full"
          >
            {copied ? (
              <>
                <Check size={18} /> Copied Summary!
              </>
            ) : (
              <>
                <Share2 size={18} /> Share Result
              </>
            )}
          </button>

          <button
            onClick={resetArtilleryRound}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors w-full"
          >
            <RotateCcw size={18} /> Play Again
          </button>
        </div>

      </div>
    </div>
  );
}
