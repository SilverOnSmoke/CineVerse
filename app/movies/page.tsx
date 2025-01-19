import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { Movie, TrendingResponse } from '@/types/tmdb';
import { PaginationControl } from '@/components/pagination';

interface MoviesPageProps {
  searchParams: { page?: string };
}

interface MovieResponse extends Omit<TrendingResponse, 'results'> {
  results: Movie[];
}

export const revalidate = 0;

export default function MoviesPage({ searchParams }: MoviesPageProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4 mt-4 md:mt-6 lg:mt-8 pl-4 sm:pl-6 md:pl-8 lg:pl-10">Movies</h1>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <MovieList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function MovieList({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  
  const movies = await fetchTMDBApi<MovieResponse>('/discover/movie', {
    page: currentPage.toString(),
    sort_by: 'popularity.desc',
  });

  const moviesWithType = movies.results.map(movie => ({
    ...movie,
    media_type: 'movie' as const
  }));

  return (
    <div>
      <MovieGrid items={moviesWithType} />
      <div className="mt-6">
        <Suspense fallback={<div>Loading pagination...</div>}>
          <PaginationControl
            currentPage={currentPage}
            totalPages={Math.min(movies.total_pages, 500)}
            baseUrl="/movies"
          />
        </Suspense>
      </div>
    </div>
  );
} 