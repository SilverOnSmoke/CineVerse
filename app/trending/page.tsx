import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { TrendingResponse } from '@/types/tmdb';

const PaginationControl = dynamic(() => import('@/components/pagination').then(mod => mod.PaginationControl), {
  ssr: false
});

interface TrendingPageProps {
  searchParams: { page?: string };
}

export default function TrendingPage({ searchParams }: TrendingPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trending</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <TrendingList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function TrendingList({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  
  const trending = await fetchTMDBApi<TrendingResponse>('/trending/all/week', {
    page: currentPage.toString(),
  });

  const trendingWithType = trending.results.map(item => {
    if (item.media_type === 'movie') {
      return { ...item, media_type: 'movie' as const };
    } else {
      return { ...item, media_type: 'tv' as const };
    }
  });

  return (
    <Suspense>
      <div>
        <MovieGrid items={trendingWithType} />
        <PaginationControl
          currentPage={currentPage}
          totalPages={Math.min(trending.total_pages, 500)}
          baseUrl="/trending"
        />
      </div>
    </Suspense>
  );
} 