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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Movies</h1>
      <Suspense fallback={<div>Loading...</div>}>
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