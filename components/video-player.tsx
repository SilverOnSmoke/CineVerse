"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ServerSelect } from '@/components/server-select';
import { EpisodeGrid } from '@/components/episode-grid';
import type { TVShowDetails, TVShowSeason } from '@/types/tmdb';
import { ErrorBoundary } from '@/components/error-boundary';

interface VideoPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  show?: TVShowDetails;
  initialSeason?: TVShowSeason;
}

const PROVIDERS = {
  CINEVERSE: 'CineVerse (Main)',
  EMBED_SU: 'Server 1 (Embed SU)',
  VIDLINK: 'Server 2 (VidLink)',
  AUTOEMBED: 'Server 3 (AutoEmbed)',
  VIDSRC: 'Server 4 (VidSrc)',
} as const;

// Create a loading component
function VideoPlayerLoading() {
  return (
    <div className="w-full aspect-video bg-black/90 flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">Loading player...</p>
      </div>
    </div>
  );
}

// Dynamically import the video player component
export function VideoPlayer(props: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<keyof typeof PROVIDERS>('CINEVERSE');
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <VideoPlayerLoading />;
  }

  const getVideoUrl = () => {
    switch (currentProvider) {
      case 'CINEVERSE':
        return props.type === 'movie'
          ? `https://streamnest-htje.onrender.com/embed/movie/${props.tmdbId}`
          : `https://streamnest-htje.onrender.com/embed/tv/${props.tmdbId}/${props.season}/${props.episode}${props.type === 'tv' ? '?nextbutton=true' : ''}`;
      
      case 'EMBED_SU':
        return props.type === 'movie'
          ? `https://embed.su/embed/movie/${props.tmdbId}`
          : `https://embed.su/embed/tv/${props.tmdbId}/${props.season}/${props.episode}`;
      
      case 'VIDLINK':
        return props.type === 'movie'
          ? `https://vidlink.pro/movie/${props.tmdbId}`
          : `https://vidlink.pro/tv/${props.tmdbId}/${props.season}/${props.episode}`;
      
      case 'AUTOEMBED':
        return props.type === 'movie'
          ? `https://player.autoembed.cc/embed/movie/${props.tmdbId}`
          : `https://player.autoembed.cc/embed/tv/${props.tmdbId}/${props.season}/${props.episode}`;
      
      case 'VIDSRC':
        return props.type === 'movie'
          ? `https://vidsrc.to/embed/movie/${props.tmdbId}`
          : `https://vidsrc.to/embed/tv/${props.tmdbId}/${props.season}/${props.episode}`;
      
      default:
        return '';
    }
  };

  const handleError = () => {
    const providers: Array<keyof typeof PROVIDERS> = ['CINEVERSE', 'EMBED_SU', 'VIDLINK', 'AUTOEMBED', 'VIDSRC'];
    const currentIndex = providers.indexOf(currentProvider);
    const nextProvider = providers[currentIndex + 1];

    if (nextProvider) {
      setCurrentProvider(nextProvider);
      toast({
        title: "Switching Server",
        description: "Trying alternative server...",
      });
    } else {
      setHasError(true);
      toast({
        title: "Content Unavailable",
        description: "We're sorry, but this content is temporarily unavailable. Please try again later or contact support if the issue persists.",
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
            We're sorry, but this content is temporarily unavailable.<br />
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col pt-16 pb-16">
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
        
        <div className="mt-4 px-4">
          <ServerSelect
            currentServer={currentProvider}
            onServerChange={setCurrentProvider}
          />
        </div>
      </div>

      {props.type === 'tv' && props.show && props.initialSeason && (
        <div className="flex-1 p-4 bg-black">
          <EpisodeGrid show={props.show} initialSeason={props.initialSeason} />
        </div>
      )}
    </div>
  );
}