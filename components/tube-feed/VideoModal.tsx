'use client';

import React, { useEffect } from 'react';
import { X, Tv, Share2, ExternalLink } from 'lucide-react';
import { Video } from './VideoGrid';

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (video) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [video]);

  if (!video) return null;

  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&modestbranding=1&rel=0`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 md:p-10 animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col gap-4 p-4 md:p-5 relative animate-in zoom-in-95 duration-200"
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div className="flex flex-col gap-0.5 max-w-[85%]">
            <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
              {video.channelTitle}
            </span>
            <h2 className="text-xs font-bold text-slate-100 truncate" title={video.title}>
              {video.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theater Viewport (Iframe Embed) */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-slate-950">
          <iframe
            src={embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Info & External Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1 text-[11px] text-slate-400">
          <p className="line-clamp-2 max-w-xl text-slate-500 leading-relaxed italic pr-2">
            {video.description || 'No description provided.'}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            {/* YouTube Direct Link */}
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:text-slate-100 transition-all font-semibold"
            >
              <Tv className="w-3.5 h-3.5 text-rose-500" />
              Watch on YouTube
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
