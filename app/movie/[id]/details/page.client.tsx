'use client';

import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/use-watchlist';
import { Bookmark, Play, Youtube } from 'lucide-react';
import Link from 'next/link';

interface MovieActionsProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
  };
  trailerId?: string;
}

export function MovieActions({ movie, trailerId }: MovieActionsProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const isBookmarked = isInWatchlist(movie.id);

  const handleBookmark = () => {
    if (isBookmarked) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({
        id: movie.id,
        media_type: 'movie'
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
      <Button size="lg" className="w-full sm:w-auto min-w-[160px]" asChild>
        <Link href={`/movie/${movie.id}`}>
          <Play className="h-5 w-5 mr-2" />
          Watch Now
        </Link>
      </Button>
      
      {trailerId && (
        <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]" asChild>
          <Link
            href={`https://www.youtube.com/watch?v=${trailerId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Youtube className="h-5 w-5 mr-2" />
            Watch Trailer
          </Link>
        </Button>
      )}

      <Button 
        size="lg" 
        variant="secondary"
        className="w-full sm:w-auto min-w-[160px]"
        onClick={handleBookmark}
      >
        <Bookmark className={`h-5 w-5 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
        {isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
      </Button>
    </div>
  );
}