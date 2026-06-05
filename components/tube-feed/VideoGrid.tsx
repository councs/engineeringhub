'use client';

import React from 'react';
import { Play, Calendar, AlertCircle, Tv } from 'lucide-react';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
}

interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  onSelectVideo: (video: Video) => void;
  isSandboxMode?: boolean;
  warnings?: string[];
  failedChannelsCount?: number;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
}

export default function VideoGrid({
  videos,
  isLoading,
  onSelectVideo,
  isSandboxMode = false,
  warnings = [],
  failedChannelsCount = 0
}: VideoGridProps) {
  
  if (isLoading) {
    // Shimmer Skeleton Loader
    return (
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden animate-pulse flex flex-col gap-4 p-4">
              <div className="bg-slate-800 aspect-video rounded-lg w-full" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-855 rounded w-1/2" />
              <div className="h-3 bg-slate-855 rounded w-1/4 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-5 h-full">
      {/* Sandbox Demo Warning Banner */}
      {isSandboxMode && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-xs text-indigo-300 leading-normal">
            <span className="font-bold">Sandbox Mode:</span> YOUTUBE_API_KEY environment variable is not configured. Displaying high-fidelity mock video uploads for demonstration.
          </div>
        </div>
      )}

      {/* Warnings & Failed channel indicator */}
      {failedChannelsCount > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-xs text-rose-300 leading-normal">
            <span className="font-bold">Sync Warning:</span> Resilient feed engine loaded, but failed to fetch uploads for {failedChannelsCount} channel(s) in this category. (Check sidebar for channel status)
          </div>
        </div>
      )}

      {/* Main Grid View */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="group bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col cursor-pointer hover:shadow-indigo-500/5 hover:-translate-y-0.5"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden w-full">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Play Button Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3.5 rounded-full bg-indigo-600/90 text-white shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                </div>
              </div>

              {/* Text Meta Info */}
              <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
                    {video.channelTitle}
                  </span>
                  <h3 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors" title={video.title}>
                    {video.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatRelativeTime(video.publishedAt)}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850">
                    YouTube Embed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl py-20 p-6 bg-slate-950/10">
          <Tv className="w-12 h-12 text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-350">Chronological Feed Empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm text-center leading-relaxed">
            Ensure this category contains valid YouTube Channel IDs. Add channels in the sidebar panel to compile a unified feed.
          </p>
        </div>
      )}
    </div>
  );
}
