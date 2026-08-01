'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Dices } from 'lucide-react';

const SeedControls = dynamic(() => import('@/components/rngdle-life/SeedControls'), {
  ssr: false,
  loading: () => <div className="w-full h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />,
});

const LifeCanvas = dynamic(() => import('@/components/rngdle-life/LifeCanvas'), {
  ssr: false,
  loading: () => <div className="w-full max-w-xl aspect-square bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />,
});

const AnalyticsDashboard = dynamic(() => import('@/components/rngdle-life/AnalyticsDashboard'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />,
});

export default function RngdleLifePage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans text-slate-100 flex flex-col items-center selection:bg-sky-500/30">
      <div className="max-w-6xl w-full flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm font-semibold w-fit group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 bg-clip-text text-transparent inline-block">
                RNGdle + Game of Life Simulator
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
                A 100% deterministic, PRNG-seeded Conway simulation engine with 2-way symmetry, fast-forward analytics, and Wordle-style score sharing.
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 self-start sm:self-center shadow-lg">
              <Dices size={16} className="text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Route: /projects/rngdle-life (Secret)</span>
            </div>
          </div>
        </header>

        {/* Main Simulator Layout */}
        <main className="flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <SeedControls />
          <LifeCanvas />
          <AnalyticsDashboard />
        </main>

      </div>
    </div>
  );
}
