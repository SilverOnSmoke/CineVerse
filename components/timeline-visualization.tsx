'use client';

import { Movie } from '@/types/tmdb';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Calendar, RotateCw, Move } from 'lucide-react';
import Link from 'next/link';

interface TimelineVisualizationProps {
  movies: Movie[];
}

export function TimelineVisualization({ movies }: TimelineVisualizationProps) {
  const [sortOrder, setSortOrder] = useState<'release' | 'chronological'>('release');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Sort movies using useMemo to avoid recalculating on every render
  const sortedMovies = useMemo(() => {
    // Make a copy of the movies array to avoid mutating the original
    const moviesCopy = [...(movies || [])];
    
    if (sortOrder === 'release') {
      // Sort by release date (theatrical/TV air date)
      return moviesCopy.sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateA - dateB;
      });
    } else {
      // Sort by in-universe chronological order
      // This would ideally come from an API field, but we can approximate using:
      // 1. Original title numbering if available (e.g., "Star Wars: Episode I")
      // 2. Fall back to release date if no better data
      
      return moviesCopy.sort((a, b) => {
        // Try to extract episode numbers from titles (e.g., "Episode I", "Chapter 2")
        const getEpisodeNumber = (title: string) => {
          // Check for Roman numerals (I, II, III, IV, etc.)
          const romanMatch = title.match(/Episode\s+(I{1,3}|IV|V|VI{1,3}|IX|X)/i);
          if (romanMatch) {
            const roman = romanMatch[1].toUpperCase();
            // Convert Roman numeral to number
            const romanToNum: Record<string, number> = { 
              'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 
              'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 
            };
            return romanToNum[roman] || 0;
          }
          
          // Check for numeric episodes (Episode 1, Chapter 2, etc.)
          const numMatch = title.match(/(?:Episode|Chapter|Part)\s+(\d+)/i);
          if (numMatch) {
            return parseInt(numMatch[1], 10);
          }
          
          // Check for simple numbering in the title (e.g., "Movie Title 2")
          const endNumberMatch = title.match(/\s+(\d+)$/);
          if (endNumberMatch) {
            return parseInt(endNumberMatch[1], 10);
          }
          
          return 0;
        };
        
        const numA = getEpisodeNumber(a.title);
        const numB = getEpisodeNumber(b.title);
        
        // If we found episode numbers for both movies, use those
        if (numA > 0 && numB > 0) {
          return numA - numB;
        }
        
        // Otherwise fall back to release date
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateA - dateB;
      });
    }
  }, [movies, sortOrder]);
  
  // Get the year range for non-empty movie collections
  const firstYear = sortedMovies.length && sortedMovies[0]?.release_date 
    ? new Date(sortedMovies[0].release_date).getFullYear() 
    : null;
    
  const lastYear = sortedMovies.length && sortedMovies[sortedMovies.length - 1]?.release_date 
    ? new Date(sortedMovies[sortedMovies.length - 1].release_date).getFullYear() 
    : null;
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'release' ? 'chronological' : 'release');
    
    // Reset scroll position when changing sort order
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollLeft = 0;
    }
  };

  // Mouse & Touch Event Handlers for drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - timelineContainerRef.current.offsetLeft);
    setScrollLeft(timelineContainerRef.current.scrollLeft);
    timelineContainerRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!timelineContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - timelineContainerRef.current.offsetLeft);
    setScrollLeft(timelineContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (timelineContainerRef.current) {
      timelineContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - timelineContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    timelineContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !timelineContainerRef.current) return;
    
    const x = e.touches[0].pageX - timelineContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    timelineContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Add event listeners to document for mouse/touch up events
  useEffect(() => {
    const handleMouseUpOutside = () => {
      if (isDragging) {
        setIsDragging(false);
        if (timelineContainerRef.current) {
          timelineContainerRef.current.style.cursor = 'grab';
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUpOutside);
    document.addEventListener('touchend', handleMouseUpOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUpOutside);
      document.removeEventListener('touchend', handleMouseUpOutside);
    };
  }, [isDragging]);

  // If no movies, return empty state
  if (!movies?.length) {
    return null;
  }

  return (
    <div className="w-full space-y-2 xs:space-y-4">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
        <h3 className="text-base xs:text-lg font-semibold">
          Timeline 
          {firstYear && lastYear && (
            <span className="ml-2 text-xs xs:text-sm font-normal text-muted-foreground">
              {firstYear} - {lastYear}
            </span>
          )}
        </h3>
      </div>
      
      <div 
        className="w-full overflow-hidden cursor-grab relative"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Timeline line */}
        <div className="absolute h-1 bg-primary/20 top-6 left-0 right-0 z-0" />
        
        <div 
          ref={timelineContainerRef}
          className="relative overflow-x-auto pb-6 scrollbar-hide"
          style={{ 
            overflowX: 'auto', 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          {/* Timeline items - using CSS grid with fixed width to ensure even spacing */}
          <div 
            className="grid grid-flow-col auto-cols-fr gap-0 w-full"
            style={{ 
              minWidth: `calc(100% - 20px)`,
              width: `max(100%, ${sortedMovies.length * 180}px)`
            }}
            ref={scrollRef}
          >
            {sortedMovies.map((movie, index) => {
              const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
              const year = releaseDate ? releaseDate.getFullYear() : 'TBA';
              const formattedDate = releaseDate 
                ? releaseDate.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) 
                : 'TBA';
                
              return (
                <div 
                  key={movie.id} 
                  className="flex flex-col items-center px-1"
                >
                  <Badge variant="outline" className="mb-2 xs:mb-3 text-xs px-2 py-0.5">
                    {index + 1}
                  </Badge>
                  <div className="w-2 h-2 xs:w-3 xs:h-3 rounded-full bg-primary z-10 relative" />
                  <div className="mt-2 xs:mt-3 text-center w-full px-1">
                    <Link href={`/movie/${movie.id}`}>
                      <h4 className="font-medium text-xs xs:text-sm hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {movie.title}
                      </h4>
                    </Link>
                    <div className="flex items-center justify-center text-[10px] xs:text-xs text-muted-foreground mt-1">
                      <Calendar className="h-2 w-2 xs:h-3 xs:w-3 mr-0.5 xs:mr-1 flex-shrink-0" />
                      <span className="truncate">{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}