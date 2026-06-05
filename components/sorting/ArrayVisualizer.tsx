'use client';

import { useSortingStore } from '@/lib/store/useSortingStore';

export default function ArrayVisualizer() {
  const { dataArray, comparing, swapping, sorted } = useSortingStore();

  const maxVal = Math.max(...dataArray, 100);

  return (
    <div className="flex items-end justify-center w-full h-[50vh] gap-[2px] p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      {dataArray.map((value, idx) => {
        let color = 'bg-blue-500/80'; // Default bar color
        
        if (sorted.includes(idx)) {
          color = 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
        } else if (swapping && (idx === swapping[0] || idx === swapping[1])) {
          color = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
        } else if (comparing && (idx === comparing[0] || idx === comparing[1])) {
          color = 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]';
        }

        return (
          <div
            key={idx}
            className={`w-full rounded-t-sm transition-all duration-100 ${color}`}
            style={{ height: `${Math.max(2, (value / maxVal) * 100)}%` }}
          />
        );
      })}
    </div>
  );
}
