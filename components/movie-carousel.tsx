'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTMDBImageUrl } from '@/lib/tmdb';
import type { Movie } from '@/types/tmdb';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Play, Info } from 'lucide-react';

interface MovieCarouselProps {
  movies: Array<Movie & { media_type: 'movie' }>;
}

export function MovieCarousel({ movies }: MovieCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(8000);

  const startAutoplay = useCallback((initialDelay?: number) => {
    if (!api) return;
    
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const delay = initialDelay ?? 8000;
    
    // Start new interval
    intervalRef.current = setInterval(() => {
      api.scrollNext();
      lastTimeRef.current = Date.now();
      remainingTimeRef.current = 8000;
    }, delay);

    lastTimeRef.current = Date.now();
  }, [api]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastTimeRef.current;
      remainingTimeRef.current = Math.max(0, 8000 - elapsedTime);
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay(remainingTimeRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startAutoplay();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAutoplay();
    };
  }, [api, startAutoplay, stopAutoplay]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => stopAutoplay()}
      onMouseLeave={() => startAutoplay(8000)}
    >
      <Carousel
        opts={{
          loop: true
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {movies.map((movie) => (
            <CarouselItem key={movie.id}>
              <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg">
                <Image
                  src={getTMDBImageUrl(movie.backdrop_path, 'original')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background from-10% via-background/80 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center w-full px-4 md:px-6 space-y-3 md:space-y-4 max-h-full overflow-hidden">
                    {movie.images?.logos?.length ? (
                      <div className="relative h-14 sm:h-20 md:h-28 lg:h-32 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] mx-auto">
                        <Image
                          src={getTMDBImageUrl(
                            movie.images.logos
                              .filter(logo => logo.iso_639_1 === 'en')
                              .sort((a, b) => b.vote_average - a.vote_average)[0]?.file_path ||
                            movie.images.logos.sort((a, b) => b.vote_average - a.vote_average)[0].file_path
                          )}
                          alt={movie.title}
                          fill
                          className="object-contain drop-shadow-lg"
                          priority
                        />
                      </div>
                    ) : (
                      <h2 className="text-xl md:text-4xl font-bold tracking-tight line-clamp-2 md:line-clamp-2 drop-shadow-lg">
                        {movie.title}
                      </h2>
                    )}
                    
                    <p className="hidden sm:block text-sm md:text-base text-muted-foreground line-clamp-2 md:line-clamp-3 max-w-2xl mx-auto">
                      {movie.overview}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                      <Button 
                        asChild 
                        size="sm" 
                        className="w-[160px] sm:w-auto sm:min-w-[140px] h-8 sm:h-10"
                      >
                        <Link href={`/movie/${movie.id}`}>
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Watch Now
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        asChild 
                        size="sm"
                        className="w-[160px] sm:w-auto sm:min-w-[140px] h-8 sm:h-10"
                      >
                        <Link href={`/movie/${movie.id}/details`}>
                          <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          More Info
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex absolute left-2 md:left-4 bg-background/80 hover:bg-background/90" />
        <CarouselNext className="hidden sm:flex absolute right-2 md:right-4 bg-background/80 hover:bg-background/90" />
      </Carousel>
    </div>
  );
}