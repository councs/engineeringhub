'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTelemetryStore } from '@/lib/store/useTelemetryStore';
import ControlPanel from '@/components/digital-twin/ControlPanel';
import DashboardMetrics from '@/components/digital-twin/DashboardMetrics';
import { ArrowLeft, Activity, Radio, Database } from 'lucide-react';

// Dynamically import the 3D Twin Canvas with SSR disabled to prevent hydration mismatch
const TwinCanvas = dynamic(() => import('@/components/digital-twin/TwinCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] md:min-h-[450px] bg-[#020617] flex flex-col items-center justify-center border border-slate-800 rounded-xl">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-xs font-semibold text-slate-400 tracking-wider">Loading 3D Scene Assembly...</span>
    </div>
  )
});

export default function DigitalTwinPage() {
  const tick = useTelemetryStore((s) => s.tick);

  useEffect(() => {
    // High-frequency telemetry update tick every 500ms
    const timer = setInterval(() => {
      tick();
    }, 500);

    return () => clearInterval(timer);
  }, [tick]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top SCADA Navigation Header */}
      <header className="bg-slate-900/40 backdrop-blur border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h1 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-wide">
                Industrial Digital Twin
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Vessel #MX-402 SCADA Telemetry & Control Center
            </p>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/60 text-slate-300">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>IoT Hub: Connected</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/60 text-emerald-400">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-ping" style={{ animationDuration: '3s' }} />
            <span>500ms Stream</span>
          </div>
        </div>
      </header>

      {/* SCADA Main Dashboard Grid */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Panel: Detailed metrics & gauges console (Spans 4/12) */}
        <section className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          <DashboardMetrics />
        </section>

        {/* Center Panel: 3D Twin Viewport (Spans 5/12) */}
        <section className="lg:col-span-5 flex flex-col bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden shadow-2xl order-1 lg:order-2">
          <div className="flex-1 relative w-full h-full">
            <TwinCanvas />
          </div>
        </section>

        {/* Right Panel: HMI Safety Interlocks & Settings Override (Spans 3/12) */}
        <section className="lg:col-span-3 flex flex-col gap-6 order-3">
          <ControlPanel />
        </section>
      </div>
    </main>
  );
}
