'use client';

import { Bookmark } from 'lucide-react';
import { useWatchlist } from '@/hooks/use-watchlist';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface BookmarkIconProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    media_type: 'movie' | 'tv';
  };
  className?: string;
}

export function BookmarkIcon({ item, className }: BookmarkIconProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimisticBookmarked, setOptimisticBookmarked] = useState<boolean | null>(null);

  const isBookmarked = optimisticBookmarked ?? isInWatchlist(item.id);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return; // Prevent concurrent operations

    setIsProcessing(true);
    try {
      // Update optimistic state immediately
      setOptimisticBookmarked(!isBookmarked);

      if (isBookmarked) {
        await removeFromWatchlist(item.id);
      } else {
        // Only save ID and media_type
        await addToWatchlist({
          id: item.id,
          media_type: item.media_type
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticBookmarked(null);
      console.error('Failed to update watchlist:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    item,
    isBookmarked,
    isProcessing,
    addToWatchlist,
    removeFromWatchlist,
  ]);

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={cn(
        'absolute top-3 right-3 z-10',
        'rounded-full p-3 sm:p-2.5',
        'bg-black/60 hover:bg-black/70 active:bg-black/80 backdrop-blur-sm',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        'touch-manipulation',
        'tap-highlight-transparent',
        isProcessing && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
      // Improved touch target size
      style={{
        minWidth: '44px',
        minHeight: '44px',
      }}
    >
      <Bookmark
        className={cn(
          'w-6 h-6 sm:w-5 sm:h-5',
          'transform-gpu transition-all duration-200',
          'active:scale-90',
          'group-hover:scale-110',
          isBookmarked ? 'fill-white text-white' : 'text-white',
          isProcessing && 'animate-pulse'
        )}
        strokeWidth={2}
        aria-hidden="true"
      />
    </button>
  );
}