'use client';

import React from 'react';
import { Newspaper, Bell } from 'lucide-react';

interface NewsFeedProps {
  headlines: string[];
  obfuscatedName: string;
  dateRangeText: string;
}

export default function NewsFeed({ headlines, obfuscatedName, dateRangeText }: NewsFeedProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-100 uppercase tracking-wider text-sm">
            Terminal News Feed
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          {dateRangeText}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        {headlines.map((headline, idx) => (
          <div
            key={idx}
            className="flex gap-4 p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 hover:bg-slate-950/80 transition-all duration-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mt-0.5">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wide">
                  FLASH NEWS
                </span>
                <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 px-1 rounded font-semibold uppercase">
                  {obfuscatedName}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {headline}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
