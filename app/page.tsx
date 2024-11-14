import { Suspense } from 'react';
import { MovieCarousel } from '@/components/movie-carousel';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { Movie, MovieResponse } from '@/types/tmdb';

function ErrorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Error Loading Content</h2>
        <p className="text-muted-foreground">
          Please check your API configuration and try again.
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <div className="animate-pulse">Loading...</div>;
}

async function MovieSection({ type, title }: { type: string; title: string }) {
  try {
    const movies = await fetchTMDBApi<MovieResponse>(type);
    const moviesWithType = movies.results.map(movie => ({
      ...movie,
      media_type: 'movie' as const
    }));

    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <MovieGrid items={moviesWithType} />
      </section>
    );
  } catch (error) {
    console.error(`Error loading ${title}:`, error);
    return <ErrorFallback />;
  }
}

export default async function Home() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<LoadingFallback />}>
        {/* Trending Movies Carousel */}
        <MovieCarousel
          movies={await fetchTMDBApi<MovieResponse>('/trending/movie/day')
            .then(data => data.results.map(movie => ({ ...movie, media_type: 'movie' as const })))
            .catch(() => [])}
        />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <MovieSection type="/movie/popular" title="Popular Movies" />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <MovieSection type="/movie/top_rated" title="Top Rated" />
      </Suspense>
    </div>
  );
}