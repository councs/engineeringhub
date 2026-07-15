'use client';

import Link from 'next/link';
import { ArrowLeft, Network } from 'lucide-react';
import dynamic from 'next/dynamic';

const SynergyGraph = dynamic(() => import('@/components/zzz-synergy/SynergyGraph'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[75vh] animate-pulse">
      <div className="w-full xl:w-72 bg-slate-900 border border-slate-800 rounded-xl h-96 xl:h-auto" />
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl h-full" />
    </div>
  )
});

export default function ZzzSynergyPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans text-slate-100 flex flex-col items-center selection:bg-yellow-500/30">
      <div className="max-w-7xl w-full flex flex-col gap-10">
        
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
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent inline-block">
                Zenless Zone Zero Synergy Graph
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
                An interactive graph database demonstrating state-managed connection mapping and dynamic node dragging.
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 self-start sm:self-center">
              <Network size={14} className="text-yellow-400 animate-pulse" />
              <span>Route: /projects/zzz-synergy (Hidden)</span>
            </div>
          </div>
        </header>

        <main className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <SynergyGraph />
        </main>

      </div>
    </div>
  );
}
