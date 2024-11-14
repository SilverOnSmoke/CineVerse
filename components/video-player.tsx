'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ServerSelect } from '@/components/server-select';
import { EpisodeGrid } from '@/components/episode-grid';
import type { TVShowDetails, TVShowSeason } from '@/types/tmdb';

interface VideoPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  show?: TVShowDetails;
  initialSeason?: TVShowSeason;
}

const PROVIDERS = {
  EMBED_SU: 'embed.su',
  VIDLINK: 'vidlink.pro',
} as const;

export function VideoPlayer({ tmdbId, type, season, episode, show, initialSeason }: VideoPlayerProps) {
  const [currentProvider, setCurrentProvider] = useState<keyof typeof PROVIDERS>('EMBED_SU');
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  const getVideoUrl = () => {
    if (currentProvider === 'EMBED_SU') {
      return type === 'movie'
        ? `https://embed.su/embed/movie/${tmdbId}`
        : `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
    } else {
      return type === 'movie'
        ? `https://vidlink.pro/movie/${tmdbId}`
        : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
    }
  };

  const handleError = () => {
    if (currentProvider === 'EMBED_SU') {
      setCurrentProvider('VIDLINK');
      toast({
        title: "Switching Server",
        description: "Trying alternative server...",
      });
    } else {
      setHasError(true);
      toast({
        title: "Content Unavailable",
        description: "We&apos;re sorry, but this content is temporarily unavailable. Please try again later or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6">
          <h2 className="text-2xl font-bold">Content Unavailable</h2>
          <p className="text-muted-foreground">
            We&apos;re sorry, but this content is temporarily unavailable.<br />
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Video Container - updated with max height */}
      <div className="relative w-full max-w-[1200px] mx-auto">
        <div className="relative w-full aspect-video">
          <iframe
            src={getVideoUrl()}
            className="w-full h-full border-0"
            allowFullScreen
            onError={handleError}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        
        {/* Server Select - moved below video */}
        <div className="mt-4 px-4">
          <ServerSelect
            currentServer={currentProvider}
            onServerChange={setCurrentProvider}
          />
        </div>
      </div>

      {/* Episodes Grid (if TV show) */}
      {type === 'tv' && show && initialSeason && (
        <div className="flex-1 p-4 bg-black">
          <EpisodeGrid show={show} initialSeason={initialSeason} />
        </div>
      )}
    </div>
  );
} 