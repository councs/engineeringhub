'use client';

import React, { useEffect, useRef } from 'react';
import { useTelemetryStore } from '@/lib/store/useTelemetryStore';
import { Thermometer, Gauge, Container, Terminal, ToggleRight, Settings } from 'lucide-react';

export default function DashboardMetrics() {
  const tempRef = useRef<HTMLSpanElement>(null);
  const pressureRef = useRef<HTMLSpanElement>(null);
  const fillARef = useRef<HTMLSpanElement>(null);
  const fillBRef = useRef<HTMLSpanElement>(null);

  const tempBarRef = useRef<HTMLDivElement>(null);
  const pressureBarRef = useRef<HTMLDivElement>(null);
  const fillABarRef = useRef<HTMLDivElement>(null);
  const fillBBarRef = useRef<HTMLDivElement>(null);

  const pressureCardRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const valveStatusRef = useRef<HTMLSpanElement>(null);
  const pumpStatusRef = useRef<HTMLSpanElement>(null);

  const deadheadWarningRef = useRef<HTMLDivElement>(null);
  const dryRunWarningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDOM = (state: ReturnType<typeof useTelemetryStore.getState>) => {
      // 1. Temperature Card
      if (tempRef.current) {
        tempRef.current.innerText = `${state.temperature.toFixed(1)} °C`;
      }
      if (tempBarRef.current) {
        tempBarRef.current.style.width = `${Math.min(100, (state.temperature / 250) * 100)}%`;
        if (state.temperature > 200) {
          tempBarRef.current.style.backgroundColor = '#f43f5e'; // Rose-500
        } else if (state.temperature > 185 || state.temperature < 140) {
          tempBarRef.current.style.backgroundColor = '#f59e0b'; // Amber-500
        } else {
          tempBarRef.current.style.backgroundColor = '#10b981'; // Emerald-500
        }
      }

      // 2. Pressure Card
      if (pressureRef.current) {
        pressureRef.current.innerText = `${state.pressure.toFixed(1)} PSI`;
      }
      if (pressureBarRef.current) {
        pressureBarRef.current.style.width = `${Math.min(100, (state.pressure / 90) * 100)}%`;
        if (state.pressure > 60.0) {
          pressureBarRef.current.style.backgroundColor = '#f43f5e'; // Rose-500
        } else if (state.pressure > 48.0) {
          pressureBarRef.current.style.backgroundColor = '#f59e0b'; // Amber-500
        } else {
          pressureBarRef.current.style.backgroundColor = '#10b981'; // Emerald-500
        }
      }
      if (pressureCardRef.current) {
        if (state.pressure > 60.0) {
          pressureCardRef.current.className = 'p-4 rounded-xl bg-slate-950 border border-red-500/40 shadow-lg shadow-red-950/20 transition-all duration-300 animate-pulse';
        } else if (state.pressure > 48.0) {
          pressureCardRef.current.className = 'p-4 rounded-xl bg-slate-950 border border-amber-500/40 shadow-lg shadow-amber-950/10 transition-all duration-300';
        } else {
          pressureCardRef.current.className = 'p-4 rounded-xl bg-slate-950 border border-slate-800 transition-all duration-300';
        }
      }

      // 3. Tank A Fill Level Card
      if (fillARef.current) {
        fillARef.current.innerText = `${state.sourceFill.toFixed(1)}%`;
      }
      if (fillABarRef.current) {
        fillABarRef.current.style.width = `${state.sourceFill}%`;
        if (state.sourceFill < 10) {
          fillABarRef.current.style.backgroundColor = '#f43f5e';
        } else {
          fillABarRef.current.style.backgroundColor = '#3b82f6'; // Blue-500
        }
      }

      // 4. Tank B Fill Level Card
      if (fillBRef.current) {
        fillBRef.current.innerText = `${state.productFill.toFixed(1)}%`;
      }
      if (fillBBarRef.current) {
        fillBBarRef.current.style.width = `${state.productFill}%`;
        if (state.productFill > 90) {
          fillBBarRef.current.style.backgroundColor = '#f43f5e';
        } else {
          fillBBarRef.current.style.backgroundColor = '#818cf8'; // Indigo-400
        }
      }

      // Status Labels
      if (valveStatusRef.current) {
        if (state.valveOpen) {
          valveStatusRef.current.innerText = 'VALVE OPEN (FLOW ENABLED)';
          valveStatusRef.current.className = 'text-[9px] font-bold text-emerald-400';
        } else {
          valveStatusRef.current.innerText = 'VALVE CLOSED (FLOW BLOCKED)';
          valveStatusRef.current.className = 'text-[9px] font-bold text-rose-400 animate-pulse';
        }
      }
      if (pumpStatusRef.current) {
        if (state.transferActive) {
          pumpStatusRef.current.innerText = 'PUMP RUNNING (ACTIVE TRANSFER)';
          pumpStatusRef.current.className = 'text-[9px] font-bold text-emerald-400';
        } else {
          pumpStatusRef.current.innerText = 'PUMP IDLE (STANDBY)';
          pumpStatusRef.current.className = 'text-[9px] font-bold text-slate-450';
        }
      }

      // Warnings
      if (deadheadWarningRef.current) {
        deadheadWarningRef.current.style.display = state.deadheadWarning ? 'block' : 'none';
      }
      if (dryRunWarningRef.current) {
        dryRunWarningRef.current.style.display = state.dryRunWarning ? 'block' : 'none';
      }

      // 5. System Logs
      if (logsContainerRef.current) {
        const prevLen = parseInt(logsContainerRef.current.getAttribute('data-len') || '0', 10);
        if (state.systemLogs.length !== prevLen) {
          logsContainerRef.current.setAttribute('data-len', state.systemLogs.length.toString());
          logsContainerRef.current.innerHTML = state.systemLogs
            .map((log: string) => {
              let colorClass = 'text-slate-400';
              if (log.includes('🚨') || log.includes('ALARM') || log.includes('critical') || log.includes('interlock')) {
                colorClass = 'text-rose-400 font-bold';
              } else if (log.includes('⚠️') || log.includes('WARNING') || log.includes('STOP')) {
                colorClass = 'text-amber-400 font-semibold';
              } else if (log.includes('💨') || log.includes('Vent') || log.includes('vent')) {
                colorClass = 'text-sky-400';
              } else if (log.includes('manual') || log.includes('changed') || log.includes('Valve manual')) {
                colorClass = 'text-indigo-400';
              } else if (log.includes('complete') || log.includes('stopped')) {
                colorClass = 'text-emerald-400';
              }
              return `<div class="py-1 border-b border-slate-900/60 last:border-0 text-[11px] font-mono leading-relaxed ${colorClass}">${log}</div>`;
            })
            .join('');
          
          // Scroll to bottom
          logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
      }
    };

    // Initial paint
    const initialState = useTelemetryStore.getState();
    updateDOM(initialState);

    // Subscribe to Zustand updates
    const unsubscribe = useTelemetryStore.subscribe((state) => {
      updateDOM(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Status Indicators banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold pb-1.5 border-b border-slate-900">
          <span>Equipment Status</span>
          <Settings className="w-3 h-3 text-slate-500" />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">DSV Valve:</span>
          <span ref={valveStatusRef} className="text-slate-400">--</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Transfer Pump:</span>
          <span ref={pumpStatusRef} className="text-slate-400">--</span>
        </div>

        {/* Deadhead Warning Alert Banner */}
        <div
          ref={deadheadWarningRef}
          style={{ display: 'none' }}
          className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-rose-400 text-[11px] font-bold tracking-wide mt-2 animate-pulse"
        >
          ⚠️ PUMP DEAD-HEAD DETECTED: OPEN DSV VALVE OR CLOSE PUMP IMMEDIATELY!
        </div>

        {/* Dry Run Warning Alert Banner */}
        <div
          ref={dryRunWarningRef}
          style={{ display: 'none' }}
          className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg text-amber-400 text-[11px] font-bold tracking-wide mt-2 animate-pulse"
        >
          ⚠️ DRY PUMP DETECTED: SOURCE TANK A EMPTY. REFILL TO RESUME TRANSFER.
        </div>
      </div>

      {/* 2x2 Grid of Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Temp Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Temp</span>
            <Thermometer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span ref={tempRef} className="text-2xl font-bold font-mono text-slate-100">-- °C</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
            <div ref={tempBarRef} className="h-full bg-emerald-500 transition-all duration-300" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Pressure Card */}
        <div ref={pressureCardRef} className="p-4 rounded-xl bg-slate-950 border border-slate-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Pressure</span>
            <Gauge className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span ref={pressureRef} className="text-2xl font-bold font-mono text-slate-100">-- PSI</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
            <div ref={pressureBarRef} className="h-full bg-sky-500 transition-all duration-300" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Vessel A Level Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vessel A Level (Source)</span>
            <Container className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span ref={fillARef} className="text-2xl font-bold font-mono text-slate-100">--%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
            <div ref={fillABarRef} className="h-full bg-blue-500 transition-all duration-300" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Vessel B Level Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vessel B Level (Product)</span>
            <Container className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span ref={fillBRef} className="text-2xl font-bold font-mono text-slate-100">--%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
            <div ref={fillBBarRef} className="h-full bg-indigo-400 transition-all duration-300" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      {/* Live SCADA Console Log */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live System Console</span>
        </div>
        <div 
          ref={logsContainerRef} 
          className="h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          data-len="0"
        />
      </div>
    </div>
  );
}
