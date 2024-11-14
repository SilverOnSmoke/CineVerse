'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTMDBImageUrl } from '@/lib/tmdb';
import type { Movie } from '@/types/tmdb';
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
  return (
    <div className="relative w-full">
      <Carousel opts={{ loop: true }}>
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
                    <h2 className="text-xl md:text-4xl font-bold tracking-tight line-clamp-2 md:line-clamp-2">
                      {movie.title}
                    </h2>
                    
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