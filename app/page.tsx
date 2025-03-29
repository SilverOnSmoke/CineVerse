import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Loader2, FilmIcon, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home | CineVerse",
};

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { MovieCarousel } from '@/components/movie-carousel';
import { fetchTMDBApi } from '@/lib/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import type { MovieResponse, MovieDetails } from '@/types/tmdb';
import { BookmarkIcon } from '@/components/bookmark-icon';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ErrorFallback() {
  return <div>Error loading content</div>;
}

async function MovieSection({ type }: { type: string }) {
  try {
    const movies = await fetchTMDBApi<MovieResponse>(type);
    const moviesWithType = movies.results.map(movie => ({
      ...movie,
      media_type: 'movie' as const
    }));

    return (
      <Carousel
       opts={{
         align: 'start',
         slidesToScroll: 'auto',
         containScroll: 'trimSnaps'
       }}
       className="pb-16"
     >
        <CarouselContent className="-ml-4">
          {moviesWithType.map((movie) => (
            <CarouselItem key={movie.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <div className="relative group">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  <Image
                    src={getTMDBImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                  <BookmarkIcon item={movie} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col sm:flex-row gap-2 p-2">
                      <Button size="sm" asChild>
                        <Link href={`/movie/${movie.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Link>
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/movie/${movie.id}/details`}>
                          <Info className="h-4 w-4 mr-2" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 px-2 text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 md:line-clamp-1 hover:text-primary transition-colors">
                  {movie.title}
                </h3>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1" />
        <CarouselNext className="right-1" />
      </Carousel>
    );
  } catch (error) {
    console.error(`Error loading movies:`, error);
    return <ErrorFallback />;
  }
}

export default async function Home() {
  return (
    <Suspense>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense fallback={<LoadingFallback />}>
          <MovieCarousel
            movies={await fetchTMDBApi<MovieResponse>('/trending/movie/day')
              .then(async data => {
                const moviePromises = data.results.map(async movie => {
                  const details = await fetchTMDBApi<MovieDetails>(`/movie/${movie.id}`, {
                    append_to_response: 'images'
                  });
                  return {
                    ...movie,
                    media_type: 'movie' as const,
                    images: details.images
                  };
                });
                return Promise.all(moviePromises);
              })
              .catch(() => [])}
          />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <section>
            <h2 className="text-2xl font-bold mb-4 pl-4 sm:pl-6 md:pl-8 lg:pl-10">Popular Movies</h2>
            <MovieSection type="/movie/popular" />
          </section>
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <section>
            <h2 className="text-2xl font-bold mb-4 pl-4 sm:pl-6 md:pl-8 lg:pl-10">Top Rated</h2>
            <MovieSection type="/movie/top_rated" />
          </section>
        </Suspense>
        
        {/* Collections Card */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-xl shadow-lg border border-primary/20 bg-gradient-to-r from-background to-primary/5 backdrop-blur-sm hover:shadow-primary/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-30"></div>
              <div className="relative z-10 px-6 py-8 md:px-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Discover Film Collections</h2>
                  <p className="text-muted-foreground max-w-md">
                    Explore complete film franchises and series. From epic sagas to beloved trilogies, view comprehensive collections with timelines, stats, and more.
                  </p>
                  <Button size="lg" className="group" asChild>
                    <Link href="/collections">
                      Explore Collections
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
                <div className="flex-shrink-0 w-32 md:w-40 h-32 md:h-40 relative rounded-lg overflow-hidden shadow-md">
                  <div className="relative w-full h-full transform transition duration-300 hover:scale-105">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
                      <div className="relative rounded overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20"></div>
                      </div>
                      <div className="relative rounded overflow-hidden">
                        <div className="absolute inset-0 bg-primary/30"></div>
                      </div>
                      <div className="relative rounded overflow-hidden">
                        <div className="absolute inset-0 bg-primary/40"></div>
                      </div>
                      <div className="relative rounded overflow-hidden">
                        <div className="absolute inset-0 bg-primary/50"></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FilmIcon className="h-12 w-12 text-primary/90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Suspense>
  );
}
