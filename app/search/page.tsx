export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { SearchResult } from '@/types/tmdb';
import { Loader2 } from 'lucide-react';

interface SearchPageProps {
  searchParams: { 
    q: string;
    type?: 'all' | 'movie' | 'tv';
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q;
  const type = searchParams.type || 'all';

  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Enter a search term to find movies and TV shows</p>
      </div>
    );
  }

  const searchResults = await fetchTMDBApi<SearchResult>('/search/multi', {
    query,
    include_adult: 'false',
  });

  // Filter results based on type
  const filteredResults = searchResults.results.filter(item => {
    if (type === 'all') return item.media_type === 'movie' || item.media_type === 'tv';
    return item.media_type === type;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Search Results for &quot;{query}&quot;
        </h1>
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          {filteredResults.length > 0 ? (
            <MovieGrid items={filteredResults} />
          ) : (
            <p className="text-muted-foreground text-center py-12">No results found</p>
          )}
        </Suspense>
      </div>
    </div>
  );
}