import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { Movie, TrendingResponse } from '@/types/tmdb';

const PaginationControl = dynamic(() => import('@/components/pagination').then(mod => mod.PaginationControl), {
  ssr: false
});

interface MoviesPageProps {
  searchParams: { page?: string };
}

interface MovieResponse extends Omit<TrendingResponse, 'results'> {
  results: Movie[];
}

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

// Separate component for data fetching
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
    <Suspense>
      <div>
        <MovieGrid items={moviesWithType} />
        <PaginationControl
          currentPage={currentPage}
          totalPages={Math.min(movies.total_pages, 500)}
          baseUrl="/movies"
        />
      </div>
    </Suspense>
  );
} 