import { NextResponse } from 'next/server';

// Server-side cache map: Key is sorted channel IDs, Value is feed items + timestamp
const feedCache = new Map<string, { videos: any[]; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
}

// Resilient individual channel fetcher
async function fetchChannelVideos(channelId: string, apiKey: string): Promise<YouTubeVideoItem[]> {
  try {
    // Step 1: Get uploads playlist ID for the channel
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelRes = await fetch(channelUrl, { next: { revalidate: 60 } });
    
    if (!channelRes.ok) {
      throw new Error(`Failed to fetch channel details (Status ${channelRes.status})`);
    }
    
    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error(`Channel not found on YouTube`);
    }

    const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      throw new Error(`Uploads playlist ID not found`);
    }

    // Step 2: Fetch latest 5 videos from uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl, { next: { revalidate: 60 } });

    if (!playlistRes.ok) {
      throw new Error(`Failed to fetch playlist items (Status ${playlistRes.status})`);
    }

    const playlistData = await playlistRes.json();
    if (!playlistData.items) {
      return [];
    }

    return playlistData.items.map((item: any) => {
      const snippet = item.snippet;
      return {
        id: snippet.resourceId?.videoId || '',
        title: snippet.title || 'Untitled',
        description: snippet.description || '',
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        channelTitle: snippet.channelTitle || 'Unknown Channel',
        channelId: snippet.channelId || channelId,
      };
    });
  } catch (err: any) {
    console.error(`[YouTube Feed Engine] Error loading channel ${channelId}:`, err.message);
    throw err; // Propagate to Promise.allSettled handler
  }
}

// Generate mock videos if API key is not configured
function generateMockVideos(channelId: string): YouTubeVideoItem[] {
  const channelNames: Record<string, string> = {
    'UC3N9i_KvKZYGs__988_0gSA': 'Next.js Official',
    'UC8butISFwT-Wl7EV0hUK0BQ': 'freeCodeCamp.org',
    'UC29ju8bIPH5as8OGnQzwJyA': 'Traversy Media',
    'UCW5YeuERMmlnqo4oq8tRG2w': 'The Primeagen',
    'UCyo8W87_29Lg4Bq4bA2jPvw': 'Fireship'
  };

  const channelName = channelNames[channelId] || `Tech Channel (${channelId.slice(-6)})`;
  const titles = [
    `Building High-Performance Apps with React 19 and Next.js`,
    `I Built a Fully Autonomous AI Agent Coder in 24 Hours`,
    `System Design: How to Scale to 10 Million Active Users`,
    `The Hidden Features of Tailwind CSS You Should Be Using`,
    `Why Senior Developers Are Quitting Their High Paying Jobs`
  ];

  const now = Date.now();
  return titles.map((title, idx) => {
    // Space out publishing times (e.g. 2 hours, 1 day, 2 days, etc. ago)
    const pubDate = new Date(now - idx * 12 * 60 * 60 * 1000);
    return {
      id: `mock-video-${channelId}-${idx}`,
      title,
      description: `In this video we explore advanced concepts regarding software engineering, focusing on web frameworks, systems, and performance tuning inside ${channelName}.`,
      thumbnail: `https://picsum.photos/seed/${channelId}-${idx}/640/360`,
      publishedAt: pubDate.toISOString(),
      channelTitle: channelName,
      channelId,
    };
  });
}

export async function POST(req: Request) {
  try {
    const { channelIds } = await req.json();

    if (!Array.isArray(channelIds) || channelIds.length === 0) {
      return NextResponse.json({ error: 'channelIds array is required' }, { status: 400 });
    }

    // Sort channel IDs to create a deterministic cache key
    const sortedIds = [...channelIds].sort();
    const cacheKey = sortedIds.join(',');

    // Check in-memory cache
    const cachedEntry = feedCache.get(cacheKey);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)) {
      return NextResponse.json({
        videos: cachedEntry.videos,
        cached: true,
        source: 'memory_cache'
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const isMockMode = !apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '';

    let aggregatedVideos: YouTubeVideoItem[] = [];
    const failedChannels: string[] = [];

    if (isMockMode) {
      // Mock Sandbox Mode
      channelIds.forEach(id => {
        aggregatedVideos.push(...generateMockVideos(id));
      });
    } else {
      // Real YouTube API Mode (concurrence with Promise.allSettled)
      const fetchPromises = channelIds.map(id => fetchChannelVideos(id, apiKey));
      const results = await Promise.allSettled(fetchPromises);

      results.forEach((result, idx) => {
        const channelId = channelIds[idx];
        if (result.status === 'fulfilled') {
          aggregatedVideos.push(...result.value);
        } else {
          failedChannels.push(channelId);
        }
      });
    }

    // Chronologically sort videos from newest to oldest
    aggregatedVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Update Cache
    feedCache.set(cacheKey, {
      videos: aggregatedVideos,
      timestamp: Date.now()
    });

    return NextResponse.json({
      videos: aggregatedVideos,
      cached: false,
      source: isMockMode ? 'sandbox_demo' : 'youtube_api',
      failedChannels: failedChannels.length > 0 ? failedChannels : undefined,
      warnings: isMockMode ? ['YOUTUBE_API_KEY environment variable is not set. Showing simulated Sandbox feeds instead.'] : undefined
    });
  } catch (error: any) {
    console.error('[YouTube Feed Engine] Root exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
