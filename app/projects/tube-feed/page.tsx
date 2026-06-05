'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar, { Category } from '@/components/tube-feed/Sidebar';
import VideoGrid, { Video } from '@/components/tube-feed/VideoGrid';
import VideoModal from '@/components/tube-feed/VideoModal';
import { ArrowLeft, Tv, Compass, Zap } from 'lucide-react';

export default function TubeFeedPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [failedChannelIds, setFailedChannelIds] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Trigger API fetch when selected category channels update
  useEffect(() => {
    if (!selectedCategory) {
      setVideos([]);
      setIsSandboxMode(false);
      setFailedChannelIds([]);
      setWarnings([]);
      return;
    }

    const channelIds = selectedCategory.channels.map(ch => ch.id);
    if (channelIds.length === 0) {
      setVideos([]);
      setIsSandboxMode(false);
      setFailedChannelIds([]);
      setWarnings([]);
      return;
    }

    let isSubscribed = true;

    async function fetchAggregatedFeed() {
      setIsLoading(true);
      setFailedChannelIds([]);
      setWarnings([]);

      try {
        const response = await fetch('/api/youtube/fetch-feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelIds })
        });

        if (!response.ok) {
          throw new Error('API server response failed');
        }

        const data = await response.json();
        
        if (isSubscribed) {
          setVideos(data.videos || []);
          setIsSandboxMode(data.source === 'sandbox_demo');
          setFailedChannelIds(data.failedChannels || []);
          setWarnings(data.warnings || []);
        }
      } catch (err) {
        console.error('[YouTube Feed Page] Fetch failed:', err);
        if (isSubscribed) {
          setVideos([]);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    fetchAggregatedFeed();

    return () => {
      isSubscribed = false;
    };
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased h-screen overflow-hidden">
      
      {/* Top Navigation Header */}
      <header className="bg-slate-900/40 backdrop-blur border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-rose-500" />
              <h1 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-wide">
                YouTube Feed Aggregator
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Combine your favorite channel uploads into clean, custom chronological streams
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/60 text-slate-350">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Feed compiler: Resilient</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/60 text-indigo-400">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span>15m Cache TTL</span>
          </div>
        </div>
      </header>

      {/* Main Aggregator Panel Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: CRUD Categories & Channels */}
        <Sidebar
          selectedCategoryId={selectedCategory?.id || null}
          onSelectCategory={setSelectedCategory}
          feedWarnings={warnings}
          failedChannelIds={failedChannelIds}
        />

        {/* Right Side: Consolidated Feed Grid */}
        <VideoGrid
          videos={videos}
          isLoading={isLoading}
          onSelectVideo={setSelectedVideo}
          isSandboxMode={isSandboxMode}
          warnings={warnings}
          failedChannelsCount={failedChannelIds.length}
        />
      </div>

      {/* Pop-up Video Theater Embed Modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </main>
  );
}
