import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { TVShow } from '@/types/tmdb';
import { PaginationControl } from '@/components/pagination';

interface TVShowsPageProps {
  searchParams: { page?: string };
}

interface TVShowResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
  const currentPage = Number(searchParams.page) || 1;
  
  const shows = await fetchTMDBApi<TVShowResponse>('/discover/tv', {
    page: currentPage.toString(),
    sort_by: 'popularity.desc',
  });

  const showsWithType = shows.results.map(show => ({
    ...show,
    media_type: 'tv' as const
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">TV Shows</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <MovieGrid items={showsWithType} />
          <Suspense>
            <PaginationControl
              currentPage={currentPage}
              totalPages={Math.min(shows.total_pages, 500)}
              baseUrl="/tv"
            />
          </Suspense>
        </div>
      </Suspense>
    </div>
  );
} 