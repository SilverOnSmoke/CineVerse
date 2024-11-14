import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { TVShow } from '@/types/tmdb';

const PaginationControl = dynamic(() => import('@/components/pagination').then(mod => mod.PaginationControl), {
  ssr: false
});

interface TVShowsPageProps {
  searchParams: { page?: string };
}

interface TVShowResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export default function TVShowsPage({ searchParams }: TVShowsPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">TV Shows</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <TVShowList searchParams={searchParams} />
      </Suspense>
    </div>
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
    <Suspense>
      <div>
        <MovieGrid items={showsWithType} />
        <PaginationControl
          currentPage={currentPage}
          totalPages={Math.min(shows.total_pages, 500)}
          baseUrl="/tv"
        />
      </div>
    </Suspense>
  );
} 