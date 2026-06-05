'use client';

import Link from 'next/link';
import { ArrowLeft, Swords } from 'lucide-react';
import SimulationCanvas from '@/components/rps-3d/SimulationCanvas';
import SimulationCanvas2d from '@/components/rps-3d/SimulationCanvas2d';
import SimulationControls from '@/components/rps-3d/SimulationControls';
import { useRpsStore } from '@/lib/store/useRpsStore';

export default function Rps3dPage() {
  const { dimensionMode } = useRpsStore();

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans text-slate-100 flex flex-col items-center selection:bg-blue-500/30">
      <div className="max-w-6xl w-full flex flex-col gap-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm font-semibold w-fit group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </Link>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <Swords size={24} />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent inline-block">
                Rock Paper Scissors Simulator
              </h1>
              <p className="text-slate-400 text-base md:text-lg max-w-2xl font-light">
                Watch emojis hunt their prey and flee from predators in a 2D or 3D arena, mutating on contact until only one kind survives.
              </p>
            </div>
          </div>
        </header>

        {/* Core Simulation Panels */}
        <main className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          {dimensionMode === '3D' ? <SimulationCanvas /> : <SimulationCanvas2d />}
          <SimulationControls />
        </main>

      </div>
    </div>
  );
}

