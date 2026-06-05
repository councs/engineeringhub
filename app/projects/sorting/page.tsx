'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ArrayVisualizer from '@/components/sorting/ArrayVisualizer';
import ControlPanel from '@/components/sorting/ControlPanel';
import { useSortingStore } from '@/lib/store/useSortingStore';
import { algorithms } from '@/lib/engine/sorting';
import { playSortSound } from '@/lib/utils/audio';

export default function SortingVisualizerPage() {
  const { 
    dataArray, 
    isPlaying, 
    algorithm, 
    speed, 
    updateStateFromEngine,
    setFinished,
    setSweeping,
    setSorted,
    volume,
    isMuted
  } = useSortingStore();

  // We use refs to avoid dependency cycle in the requestAnimationFrame loop
  const generatorRef = useRef<any>(null);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const triggerVictorySweep = (arrayToSweep: number[]) => {
    setSweeping(true);
    setSorted([]);
    
    let currentIdx = 0;
    const n = arrayToSweep.length;
    // Total sweep duration target of 800ms, with a safety cap between 8ms and 150ms per step
    const delay = Math.min(150, Math.max(8, 800 / n));
    const maxVal = Math.max(...arrayToSweep, 100);

    const sweepStep = () => {
      // If sweep was cancelled (e.g. user clicked reset or randomize), stop the animation
      if (!useSortingStore.getState().isSweeping) return;

      if (currentIdx < n) {
        setSorted(Array.from({ length: currentIdx + 1 }, (_, i) => i));
        
        const val = arrayToSweep[currentIdx];
        playSortSound(val, maxVal, volumeRef.current, isMutedRef.current);
        
        currentIdx++;
        setTimeout(sweepStep, delay);
      } else {
        setSweeping(false);
        setFinished(true);
      }
    };

    sweepStep();
  };

  useEffect(() => {
    if (isPlaying) {
      if (!generatorRef.current) {
        const algoFn = algorithms[algorithm];
        if (algoFn) {
          generatorRef.current = algoFn([...dataArray]);
        }
      }

      const runStep = () => {
        if (!isPlayingRef.current) return;

        if (generatorRef.current) {
          const result = generatorRef.current.next();
          
          if (!result.done && result.value) {
            updateStateFromEngine(result.value);
            
            // Play retro sorting tone based on element values
            const step = result.value;
            if (step.comparing) {
              const idx = step.comparing[0];
              const val = step.array[idx];
              playSortSound(val, 105, volumeRef.current, isMutedRef.current);
            } else if (step.swapping) {
              const idx = step.swapping[0];
              const val = step.array[idx];
              playSortSound(val, 105, volumeRef.current, isMutedRef.current);
            }
            
            // Re-schedule
            timeoutRef.current = setTimeout(() => {
              requestAnimationFrame(runStep);
            }, speedRef.current);
          } else {
            // Algorithm finished
            const finalArray = useSortingStore.getState().dataArray;
            generatorRef.current = null;
            triggerVictorySweep(finalArray);
          }
        }
      };

      runStep();

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [isPlaying, algorithm]);

  // Reset generator if array changes manually
  const prevDataArrayRef = useRef(dataArray);
  useEffect(() => {
    if (!isPlaying && dataArray !== prevDataArrayRef.current) {
      generatorRef.current = null;
    }
    prevDataArrayRef.current = dataArray;
  }, [dataArray, isPlaying]);


  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans text-slate-100 flex flex-col items-center selection:bg-blue-500/30">
      <div className="max-w-6xl w-full flex flex-col gap-10">
        
        <header className="flex flex-col gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm font-semibold w-fit group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent inline-block">
              Sorting Visualizer
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
              A high-performance demonstration of enterprise-level state management and generator-based algorithms.
            </p>
          </div>
        </header>

        <main className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <ArrayVisualizer />
          <ControlPanel />
        </main>

      </div>
    </div>
  );
}
