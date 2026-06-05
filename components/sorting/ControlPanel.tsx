'use client';

import { useSortingStore } from '@/lib/store/useSortingStore';
import { algorithms } from '@/lib/engine/sorting';
import { Play, Pause, RotateCcw, Shuffle, Volume2, VolumeX } from 'lucide-react';

export default function ControlPanel() {
  const { 
    isPlaying, 
    play, 
    pause, 
    generateNewArray, 
    speed, 
    setSpeed,
    algorithm,
    setAlgorithm,
    reset,
    comparisons,
    accesses,
    arraySize,
    setArraySize,
    volume,
    setVolume,
    isMuted,
    toggleMute
  } = useSortingStore();

  // Speed is a delay in ms (e.g. 10 to 500). We map it to a 1-100 scale for the slider.
  // Delay 500 = Slider 1 (Slowest)
  // Delay 5 = Slider 100 (Fastest)
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderVal = Number(e.target.value);
    const minDelay = 5;
    const maxDelay = 500;
    // Map slider 1-100 to delay 500-5
    const mappedDelay = maxDelay - ((sliderVal - 1) / 99) * (maxDelay - minDelay);
    setSpeed(mappedDelay);
  };

  const currentSliderValue = Math.round(1 + ((500 - speed) / 495) * 99);

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-xl w-full text-slate-200 border border-slate-800 shadow-xl">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => isPlaying ? pause() : play()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] w-32"
          >
            {isPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play</>}
          </button>
          <button 
            onClick={() => reset()}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border border-slate-700 hover:border-slate-600"
          >
            <RotateCcw size={18} /> Reset
          </button>
          <button 
            onClick={() => generateNewArray()}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border border-slate-700 hover:border-slate-600"
          >
            <Shuffle size={18} /> Randomize
          </button>
        </div>

        {/* Settings */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center xl:justify-end gap-6 xl:ml-auto w-full xl:w-auto">
          {/* Algorithm Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Algorithm</label>
            <select 
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={isPlaying}
              className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-48 shadow-inner"
            >
              {Object.keys(algorithms).map(algo => (
                <option key={algo} value={algo}>{algo}</option>
              ))}
            </select>
          </div>

          {/* Speed Slider */}
          <div className="flex items-center gap-4 w-full sm:w-64">
            <label className="text-sm font-semibold text-slate-400 tracking-wide uppercase w-12">Speed</label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              step="1"
              value={currentSliderValue}
              onChange={handleSpeedChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Array Size Slider */}
          <div className="flex items-center gap-4 w-full sm:w-64">
            <label className="text-sm font-semibold text-slate-400 tracking-wide uppercase w-20">Size ({arraySize})</label>
            <input 
              type="range" 
              min="4" 
              max={algorithm === 'Bogo Sort' ? '8' : '150'} 
              step="1"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isPlaying}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto 2xl:border-l 2xl:border-slate-800 2xl:pl-6">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) toggleMute();
              }}
              className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              title="Volume"
            />
          </div>
        </div>
      </div>

      {algorithm === 'Bogo Sort' && (
        <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg flex items-center gap-2">
          <span>⚠️ <strong>Bogo Sort safety cap:</strong> Array size is capped at 8. With a complexity of O(n × n!), larger sizes will cause the page to freeze or take millions of shuffles.</span>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-10 border-t border-slate-800 pt-5 mt-2">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Comparisons</span>
          <span className="text-3xl font-mono text-amber-400 font-light tabular-nums leading-none">{comparisons}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Array Accesses</span>
          <span className="text-3xl font-mono text-purple-400 font-light tabular-nums leading-none">{accesses}</span>
        </div>
      </div>
    </div>
  );
}
