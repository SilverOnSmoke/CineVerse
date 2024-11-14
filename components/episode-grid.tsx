'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Loader2 } from 'lucide-react';
import { getTMDBImageUrl } from '@/lib/tmdb';
import type { TVShowDetails, TVShowSeason } from '@/types/tmdb';

interface EpisodeGridProps {
  show: TVShowDetails;
  initialSeason: TVShowSeason;
}

export function EpisodeGrid({ show, initialSeason }: EpisodeGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSeason = Number(searchParams.get('season')) || 1;
  const currentEpisode = Number(searchParams.get('episode')) || 1;
  
  const [seasonData, setSeasonData] = useState<TVShowSeason>(initialSeason);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSeasonData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tv/${show.id}/season/${currentSeason}`);
        const data = await response.json();
        setSeasonData(data);
      } catch (error) {
        console.error('Failed to fetch season data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentSeason !== seasonData.season_number) {
      fetchSeasonData();
    }
  }, [currentSeason, show.id, seasonData.season_number]);

  const handleSeasonChange = async (value: string) => {
    // Update URL immediately
    router.push(`/tv/${show.id}?season=${value}&episode=1`, { scroll: false });
    
    // Fetch new season data immediately
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tv/${show.id}/season/${value}`);
      const data = await response.json();
      setSeasonData(data);
    } catch (error) {
      console.error('Failed to fetch season data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEpisodeClick = (episodeNumber: number) => {
    router.push(`/tv/${show.id}?season=${currentSeason}&episode=${episodeNumber}`, { scroll: false });
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Season Selector */}
      <Select
        value={currentSeason.toString()}
        onValueChange={handleSeasonChange}
      >
        <SelectTrigger className="w-[180px] mb-6 bg-transparent border-gray-800">
          <SelectValue>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              `Season ${currentSeason}`
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: show.number_of_seasons }, (_, i) => i + 1).map((season) => (
            <SelectItem key={season} value={season.toString()}>
              Season {season}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Episode Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="relative aspect-video rounded overflow-hidden bg-gray-900/50 animate-pulse"
            />
          ))
        ) : (
          // Actual episodes
          seasonData.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handleEpisodeClick(episode.episode_number)}
              className={`
                relative aspect-video rounded overflow-hidden group
                hover:ring-2 hover:ring-primary transition-all
                ${currentEpisode === episode.episode_number ? 'ring-2 ring-primary' : 'ring-1 ring-gray-800'}
              `}
            >
              {/* Episode Thumbnail */}
              <div className="absolute inset-0">
                {episode.still_path ? (
                  <Image
                    src={getTMDBImageUrl(episode.still_path)}
                    alt={episode.name}
                    fill
                    className="object-cover"
                    priority={episode.episode_number <= 6} // Prioritize loading first 6 episodes
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-700" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
              {/* Episode Info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-left">
                <p className="text-xs text-gray-400">Episode {episode.episode_number}</p>
                <p className="text-sm text-white truncate">{episode.name}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 