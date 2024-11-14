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
  return (
    <Suspense>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">TV Shows</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <TVShowList searchParams={searchParams} />
        </Suspense>
      </div>
    </Suspense>
  );
}

async function TVShowList({ searchParams }: { searchParams: { page?: string } }) {
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
    <div>
      <MovieGrid items={showsWithType} />
      <PaginationControl
        currentPage={currentPage}
        totalPages={Math.min(shows.total_pages, 500)}
        baseUrl="/tv"
      />
    </div>
  );
} 