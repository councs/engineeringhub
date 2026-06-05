import Link from 'next/link';
import { ArrowRight, Activity, Swords, Cpu, Film, TrendingUp, Gamepad2 } from 'lucide-react';

export const metadata = {
  title: 'Engineering Demonstrations Hub',
  description: 'A central hub for multiple engineering demonstrations.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-24">
      <div className="max-w-7xl w-full space-y-12">
        
        <div className="space-y-6 text-center">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-100">
            Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Hub</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A collection of interactive demonstrations showcasing advanced software engineering concepts, state management, and algorithmic performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/projects/sorting" className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:bg-slate-900 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col gap-4 overflow-hidden">
            <div className="absolute -top-6 -right-6 p-8 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
              <Activity size={160} strokeWidth={1} />
            </div>
            
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
              <Activity size={24} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100">Sorting Visualizer</h2>
            <p className="text-slate-400 relative z-10 flex-grow leading-relaxed">
              Explore how different sorting algorithms operate on data in real-time. Built with Next.js, Zustand, and TypeScript Generators to ensure a lag-free 60FPS experience.
            </p>
            
            <div className="flex items-center text-blue-400 font-semibold mt-4 gap-2 group-hover:gap-3 transition-all">
              Launch Demonstration <ArrowRight size={18} />
            </div>
          </Link>

          <Link href="/projects/rps-3d" className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:bg-slate-900 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col gap-4 overflow-hidden">
            <div className="absolute -top-6 -right-6 p-8 text-rose-500 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
              <Swords size={160} strokeWidth={1} />
            </div>
            
            <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
              <Swords size={24} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100">Rock Paper Scissors</h2>
            <p className="text-slate-400 relative z-10 flex-grow leading-relaxed">
              Watch a 2D or 3D battle simulation of Rock, Paper, Scissors entities chasing prey and fleeing predators in a bounded environment.
            </p>
            
            <div className="flex items-center text-rose-400 font-semibold mt-4 gap-2 group-hover:gap-3 transition-all">
              Launch Simulation <ArrowRight size={18} />
            </div>
          </Link>

          <Link href="/projects/digital-twin" className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:bg-slate-900 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col gap-4 overflow-hidden">
            <div className="absolute -top-6 -right-6 p-8 text-indigo-500 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
              <Cpu size={160} strokeWidth={1} />
            </div>
            
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
              <Cpu size={24} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100">SCADA Digital Twin</h2>
            <p className="text-slate-400 relative z-10 flex-grow leading-relaxed">
              A 3D industrial mixing vessel simulation showing real-time telemetry, direct-DOM subscription optimizations, alarms, and HMI control overrides.
            </p>
            
            <div className="flex items-center text-indigo-400 font-semibold mt-4 gap-2 group-hover:gap-3 transition-all">
              Launch Digital Twin <ArrowRight size={18} />
            </div>
          </Link>

          <Link href="/projects/tube-feed" className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:bg-slate-900 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col gap-4 overflow-hidden">
            <div className="absolute -top-6 -right-6 p-8 text-amber-500 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
              <Film size={160} strokeWidth={1} />
            </div>
            
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <Film size={24} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100">YouTube Feed Aggregator</h2>
            <p className="text-slate-400 relative z-10 flex-grow leading-relaxed">
              Combine your favorite channel uploads into custom categorized streams with 15m server caching, Promise resiliency, and a distraction-free player.
            </p>
            
            <div className="flex items-center text-amber-400 font-semibold mt-4 gap-2 group-hover:gap-3 transition-all">
              Launch Aggregator <ArrowRight size={18} />
            </div>
          </Link>

          <Link href="/projects/market-time-machine" className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:bg-slate-900 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col gap-4 overflow-hidden">
            <div className="absolute -top-6 -right-6 p-8 text-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
              <TrendingUp size={160} strokeWidth={1} />
            </div>
            
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <TrendingUp size={24} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100">Market Time Machine</h2>
            <p className="text-slate-400 relative z-10 flex-grow leading-relaxed">
              Look at historical time-series snapshots and news feeds, predict if the stock went UP or DOWN, and view the animated outcome.
            </p>
            
            <div className="flex items-center text-emerald-400 font-semibold mt-4 gap-2 group-hover:gap-3 transition-all">
              Launch Machine <ArrowRight size={18} />
            </div>
          </Link>

          <Link href="/projects/chess" className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:bg-slate-900 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col gap-4 overflow-hidden">
            <div className="absolute -top-6 -right-6 p-8 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
              <Gamepad2 size={160} strokeWidth={1} />
            </div>
            
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
              <Gamepad2 size={24} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100">Chess AI Simulator</h2>
            <p className="text-slate-400 relative z-10 flex-grow leading-relaxed">
              Play a fully responsive chess match against a local Minimax AI engine with real-time advantage evaluations and captured piece counts.
            </p>
            
            <div className="flex items-center text-blue-400 font-semibold mt-4 gap-2 group-hover:gap-3 transition-all">
              Launch Simulator <ArrowRight size={18} />
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}

