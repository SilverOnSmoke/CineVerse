'use client';

import { useEffect, useState } from 'react';
import NetPlayer from 'netplayer';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NativePlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

interface StreamingData {
  source: string;
  subtitles: Array<{
    url: string;
    lang: string;
  }>;
  error?: string;
  message?: string;
}

export function NativePlayer({ tmdbId, type, season, episode }: NativePlayerProps) {
  const [streamData, setStreamData] = useState<StreamingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStreamingData() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          type,
          tmdbId,
          ...(season && { season: season.toString() }),
          ...(episode && { episode: episode.toString() }),
        });

        const response = await fetch(`/api/stream?${params}`);
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch streaming data');
        }

        setStreamData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching stream:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStreamingData();
  }, [tmdbId, type, season, episode]);

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-black/90 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !streamData) {
    return (
      <div className="w-full aspect-video bg-black/90 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-500">Failed to load video</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Find English subtitles if available and ensure it's the first in the list
  const defaultSubtitle = streamData?.subtitles.find(
    sub => sub.lang.toLowerCase() === 'english' || sub.lang.toLowerCase() === 'eng' || sub.lang.toLowerCase() === 'en'
  );

  // Reorder subtitles to put English first if it exists
  const orderedSubtitles = defaultSubtitle 
    ? [defaultSubtitle, ...streamData.subtitles.filter(sub => sub !== defaultSubtitle)]
    : streamData.subtitles;

  return (
    <div className="w-full aspect-video">
      <NetPlayer
        sources={[
          {
            file: streamData.source,
            label: 'Auto',
          },
        ]}
        subtitles={orderedSubtitles.map((sub) => ({
          lang: sub.lang.toLowerCase(),
          language: sub.lang,
          file: sub.url,
          default: sub === defaultSubtitle, // Set default property for English subtitles
        }))}
        className="w-full h-full"
        autoPlay
      />
    </div>
  );
}

// Add default export
export default NativePlayer; 
