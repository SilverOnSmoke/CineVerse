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

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Movies</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <MovieGrid items={moviesWithType} />
          <PaginationControl
            currentPage={currentPage}
            totalPages={Math.min(movies.total_pages, 500)}
            baseUrl="/movies"
          />
        </div>
      </Suspense>
    </div>
  );
} 