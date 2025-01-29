import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';
import type { TrendingResponse } from '@/types/tmdb';
import { PaginationControl } from '@/components/pagination';

interface TrendingPageProps {
  searchParams: { page?: string };
}

export const revalidate = 0;

export default function TrendingPage({ searchParams }: TrendingPageProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4 mt-4 md:mt-6 lg:mt-8 pl-4 sm:pl-6 md:pl-8 lg:pl-10">Trending</h1>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
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
    <div>
      <MovieGrid items={trendingWithType} />
      <div className="mt-6 pb-20">
        <Suspense fallback={
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }>
          <PaginationControl
            currentPage={currentPage}
            totalPages={Math.min(trending.total_pages, 500)}
            baseUrl="/trending"
          />
        </Suspense>
      </div>
    </div>
  );
} 