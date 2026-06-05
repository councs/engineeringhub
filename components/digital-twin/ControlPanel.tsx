'use client';

import React from 'react';
import { useTelemetryStore } from '@/lib/store/useTelemetryStore';
import { ShieldAlert, Wind, Cpu, RefreshCw, ToggleLeft, ToggleRight, PlusCircle, Trash2, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

export default function ControlPanel() {
  const {
    simulationMode,
    transferActive,
    valveOpen,
    sourceDrainActive,
    productDrainActive,
    sourceFill,
    currentStep,
    setSimulationMode,
    toggleValve,
    toggleTransfer,
    toggleSourceDrain,
    toggleProductDrain,
    topUpSource,
    triggerEmergencyStop,
    triggerVentValve,
    nextStep,
    prevStep,
    resetSequence
  } = useTelemetryStore();

  const stepNames = ['1. Standby', '2. Fill Tank A', '3. Transfer', '4. Discharge'];

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 flex flex-col gap-4.5 shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          HMI Control Panel
        </h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
          simulationMode === 'automated' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {simulationMode}
        </span>
      </div>

      {/* Batch Stepper Progress Bar */}
      <div className="flex flex-col gap-2 bg-slate-950 border border-slate-900 p-3 rounded-lg">
        <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
          <span>Batch Sequence Phase</span>
          <span className="font-mono text-indigo-400">Step {currentStep + 1} of 4</span>
        </div>
        
        {/* Stepper visual dots */}
        <div className="grid grid-cols-4 gap-1.5 my-1">
          {stepNames.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-355 ${
                idx === currentStep
                  ? 'bg-indigo-500 shadow shadow-indigo-600/50'
                  : idx < currentStep
                  ? 'bg-emerald-600'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        
        {/* Current phase name text */}
        <div className="text-xs font-bold text-slate-100 text-center py-1 bg-slate-900/60 border border-slate-900 rounded mt-1.5 tracking-wide">
          {stepNames[currentStep]}
        </div>

        {/* Phase navigation buttons */}
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <button
            onClick={prevStep}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-3 h-3" />
            Prev
          </button>
          <button
            onClick={resetSequence}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-semibold text-slate-350 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-indigo-400" />
            Reset
          </button>
          <button
            onClick={nextStep}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-[10px] font-semibold text-white shadow shadow-indigo-900/30 transition-all active:scale-95"
          >
            Next
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mode Selector Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
        <button
          onClick={() => setSimulationMode('automated')}
          className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 ${
            simulationMode === 'automated'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Automated Loop
        </button>
        <button
          onClick={() => setSimulationMode('manual')}
          className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 ${
            simulationMode === 'manual'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Manual Override
        </button>
      </div>

      {/* Transfer Pump & Valve Control Block */}
      <div className="flex flex-col gap-2.5 bg-slate-950/40 border border-slate-850 p-3 rounded-lg">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pump & Flow Control</span>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Pump Trigger */}
          <button
            onClick={toggleTransfer}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-bold text-xs uppercase transition-all duration-200 border ${
              transferActive
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${transferActive ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            {transferActive ? 'Pump On' : 'Pump Off'}
          </button>

          {/* DSV Valve Trigger */}
          <button
            onClick={toggleValve}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-bold text-xs uppercase transition-all duration-200 border ${
              valveOpen
                ? 'bg-indigo-950/80 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900'
                : 'bg-red-950/80 border-red-500/30 text-red-300 hover:bg-red-900'
            }`}
          >
            {valveOpen ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
            {valveOpen ? 'Valve Open' : 'Valve Close'}
          </button>
        </div>
      </div>

      {/* Tank Level & Drain Controls */}
      <div className="flex flex-col gap-3 bg-slate-950/40 border border-slate-850 p-3 rounded-lg">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Levels & Drains</span>
        
        {/* Top up Source */}
        <button
          onClick={topUpSource}
          disabled={sourceFill >= 100}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <PlusCircle className="w-4 h-4 text-indigo-400" />
          Top Up Tank A (+20%)
        </button>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Drain Source Toggle */}
          <button
            onClick={toggleSourceDrain}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border transition-all ${
              sourceDrainActive
                ? 'bg-amber-950/80 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-350'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Drain Tank A
          </button>

          {/* Drain Product Toggle */}
          <button
            onClick={toggleProductDrain}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border transition-all ${
              productDrainActive
                ? 'bg-amber-950/80 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-350'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Drain Tank B
          </button>
        </div>
      </div>

      {/* Safety Interlocks */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency & Safety</span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={triggerVentValve}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-bold text-xs uppercase border border-sky-500/20 text-sky-400 hover:text-sky-300 bg-slate-900 hover:bg-slate-850 active:scale-95 transition-all duration-200"
          >
            <Wind className="w-3.5 h-3.5" />
            Vent Line
          </button>

          <button
            onClick={triggerEmergencyStop}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-bold text-xs uppercase border border-red-500/30 text-red-200 hover:text-white bg-red-950/70 hover:bg-red-900 active:scale-95 transition-all duration-200 animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            E-STOP
          </button>
        </div>
      </div>
    </div>
  );
}
